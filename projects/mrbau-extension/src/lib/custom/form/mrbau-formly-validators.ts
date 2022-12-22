import { FormControl, ValidationErrors } from '@angular/forms';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { ISelectFormOptions } from '../services/mrbau-conventions.service';


export const PAYMENT_DAYS_VALID_RANGE_MIN = 1;
export const PAYMENT_DAYS_VALID_RANGE_MAX = 300;

export function requiredValidationMessage(err, field) {
  err;field;
  return 'Dieses Feld ist erforderlich.';
}

export function maxlengthValidationMessage(err, field) {
  err;
  return `Die Anzahl der Zeichen muss kleiner gleich ${field.props.maxLength} sein.`;
}

export function minlengthValidationMessage(err, field) {
  err;
  return `Die Anzahl der Zeichen muss mindestens ${field.props.minLength} betragen.`;
}

export function minValidationMessage(err, field) {
  err;
  return `Der Wert muss mindestens ${field.props.min} betragen.`;
}

export function maxValidationMessage(err, field) {
  err;
  return `Der Wert muss kleiner gleich ${field.props.max} sein.`;
}

export function notAValidValueValidationMessage(err, field) {
  err;
  return `'${field.formControl.value}' ist keine gültige Angabe für dieses Feld.`;
}

export function autocompleteNotValidValidationMessage(err, field) {
  err;
  if (field.formControl.value == null)
  {
    return 'Wählen Sie einen Wert aus der Vorschlagsliste.';
  }
  const value = typeof field.formControl.value === 'string' ? field.formControl.value : field.formControl.value.label;
  return `${value} ist ungültig - wählen Sie einen Wert aus der Vorschlagsliste.`;
}

export function netGrossTaxMismatchMessage(err, field) {
  field;
  return `Netto, Brutto und Steuersatz stimmen nicht überein (Diff. ${err}).`;
}

function instanceOfSelectFormOptions(value: any): value is ISelectFormOptions {
  return !!value // truthy
  && typeof value !== 'string' // Not just string input in the autocomplete
  && typeof value !== 'number' // Not just a number
  && 'label' in value; // Has some qualifying property of Character type
}

export function autocompleteValueFromListValidator(control: FormControl, field: FormlyFieldConfig, options : any): ValidationErrors {
  field;
  options;
  let msg = 'error';

  if ( instanceOfSelectFormOptions(control.value) )
  {
    msg = null;
  }
  // if field is not required also allow empty values
  if (!(field.props.required === true) && (control.value == null ||  control.value == ""))
  {
    msg = null;
  }
  return (msg) ? {'autocomplete': true} : null;
}

export function germanParseFloat(value : string) : number {
  if (value == null)
    return undefined;
    value = value.replace( /[. ]/gi,'').replace(',','.');
  const valueFloat = parseFloat(value);
  if (isNaN(value as any) || isNaN(valueFloat))
  {
    return undefined;
  }
  return valueFloat;
}

export function germanDecimalValidatorAndConverter(control: FormControl, field: FormlyFieldConfig, options : any): ValidationErrors {
  control;
  field;
  options;
  if (!control.value)
    return null;

  const regExp : RegExp = (options.regExp) ? options.regExp : /[€. ]/gi;
  const fractionDigits : number =  (options.fractionDigits) ? (options.fractionDigits) : 2;

  let origValue = control.value as string;
  // convert/trim string for parseFloat
  let value = origValue.replace(regExp,'');
  // convert string to float
  const valueFloat = germanParseFloat(value);
  if (!valueFloat && valueFloat !== 0)
    return { 'pattern' : true };
  // convert value into
  value = valueFloat.toLocaleString('de-De', {minimumFractionDigits: fractionDigits, maximumFractionDigits: fractionDigits})
  if (value != origValue)
    control.setValue(value);
  return null;
}

export function netGrossTaxRateValidatorAndConverter(control: FormControl, field: FormlyFieldConfig, options : any): ValidationErrors {
  control;
  field;
  options;
  if (!control.value)
    return null;

  const netAmount = field.form.get('mrba:netAmount') ? germanParseFloat(field.form.get('mrba:netAmount').value) : undefined;
  const grossAmount = field.form.get('mrba:grossAmount') ? germanParseFloat(field.form.get('mrba:grossAmount').value) : undefined;
  const taxRate = field.form.get('mrba:taxRate') ? germanParseFloat(field.form.get('mrba:taxRate').value) : undefined;

  // autofill grossAmount
  if (grossAmount == null && netAmount != null && taxRate != null && field.form.get('mrba:grossAmount'))
  {
    const grossValue = netAmount * (1 + taxRate / 100);
    field.form.get('mrba:grossAmount').setValue(grossValue.toLocaleString('de-De'));
    return null;
  }

  // autofill netAmount
  if (grossAmount != null && netAmount == null && taxRate != null && field.form.get('mrba:netAmount'))
  {
    const netValue = grossAmount / (1 + taxRate / 100);
    field.form.get('mrba:netAmount').setValue(netValue.toLocaleString('de-De'));
    return null;
  }

  // autofill taxRate
  if (grossAmount != null && netAmount != null && taxRate == null && field.form.get('mrba:taxRate'))
  {
    const taxValue = (grossAmount / netAmount - 1) * 100;
    field.form.get('mrba:taxRate').setValue(taxValue.toLocaleString('de-De'));
    return null;
  }

  // ignore - not all values filled
  if (netAmount == null || grossAmount == null || taxRate == null)
  {
    return null;
  }

  // check if values are valid with 1 cent tolerance
  const diff = grossAmount - netAmount * (1 + taxRate / 100);
  if (Math.abs(diff) > 0.01)
  {
    //console.log(diff);
    return { 'netGrossTaxMismatch' : diff.toLocaleString('de-De') };
  }

  return null;
}

export function regexValidator(control: FormControl, field: FormlyFieldConfig, options): ValidationErrors {
  field;
  return !control.value || options.test(control.value) ? null : { 'pattern' : true };
}

export function dateFutureValidator(control: FormControl, field: FormlyFieldConfig, options = {}): ValidationErrors {
  control;
  field;
  let msg:string;
  let days : number = (options['days']) ? options['days'] : 0;
  let date: Date = new Date(control.value);
  date.setDate( date.getDate() - days);
  let now = new Date();
  if (date.getTime() < now.getTime())
  {
    msg = (days) ? `Der Tag muss ${options['days']} Tage in der Zukunft liegen.` : 'Der Tag muss in der Zukunft liegen.';
  }
  return (msg) ? { 'date-future': { message: msg } } : null;
}

export const REGEX_mrba_currencyIgnoreCharacters : RegExp = /[€. ]/gi;
export const REGEX_mrba_taxRateIgnoreCharacters : RegExp = /[%. ]/gi;

export const REGEX_mrba_datePattern : RegExp = /^(0?[1-9]|[12][0-9]|3[01])\.(0?[1-9]|1[012])\.(19|20)[0-9]{2}$/;
export const REGEX_mrba_nonNegative : RegExp = /^-?\d{1,3}(\.\d{3})*,\d{1}$/;
export const REGEX_mrba_germanDecimalOneDecimalPlace : RegExp = /^-?\d{1,3}(\.\d{3})*,\d{1}$/;
export const REGEX_mrba_germanDecimalTwoDecimalPlace : RegExp = /^-?\d{1,3}(\.\d{3})*,\d{2}$/;
export const REGEX_mrba_companyCountryCodeIso_3611_1_Alpha_2 : RegExp = /^[A-Z]{2}$/;

// custom constraints
export const REGEX_nonNegativeInt : RegExp = /^[0-9]+$/;
export const REGEX_Int : RegExp = /^[-]?\d+$/;
export const REGEX_germanDecimalTwoDecimalPlaceNotNegative : RegExp = /^\d{1,3}(\.\d{3})*,\d{2}$/;
