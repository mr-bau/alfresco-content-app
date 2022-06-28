import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { FormlyFormOptions, FormlyFieldConfig } from '@ngx-formly/core';
import { FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDialogRef } from '@angular/material/dialog';
import { ContentApiService } from '@alfresco/aca-shared';
import { PeopleContentService,PeopleContentQueryResponse, EcmUserModel} from '@alfresco/adf-core';
import { MRBauTask } from '../../mrbau-task-declarations';
import { CONST } from '../../mrbau-global-declarations';

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
export class MrbauDelegateTaskDialogComponent implements OnInit {
  readonly dialogTitle: string = 'Aufgabe deligieren';
  readonly dialogMsg: string = 'Aufgabe einer anderen Person übertragen.';
  readonly dialogButtonCancel: string = 'ABBRECHEN';
  readonly dialogButtonOK: string = 'DELIGIEREN';

  errorMessage: string;
  loaderVisible: boolean;

  form = new FormGroup({});
  model: any = {};
  options: FormlyFormOptions = {  };
  fields : FormlyFieldConfig[] = [ { } ];

  people: EcmUserModel[] = [];
  taskParentFolderId: string;

  constructor(private contentApi : ContentApiService,
              private peopleService: PeopleContentService,private dialogRef: MatDialogRef<MrbauDelegateTaskDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: {payload: any})
  {
  }

  ngOnInit(): void {
    this.dialogRef.afterClosed().subscribe(result => {
      this.onDialogClose(result);
    });
    const task = this.data.payload as MRBauTask;
    this.model.assignedUser = task.assignedUser;
    this.queryData();
  }

  queryData() {
    this.loaderVisible = true;
    this.errorMessage = null;
    const promiseGetParentId = this.contentApi.getNodeInfo('-root-', { includeSource: true, include: ['path', 'properties'], relativePath: MRBauTask.TASK_RELATIVE_ROOT_PATH }).toPromise();
    const promiseGetPeople = this.peopleService.listPeople({skipCount : 0, maxItems : 999, sorting : { orderBy: "id", direction: "ASC"}}).toPromise();
    const allPromise = Promise.all([promiseGetParentId, promiseGetPeople]);

    allPromise.then(values => {
      const node = values[0];
      this.taskParentFolderId = node.id;
      const response = values[1] as PeopleContentQueryResponse;
      for (let entry of response.entries)
      {
        this.people.push(entry);
      }

      this.loadForm();
      this.loaderVisible = false;
    }).catch(error => {
      this.loaderVisible = false;
      this.errorMessage = "Error loading data. "+error;
    });
  }

  loadForm()
  {
    this.fields = this.delegateTaskForm;
  }

  formIsInValid() : boolean {
    const task = this.data.payload as MRBauTask;
    return this.form.invalid || !!this.errorMessage || task.assignedUser == this.model.assignedUser;
  }

  modelChangeEvent()
  {
  }

  onDialogClose(result)
  {
    result;
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
