import { Component, ViewChild, OnInit, AfterViewInit } from '@angular/core';
import { FieldType } from '@ngx-formly/material';
import { MatInput } from '@angular/material/input';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { Observable } from 'rxjs';
import { startWith, switchMap } from 'rxjs/operators';
import { FormControl } from '@angular/forms';
import { SelectFormOptions } from '../services/mrbau-conventions.service';

@Component({
  selector: 'aca-mrbau-formly-autocomplete-select-form-options',
  template: `
    <input matInput
      [matAutocomplete]="auto"
      [formControl]="formControl"
      [formlyAttributes]="field"
      [placeholder]="to.placeholder"
      [errorStateMatcher]="errorStateMatcher">
    <mat-autocomplete #auto="matAutocomplete"  [displayWith]="displayFn">
      <mat-option *ngFor="let value of filter | async" [value]="value">
        {{ value.label }}
      </mat-option>
    </mat-autocomplete>
  `,
})
export class MrbauFormlyAutocompleteSelectFormOptionsComponent extends FieldType implements OnInit, AfterViewInit {
  @ViewChild(MatInput) formFieldControl: MatInput;
  @ViewChild(MatAutocompleteTrigger) autocomplete: MatAutocompleteTrigger;

  filter: Observable<any>;
  formControl: FormControl;
  ngOnInit() {
    super.ngOnInit();
    this.filter = this.formControl.valueChanges
      .pipe(
        startWith(''),
        switchMap(term => this.to.filter(term)),
      );
  }

  displayFn(data : SelectFormOptions): string {
    return data && data.label ? data.label : '';;
  }

  ngAfterViewInit() {
    super.ngAfterViewInit();
    // temporary fix for https://github.com/angular/material2/issues/6728
    (<any> this.autocomplete)._formField = this.formField;
  }
}
