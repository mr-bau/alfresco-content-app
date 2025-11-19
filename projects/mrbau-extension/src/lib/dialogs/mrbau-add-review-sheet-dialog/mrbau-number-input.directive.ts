import { Directive, ElementRef, HostListener, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Directive({
  standalone: true,
  selector: '[mrbauNumberInput]',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MrbauNumberInputDirective),
      multi: true
    }
  ]
})
export class MrbauNumberInputDirective implements ControlValueAccessor {
  private onChange: (value: number | null) => void = () => {};
  private onTouched: () => void = () => {};

  constructor(private el: ElementRef<HTMLInputElement>) {}

  // Angular schreibt einen Wert ins Feld (z. B. form.setValue)
  writeValue(value: number | null): void {
    this.el.nativeElement.value = value != null ? this.formatNumber(value) : '';
  }

  registerOnChange(fn: (value: number | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  // ### Eingabe: nur "säubern" und numerischen Wert melden, aber nicht aggressiv umformatieren
  @HostListener('input', ['$event'])
  onInput(event: Event) {
    const input = event.target as HTMLInputElement | null;
    if (!input) return;

    const raw = input.value;

    // 1) Entferne alle Zeichen außer Ziffern, Punkt, Komma und Minus
    //    (So wird aus 'a22' -> '22', aus '1.2.3a' -> '1.2.3', etc.)
    const cleaned = raw.replace(/[^0-9\.,\-]/g, '');

    // 2) Falls nichts mehr übrig bleibt -> send null (kein gültiger number)
    if (!cleaned || cleaned === '-' || cleaned === ',' || cleaned === '.') {
      this.onChange(null);
      return;
    }

    // 3) Normiere: entferne Tausenderpunkte (alles außer letzten Komma/Punkt)
    //    Simpler Ansatz: erst alle Punkte entfernen, Komma -> Punkt transformieren
    //    Das behandelt deutsche Eingaben wie "1.234,56"
    const normalized = cleaned.replace(/\./g, '').replace(',', '.');

    // 4) Versuche zu parsen
    const parsed = parseFloat(normalized);

    if (!isNaN(parsed)) {
      // valid number -> an FormControl melden
      this.onChange(parsed);
      // wir vermeiden hier ein Setzen von input.value (keine Formatierung während Tippens)
    } else {
      // nicht parsebar -> null melden
      this.onChange(null);
    }
  }

  // ### Blur: formatieren (sichtbar) + touched melden
  @HostListener('blur')
  onBlur() {
    this.onTouched?.();

    const raw = this.el.nativeElement.value as string;
    const cleaned = raw.replace(/[^0-9\.,\-]/g, '');
    if (!cleaned || cleaned === '-' || cleaned === ',' || cleaned === '.') {
      // falls kein sinnvoller Wert -> leeren (oder leave as is, je nach gewünschtem Verhalten)
      this.el.nativeElement.value = '';
      return;
    }

    const normalized = cleaned.replace(/\./g, '').replace(',', '.');
    const parsed = parseFloat(normalized);

    if (!isNaN(parsed)) {
      this.el.nativeElement.value = this.formatNumber(parsed);
    } else {
      // wenn trotzdem kein number -> leer
      this.el.nativeElement.value = '';
    }
  }

  private formatNumber(value: number): string {
    // passe Locale/Optionen nach Bedarf an
    return new Intl.NumberFormat('de-DE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  }
}
