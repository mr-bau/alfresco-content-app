import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDialogRef } from '@angular/material/dialog';
import { ContentApiService } from '@alfresco/aca-shared';
import { PeopleContentService } from '@alfresco/adf-core';
import { MrbauBaseTaskDialogComponent, MrbauBaseTaskDialogComponentProps } from '../mrbau-base-task-dialog/mrbau-base-task-dialog.component';

@Component({
  selector: 'aca-mrbau-finish-task-dialog',
  template: `
  <h2 mat-dialog-title>{{dialogTitle}}</h2>
  <aca-mrbau-errormsgpane [errorMessage]="errorMessage"></aca-mrbau-errormsgpane>
  <mat-dialog-content>
    <div>{{dialogMsg}}</div>
    <aca-mrbau-loaderoverlay *ngIf="loaderVisible"></aca-mrbau-loaderoverlay>
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
  constructor(public contentApi : ContentApiService,
    public peopleService: PeopleContentService,
    public  dialogRef: MatDialogRef<MrbauConfirmTaskDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: MrbauBaseTaskDialogComponentProps
    )
  {
    super(contentApi, peopleService, dialogRef, data);
  }

  formIsInValid() : boolean
  {
    return false;
  }

}
