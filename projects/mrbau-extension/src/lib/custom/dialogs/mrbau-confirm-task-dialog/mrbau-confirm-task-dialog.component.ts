import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDialogRef } from '@angular/material/dialog';
import { MrbauBaseTaskDialogComponent, MrbauBaseTaskDialogComponentProps } from '../mrbau-base-task-dialog/mrbau-base-task-dialog.component';

@Component({
  selector: 'aca-mrbau-finish-task-dialog',
  template: `
  <h2 mat-dialog-title>{{dialogTitle}}</h2>
  <mat-dialog-content>
    <div class="addMarginBottom">{{dialogMsg}}</div>
      <form [formGroup]="form">
        <formly-form [form]="form" [fields]="fields" [options]="options" [model]="model" (modelChange)="modelChangeEvent()"></formly-form>
      </form>
  </mat-dialog-content>
  <mat-dialog-actions>
    <button mat-button color="primary" [mat-dialog-close]="model"  [disabled]="formIsInValid()">{{dialogButtonOK}}</button>
    <button mat-button mat-dialog-close>{{dialogButtonCancel}}</button>
  </mat-dialog-actions>
  `,
  styleUrls: ['../mrbau-dialog-global.scss', '../../form/mrbau-form-global.scss',],
  encapsulation: ViewEncapsulation.None
})
export class MrbauConfirmTaskDialogComponent extends MrbauBaseTaskDialogComponent {
  constructor(
    public  dialogRef: MatDialogRef<MrbauConfirmTaskDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: MrbauBaseTaskDialogComponentProps
    )
  {
    super(dialogRef, data);
  }

  formIsInValid() : boolean
  {
    return this.form.invalid;
  }

}
