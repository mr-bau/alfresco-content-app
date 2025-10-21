import { Component, ViewChild, OnInit, AfterViewInit } from '@angular/core';
import { FieldType, FormlyMaterialModule } from '@ngx-formly/material';
import { MatInput, MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { Observable } from 'rxjs';
import { startWith, switchMap } from 'rxjs/operators';
import { ISelectFormOptions } from '../services/mrbau-conventions.service';
import { FieldTypeConfig, FormlyModule } from '@ngx-formly/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  standalone:true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormlyModule,
    FormlyMaterialModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
  ],
  selector: 'mrbau-formly-autocomplete-select-form-options',
  template: `
    <input matInput
      [matAutocomplete]="auto"
      [formControl]="formControl"
      [formlyAttributes]="field"
      [placeholder]="to.placeholder || ''"
      [errorStateMatcher]="errorStateMatcher"
      >
    <mat-autocomplete #auto="matAutocomplete" [displayWith]="displayFn"
      (optionSelected)="to.change && to.change(field, $event)">
      <mat-option *ngFor="let value of filter | async" [value]="value">
        {{ value.label }}
      </mat-option>
    </mat-autocomplete>
  `,
})
export class MrbauFormlyAutocompleteSelectFormOptionsComponent extends FieldType<FieldTypeConfig> implements OnInit, AfterViewInit {
  @ViewChild(MatInput) formFieldControl: MatInput | undefined;
  @ViewChild(MatAutocompleteTrigger) autocomplete: MatAutocompleteTrigger | undefined;

  filter: Observable<any> | undefined;
  //formControl: FormControl;
  ngOnInit() {
    //super.ngOnInit();

    // initialize value
    const k = this.key as string;
    let startString = '';
    if (this.model[k]) {
      startString = this.model[k];
      this.ngControl.setValue(this.model[k]);
    }

    this.filter = this.formControl.valueChanges
      .pipe(
        startWith(startString),
        switchMap(term => this.props.filter(term)),
      );
  }
  displayFn(data : ISelectFormOptions): string {
    return data && data.label ? data.label : '';;
  }

  ngAfterViewInit() {
    //super.ngAfterViewInit();
    // temporary fix for https://github.com/angular/material2/issues/6728
    (<any> this.autocomplete)._formField = this.formField;
  }
}
