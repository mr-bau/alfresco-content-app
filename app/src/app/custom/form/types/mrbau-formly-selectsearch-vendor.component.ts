import { ChangeDetectionStrategy, Component,  OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ReplaySubject, Subject } from 'rxjs';
import { debounceTime, delay, filter, map, takeUntil, tap } from 'rxjs/operators';
import { IVendor } from '../../services/mrbau-conventions.service';
import { MrbauDbService } from '../../services/mrbau-db.service';
import { MatSelectChange } from '@angular/material/select';
import { FieldTypeConfig  } from '@ngx-formly/core';
import { FieldType  } from '@ngx-formly/material/form-field';
import { MrbauCommonService } from '../../services/mrbau-common.service';

 interface IVendorFormOption extends IVendor {
  value?: any;
  label?:string;
}

@Component({
  selector: 'aca-mrbau-formly-select-search-vendor',
  template: `
      <mat-select
        class="mat-select"
        [formControl]="formControl"
        [formlyAttributes]="field"
        [placeholder]="props.placeholder"
        [tabIndex]="props.tabindex"
        [required]="required"
        [compareWith]="props.compareWith"
        [multiple]="props.multiple"
        (selectionChange)="change($event)"
        [errorStateMatcher]="errorStateMatcher"
        [aria-label]="_getAriaLabel()"
        [aria-labelledby]="_getAriaLabelledby()"
        [disableOptionCentering]="props.disableOptionCentering"
        [typeaheadDebounceInterval]="props.typeaheadDebounceInterval"
        [panelClass]="props.panelClass"
        #singleSelect
          >
      <mat-option>
        <ngx-mat-select-search [formControl]="serverSideFilteringCtrl"
          [searching]="searching"
          [placeholderLabel]="to.placeholder"
          ></ngx-mat-select-search>
      </mat-option>
        <mat-option style="background-color:#F0FFF0;" [id]="id+' current'" *ngIf="(currentValue)" [value]="currentValue.value" [matTooltip]="currentValue?.label">{{currentValue?.label}}</mat-option>
        <mat-option *ngFor="let vendor of filteredServerSideVendors | async; let i = index;"
          [id]="id+' '+i"
          [matTooltip]="vendor.label"
          [value]="vendor">
          {{createVendorString(vendor)}}
        </mat-option>
      </mat-select>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MrbauFormlySelectSearchVendorComponent  extends FieldType<FieldTypeConfig> implements OnDestroy {
  /** control for filter for server side. */
  public serverSideFilteringCtrl: FormControl<string> = new FormControl<string>('');

  /** indicate search operation is in progress */
  public searching = false;

  /** list of banks filtered after simulating server side search */
  public  filteredServerSideVendors: ReplaySubject<IVendorFormOption[]> = new ReplaySubject<IVendorFormOption[]>(1);

  /** Subject that emits when the component has been destroyed. */
  protected _onDestroy = new Subject<void>();

  constructor(
    private mrbauDbService: MrbauDbService,
    private mrbauCommonService : MrbauCommonService
    ) {
    super();
  }

  override defaultOptions = {
    props: {
      compareWith(o1: any, o2: any) {
        return o1 === o2;
      },
    },
  };

  _getAriaLabelledby() {
    if (this.props.attributes?.['aria-labelledby']) {
      return this.props.attributes['aria-labelledby'] as string;
    }

    return this.formField?._labelId;
  }

  _getAriaLabel() {
    return this.props.attributes?.['aria-label'] as string;
  }

  change($event: MatSelectChange) {
    this.props.change?.(this.field, $event);
  }

  public createVendorString(v : IVendor) : string {
    let result = v['mrba:companyName'];
    result = (v['mrba:companyStreet']) ? result.concat(', ').concat(v['mrba:companyStreet']) : result;
    result = (v['mrba:companyCity']) ? result.concat(', ').concat(v['mrba:companyZipCode']).concat(' ').concat(v['mrba:companyCity'])  : result;
    result = (v['mrba:companyVatID']) ? result.concat(', ').concat(v['mrba:companyVatID']) : result;
    return result;
  }

  addValueLabel(d:IVendorFormOption) {
    d['value']=d['mrba:companyId'];
    d['label']=this.createVendorString(d);
  }

  currentValue:any = undefined;

  ngOnInit() {
    this.currentValue = undefined;
    if (this.formControl.value) {
      this.mrbauDbService.getVendor(Number(this.formControl.value)).subscribe(
        result => {
          if (typeof result === 'string') {
            this.mrbauCommonService.showError(result);
            return;
          }
          this.addValueLabel(result as IVendor);
          this.currentValue = result;
          this.formControl.updateValueAndValidity();
        },
        error => {
          //console.log(error);
          this.mrbauCommonService.showError(error.message);
        },
      );
    }

    // listen for search field value changes
    this.serverSideFilteringCtrl.valueChanges
      .pipe(
        filter(search => !!search),
        tap(() => this.searching = true),
        takeUntil(this._onDestroy),
        debounceTime(200),
        map((search) => {
          return this.mrbauDbService.searchVendors(search);
          })
        ,
        delay(200),
        takeUntil(this._onDestroy)
      )
      .subscribe((filteredBanks) => {
        filteredBanks.subscribe(data => {
          if (typeof data === 'string') {
            this.mrbauCommonService.showError(data);
            this.searching = false;
            return;
          }
          this.searching = false;
          (data as IVendor[]).forEach(d => this.addValueLabel(d));
          this.filteredServerSideVendors.next(data as IVendorFormOption[]);
        })
      });
  }

  ngOnDestroy() {
    this._onDestroy.next();
    this._onDestroy.complete();
  }
}
