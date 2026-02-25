import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatDialogRef } from '@angular/material/dialog';
import { MrbauBaseTaskDialogComponent, MrbauBaseTaskDialogComponentProps } from '../mrbau-base-task-dialog/mrbau-base-task-dialog.component';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { FormlyModule } from '@ngx-formly/core';
import { AngularSplitModule } from 'angular-split';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormlyMaterialModule } from '@ngx-formly/material';
import { FormlyMatDatepickerModule } from '@ngx-formly/material/datepicker';

@Component({
  standalone:true,
  imports:[
    CommonModule,
    AngularSplitModule,

    MatDialogModule,
    MatButtonModule, MatIconModule,
    MatSelectModule,
    MatInputModule, MatFormFieldModule,
    ReactiveFormsModule,
    FormlyModule,
    FormlyMaterialModule,
    FormlyMatDatepickerModule
  ],
  selector: 'mrbau-finish-task-dialog',
  template: `
  <h2 mat-dialog-title>{{dialogTitle}}</h2>
  <mat-dialog-content>
    <div class="addMarginBottom">{{dialogMsg}}</div>
      <form [formGroup]="form">
        <formly-form [form]="form" [fields]="fields" [options]="options" [model]="model" (modelChange)="modelChangeEvent()"></formly-form>
      </form>
  </mat-dialog-content>
  <mat-dialog-actions align="end">
    <button mat-button color="primary" [mat-dialog-close]="model"  [disabled]="formIsInValid()">{{dialogButtonOK}}</button>
    <button mat-button mat-dialog-close>{{dialogButtonCancel}}</button>
  </mat-dialog-actions>
  `,
  styleUrls: ['../mrbau-dialog-global.scss', '../../form/mrbau-form-global.scss',],
  encapsulation: ViewEncapsulation.None
})
export class MrbauConfirmTaskDialogComponent extends MrbauBaseTaskDialogComponent {
  constructor(
    public override  dialogRef: MatDialogRef<MrbauConfirmTaskDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public override data: MrbauBaseTaskDialogComponentProps
    )
  {
    super(dialogRef, data);
  }

  formIsInValid() : boolean
  {
    return this.form.invalid;
  }

}
