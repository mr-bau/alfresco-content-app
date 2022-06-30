import { Component, Inject, OnInit } from '@angular/core';
import { FormlyFormOptions, FormlyFieldConfig } from '@ngx-formly/core';
import { FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDialogRef } from '@angular/material/dialog';
import { ContentApiService } from '@alfresco/aca-shared';
import { PeopleContentService,PeopleContentQueryResponse, EcmUserModel} from '@alfresco/adf-core';
import { MRBauTask } from '../../mrbau-task-declarations';



export interface MrbauBaseTaskDialogComponentProps {
  dialogTitle?: string;
  dialogMsg?: string;
  dialogButtonCancel?: string;
  dialogButtonOK?: string;
  fieldsMain?:FormlyFieldConfig[];
  callQueryData?:boolean;
  payload?:any;
}

@Component({
  selector: 'aca-mrbau-base-task-dialog',
  template: ``,
})
export class MrbauBaseTaskDialogComponent implements OnInit {
  dialogTitle: string;
  dialogMsg: string;
  dialogButtonCancel: string;
  dialogButtonOK: string;
  callQueryData:boolean;

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
              @Inject(MAT_DIALOG_DATA) public data: MrbauBaseTaskDialogComponentProps)
  {
    data = data || {};
    this.dialogTitle = data.dialogTitle || 'Aufgabe Titel';
    this.dialogMsg = data.dialogMsg || 'Aufgabe Beschreibung.';
    this.dialogButtonCancel = data.dialogButtonCancel || 'ABBRECHEN';
    this.dialogButtonOK = data.dialogButtonOK || 'OK';
    this.fieldsMain = data.fieldsMain || [
      {
        fieldGroupClassName: 'flex-container-min-width',
        type: 'newWorkflowStepper',
        fieldGroup: []
      }
    ];
    this.callQueryData = data.callQueryData || true;
  }

  ngOnInit(): void {
    this.dialogRef.afterClosed().subscribe(result => {
      this.onDialogClose(result);
    });
    if (this.callQueryData)
    {
      this.queryData();
    }
    else
    {
      this.loadForm();
      this.loaderVisible = false;
      this.errorMessage = null;
    }
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
    if (result) {}
  }

  fieldsMain: FormlyFieldConfig[];
}
