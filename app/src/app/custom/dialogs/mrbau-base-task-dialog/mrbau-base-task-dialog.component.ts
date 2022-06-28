import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { FormlyFormOptions, FormlyFieldConfig } from '@ngx-formly/core';
import { FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDialogRef } from '@angular/material/dialog';
import { ContentApiService } from '@alfresco/aca-shared';
import { PeopleContentService,PeopleContentQueryResponse, EcmUserModel} from '@alfresco/adf-core';
import { MRBauTask } from '../../mrbau-task-declarations';

@Component({
  selector: 'aca-mrbau-base-task-dialog',
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
    <button mat-button color="primary" [mat-dialog-close]="true" [disabled]="this.form.invalid && !this.errorMessage">{{dialogButtonOK}}</button>
    <button mat-button mat-dialog-close>{{dialogButtonCancel}}</button>
  </mat-dialog-actions>
  `,
  styleUrls: ['../mrbau-dialog-global.scss', '../../form/mrbau-form-global.scss',],
  encapsulation: ViewEncapsulation.None
})
export class MrbauBaseTaskDialogComponent implements OnInit {
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

  constructor(public contentApi : ContentApiService,
              public peopleService: PeopleContentService,
              public dialogRef: MatDialogRef<MrbauBaseTaskDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: {payload: any})
  {

  }

  ngOnInit(): void {
    this.dialogRef.afterClosed().subscribe(result => {
      this.onDialogClose(result);
    });
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
    this.fields = JSON.parse(JSON.stringify(this.fieldsMain));
  }

  modelChangeEvent()
  {
  }

  onDialogClose(result : boolean)
  {
    if (result)
    {

    }
  }

  fieldsMain: FormlyFieldConfig[] = [
    {
      fieldGroupClassName: 'flex-container-min-width',
      type: 'newWorkflowStepper',
      fieldGroup: []
    }
  ];
}
