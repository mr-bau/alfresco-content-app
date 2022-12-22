import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDialogRef } from '@angular/material/dialog';
import { MRBauTask } from '../../mrbau-task-declarations';
import { MrbauBaseTaskDialogComponent, MrbauBaseTaskDialogComponentProps } from '../mrbau-base-task-dialog/mrbau-base-task-dialog.component';
import { MrbauFormLibraryService } from '../../services/mrbau-form-library.service';

@Component({
  selector: 'aca-mrbau-delegate-task-dialog',
  template: `
  <h2 mat-dialog-title>{{dialogTitle}}</h2>
  <mat-dialog-content>
    <div>{{dialogMsg}}</div>
      <form [formGroup]="form">
        <formly-form [form]="form" [fields]="fields" [options]="options" [model]="model" (modelChange)="modelChangeEvent()"></formly-form>
      </form>
  </mat-dialog-content>
  <mat-dialog-actions>
    <button mat-button color="primary" [mat-dialog-close]="model" [disabled]="formIsInValid()">{{dialogButtonOK}}</button>
    <button mat-button mat-dialog-close>{{dialogButtonCancel}}</button>
  </mat-dialog-actions>
  `,
  styleUrls: ['../mrbau-dialog-global.scss', '../../form/mrbau-form-global.scss',],
  encapsulation: ViewEncapsulation.None
})
export class MrbauDelegateTaskDialogComponent extends MrbauBaseTaskDialogComponent implements OnInit {
  dialogTitle: string = 'Aufgabe deligieren';
  dialogMsg: string = 'Aufgabe einer anderen Person übertragen.';
  dialogButtonCancel: string = 'ABBRECHEN';
  dialogButtonOK: string = 'DELIGIEREN';

  constructor(
    private mrbauFormLibraryService : MrbauFormLibraryService,
    public  dialogRef: MatDialogRef<MrbauDelegateTaskDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: MrbauBaseTaskDialogComponentProps
    )
  {
    super(dialogRef, data);
  }

  ngOnInit(): void {
    this.dialogRef.afterClosed().subscribe(result => {
      this.onDialogClose(result);
    });
    const task = this.data.payload as MRBauTask;
    this.model['mrbt:assignedUserName'] = task.assignedUserName;
    //this.form.get('mrbt:assignedUserName').patchValue(task.assignedUserName);
  }

  formIsInValid() : boolean {
    const task = this.data.payload as MRBauTask;
    return this.form.invalid || task.assignedUserName == this.model['mrbt:assignedUserName'];
  }

  fields : FormlyFieldConfig[] = [
    {
      fieldGroupClassName: 'flex-container-min-width',
      fieldGroup: [this.mrbauFormLibraryService.common_comment]
    },
    {
      fieldGroupClassName: 'flex-container-min-width',
      fieldGroup: [this.mrbauFormLibraryService.mrbt_assignedUserName]
    }
  ];

}
