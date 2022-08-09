import { Component, ViewChild } from '@angular/core';
import { FieldType, FormlyFieldConfig } from '@ngx-formly/core';
import { MatStepper } from '@angular/material/stepper';

@Component({
  selector: 'aca-mrbau-formly-new-task-stepper',
  template: `
  <style>
  .btn-mrdialog:disabled {
    opacity: .65;
    background-color: #D0D0D0;
  }
  .btn-mrdialog:hover {
    background-color: #0069d9;
    border-color: #0062cc;
  }

  .btn-mrdialog {
    color: #fff;
    display: inline-flex;
    justify-content: center;
    align-items: center;
    background-color: #007bff;
    border-color: #007bff;
    text-decoration: none;
    font-weight: 400;
    text-align: center;
    vertical-align: middle;
    border: 1px solid transparent;
    padding: .375rem .75rem;
    margin: 0 .375rem 0 0;
    font-size: 1rem;
    line-height: 1.5;
    border-radius: .25rem;
    transition: color .15s ease-in-out,background-color .15s ease-in-out,border-color .15s ease-in-out,box-shadow .15s ease-in-out;
  }
  </style>
  <mat-horizontal-stepper [linear]="true" >
    <mat-step
      *ngFor="let step of field.fieldGroup; let index = index; let last = last;" [completed]="isValid(step)">
      <ng-template matStepLabel >{{ step.templateOptions.label }}</ng-template>
      <formly-field [field]="step"></formly-field>
      <div>
        <button matStepperPrevious *ngIf="index !== 0"
          class="btn-mrdialog"
          type="button">
          <mat-icon aria-hidden="false" aria-label="Zurück">arrow_back</mat-icon>
        </button>

        <button matStepperNext *ngIf="!last"
          class="btn-mrdialog" type="button"
          [disabled]="!isValid(step)"
          >
          <mat-icon aria-hidden="false" aria-label="Weiter">arrow_forward</mat-icon>
        </button>
      </div>
    </mat-step>
  </mat-horizontal-stepper>
`,
})
export class MrbauFormlyNewTaskStepper extends FieldType {
  @ViewChild('stepper') stepper: MatStepper;

  isValid(field: FormlyFieldConfig) {
    if (field.key) {
      return field.formControl.valid;
    }

    return field.fieldGroup
      ? field.fieldGroup.every((f) => this.isValid(f))
      : true;
  }
}
