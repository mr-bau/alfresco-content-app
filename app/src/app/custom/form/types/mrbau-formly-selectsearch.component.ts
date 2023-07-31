import { ChangeDetectionStrategy, Component,  OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ReplaySubject, Subject } from 'rxjs';
import { debounceTime, delay, filter, map, takeUntil, tap } from 'rxjs/operators';
import { IVendor } from '../../services/mrbau-conventions.service';
import { MrbauDbService } from '../../services/mrbau-db.service';
import { MatSelectChange } from '@angular/material/select';
import { FieldTypeConfig  } from '@ngx-formly/core';
import { FieldType  } from '@ngx-formly/material/form-field';


@Component({
  selector: 'aca-mrbau-formly-select-search',
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
        [value]="1"
        #singleSelect
          >
      <mat-option>
        <ngx-mat-select-search [formControl]="serverSideFilteringCtrl"
          [searching]="searching"
          [placeholderLabel]="to.placeholder"
          ></ngx-mat-select-search>
      </mat-option>
      <mat-option *ngFor="let vendor of filteredServerSideVendors | async; let i = index;"
        [id]="id+' '+i"
        [matTooltip]="createToolTipString(vendor)"
        [value]="vendor['mrba:companyId']">
        {{createVendorString(vendor)}}
      </mat-option>
      </mat-select>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MrbauFormlySelectSearchComponent  extends FieldType<FieldTypeConfig> implements OnDestroy {

  /** control for filter for server side. */
  public serverSideFilteringCtrl: FormControl<string> = new FormControl<string>('');

  /** indicate search operation is in progress */
  public searching = false;

  /** list of banks filtered after simulating server side search */
  public  filteredServerSideVendors: ReplaySubject<IVendor[]> = new ReplaySubject<IVendor[]>(1);

  /** Subject that emits when the component has been destroyed. */
  protected _onDestroy = new Subject<void>();

  constructor(private mrbauDbService: MrbauDbService) {
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

  public createToolTipString(v : IVendor) : string {
    return this.createVendorString(v);
  }

  public createVendorString(v : IVendor) : string {
    let result = v['mrba:companyName'];
    result = (v['mrba:companyStreet']) ? result.concat(', ').concat(v['mrba:companyStreet']) : result;
    result = (v['mrba:companyCity']) ? result.concat(', ').concat(v['mrba:companyZipCode']).concat(' ').concat(v['mrba:companyCity'])  : result;
    result = (v['mrba:companyVatID']) ? result.concat(', ').concat(v['mrba:companyVatID']) : result;
    console.log(result);
    return result;
  }

  ngOnInit() {

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
          this.searching = false;
          this.filteredServerSideVendors.next(data);
        })
      },
      error => {
        console.log(error);
        this.searching = false;
      });
  }

  ngOnDestroy() {
    this._onDestroy.next();
    this._onDestroy.complete();
  }
}
