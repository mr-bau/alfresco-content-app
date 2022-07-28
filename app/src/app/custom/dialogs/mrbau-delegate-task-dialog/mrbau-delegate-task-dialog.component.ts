import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDialogRef } from '@angular/material/dialog';
import { ContentApiService } from '@alfresco/aca-shared';
import { PeopleContentService} from '@alfresco/adf-core';
import { MRBauTask } from '../../mrbau-task-declarations';
import { CONST } from '../../mrbau-global-declarations';
import { MrbauBaseTaskDialogComponent, MrbauBaseTaskDialogComponentProps } from '../mrbau-base-task-dialog/mrbau-base-task-dialog.component';

@Component({
  selector: 'aca-mrbau-delegate-task-dialog',
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

  constructor(public contentApi : ContentApiService,
    public peopleService: PeopleContentService,
    public  dialogRef: MatDialogRef<MrbauDelegateTaskDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: MrbauBaseTaskDialogComponentProps
    )
  {
    super(contentApi, peopleService, dialogRef, data);
  }

  ngOnInit(): void {
    this.dialogRef.afterClosed().subscribe(result => {
      this.onDialogClose(result);
    });
    const task = this.data.payload as MRBauTask;
    this.model['mrbt:assignedUser'] = task.assignedUserName;
    this.queryData();
  }

  loadForm()
  {
    this.fields = this.delegateTaskForm;
  }

  formIsInValid() : boolean {
    const task = this.data.payload as MRBauTask;
    return this.form.invalid || !!this.errorMessage || task.assignedUserName == this.model['mrbt:assignedUser'];
  }


  private delegateTaskForm: FormlyFieldConfig[] = [
    {
      fieldGroupClassName: 'flex-container-min-width',
      fieldGroup: [
        {
          className: 'flex-2',
          key: 'comment',
          type: 'textarea',
          templateOptions: {
            label: 'Optionaler Kommentar',
            description: 'Kommentar',
            maxLength: CONST.MAX_LENGTH_COMMENT,
            required: false,
          },
        },
      ]
    },
    {
      fieldGroupClassName: 'flex-container-min-width',
      fieldGroup: [
        {
          className: 'flex-2',
          key: 'assignedUser',
          type: 'select',
          templateOptions: {
            label: 'Mitarbeiter',
            options: this.people,
            valueProp: 'id',
            labelProp: 'displayName',
            required: true,
          },
        },
      ]
    }
  ];
}
