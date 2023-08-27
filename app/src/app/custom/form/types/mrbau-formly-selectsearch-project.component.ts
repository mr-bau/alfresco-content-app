import { ChangeDetectionStrategy, Component,  OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ReplaySubject, Subject } from 'rxjs';
import { debounceTime, delay, filter, map, takeUntil, tap } from 'rxjs/operators';
import { ICostCarrier } from '../../services/mrbau-conventions.service';
import { MrbauDbService } from '../../services/mrbau-db.service';
import { MatSelectChange } from '@angular/material/select';
import { FieldTypeConfig  } from '@ngx-formly/core';
import { FieldType  } from '@ngx-formly/material/form-field';
import { MrbauCommonService } from '../../services/mrbau-common.service';

 interface IProjectFormOption extends ICostCarrier {
  value?: any;
  label?:string;
}

@Component({
  selector: 'aca-mrbau-formly-select-search-project',
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
        <mat-option (click)="change(null)" style="background-color:#F0FFF0;" [id]="id+' current'" *ngIf="(currentValue)" [value]="currentValue" [matTooltip]="currentValue?.label">{{currentValue?.label}}</mat-option>
        <mat-option *ngFor="let project of filteredServerSideProjects | async; let i = index;"
          [id]="id+' '+i"
          [matTooltip]="project.label"
          [value]="project">
          {{createProjectString(project)}}
        </mat-option>
      </mat-select>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MrbauFormlySelectSearchProjectComponent  extends FieldType<FieldTypeConfig> implements OnDestroy {
  /** control for filter for server side. */
  public serverSideFilteringCtrl: FormControl<string> = new FormControl<string>('');

  /** indicate search operation is in progress */
  public searching = false;

  /** list of banks filtered after simulating server side search */
  public  filteredServerSideProjects: ReplaySubject<IProjectFormOption[]> = new ReplaySubject<IProjectFormOption[]>(1);

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
    this.formControl.updateValueAndValidity();
  }

  public createProjectString(v : ICostCarrier) : string {
    let result = v['mrba:costCarrierNumber'];
    result = (v['mrba:projectName']) ? result.concat(', ').concat(v['mrba:projectName']) : result;
    return result;
  }

  addValueLabel(d:IProjectFormOption) {
    d['value']=d['mrba:costCarrierNumber'];
    d['label']=this.createProjectString(d);
  }

  currentValue:any = undefined;

  ngOnInit() {
    this.currentValue = undefined;
    if (this.formControl.value) {
      this.mrbauDbService.getProject(this.formControl.value).subscribe(
        result => {
          if (typeof result === 'string') {
            this.mrbauCommonService.showError(result);
            return;
          }
          this.addValueLabel(result as ICostCarrier);
          this.currentValue = result;
          this.formControl.setValue(this.currentValue);
        },
        error => {
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
          return this.mrbauDbService.searchProjects(search);
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
          (data as ICostCarrier[]).forEach(d => this.addValueLabel(d));
          this.filteredServerSideProjects.next(data as IProjectFormOption[]);
        })
      });
  }

  ngOnDestroy() {
    this._onDestroy.next();
    this._onDestroy.complete();
  }
}
