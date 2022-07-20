import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FormlyFormOptions, FormlyFieldConfig } from '@ngx-formly/core';
import { FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PeopleContentQueryResponse, EcmUserModel, NodesApiService, NotificationService} from '@alfresco/adf-core';
import { MRBauTask, EMRBauTaskCategory} from '../../mrbau-task-declarations';
import { DatePipe } from '@angular/common';
import { isDevMode } from '@angular/core';
import { CONST } from '../../mrbau-global-declarations';
import { SelectionState } from '@alfresco/adf-extensions';
import { MrbauCommonService } from '../../services/mrbau-common.service';

@Component({
  selector: 'aca-mrbau-new-task-dialog',
  template: `
  <h2 mat-dialog-title>Aufgabe erstellen</h2>
  <aca-mrbau-errormsgpane [errorMessage]="errorMessage"></aca-mrbau-errormsgpane>
  <mat-dialog-content>
    <aca-mrbau-loaderoverlay *ngIf="loaderVisible"></aca-mrbau-loaderoverlay>
      <form [formGroup]="form">
        <formly-form [form]="form" [fields]="fields" [options]="options" [model]="model" (modelChange)="modelChangeEvent()"></formly-form>
      </form>

  </mat-dialog-content>
  <mat-dialog-actions>
    <!-- The mat-dialog-close directive optionally accepts a value as a result for the dialog. -->
    <button mat-button color="primary" [mat-dialog-close]="true" [disabled]="formIsInValid()">ERSTELLEN</button>
    <button mat-button mat-dialog-close>ABBRECHEN</button>
  </mat-dialog-actions>
  `,
  styleUrls: ['../mrbau-dialog-global.scss', '../../form/mrbau-form-global.scss',],
  encapsulation: ViewEncapsulation.None
})
export class MrbauNewTaskDialogComponent implements OnInit {
  errorMessage: string;
  loaderVisible: boolean;

  addDocumentsVisible = false;

  form = new FormGroup({});
  model: any = {};
  options: FormlyFormOptions = {  };
  // initially empty - exchanged with final field data after loading completed
  fields : FormlyFieldConfig[] = [ { } ];
  people: EcmUserModel[] = [];
  taskParentFolderId: string;
  private _oldCategory : EMRBauTaskCategory = null;

  constructor(private datePipe: DatePipe,
              private nodesApiService: NodesApiService,
              private notificationService: NotificationService,
              private mrbauCommonService : MrbauCommonService,
              private dialogRef: MatDialogRef<MrbauNewTaskDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: {payload: any}) {

    if (isDevMode()) {
      this.model.assignedUser = "Wolfgang Moser";
      //this.model.description = "Test-Aufgabe ";
      //this.model.category = EMRBauTaskCategory.CommonTaskGeneral;
      //this.model.dueDate = "";
    }

    const selection = this.data.payload as SelectionState;
    if (selection)
    {
      this.model.fileRefs = [];
      this.model.fileNames = [];
      for (let i=0; i< selection.nodes.length; i++)
      {
        const node = selection.nodes[i];
        if (node.entry.isFile)
        {
          this.model.fileRefs.push(node.entry.id);
          this.model.fileNames.push(node.entry.name);
        }
      }
    }
  }

  ngOnInit(): void {
    this.dialogRef.afterClosed().subscribe(result => {
      this.onDialogClose(result);
    });
    this.queryData();
  }

  formIsInValid() : boolean {
    return this.form.invalid || !!this.errorMessage;
  }

  queryData() {

    this.loaderVisible = true;
    this.errorMessage = null;
    const promiseGetParentId = this.mrbauCommonService.getTaskRootPath();
    //const promiseGetPeople = this.peopleContentService.listPeople({skipCount : 0, maxItems : 999, sorting : { orderBy: "id", direction: "ASC"}}).toPromise();
    const promiseGetPeople = this.mrbauCommonService.getPeople();
    const allPromise = Promise.all([promiseGetParentId, promiseGetPeople]);

    allPromise.then(values => {
      const node = values[0];
      this.taskParentFolderId = node.entry.id;
      const response = values[1] as PeopleContentQueryResponse;
      for (let entry of response.entries)
      {
        this.people.push(entry);
      }

      this.fields = JSON.parse(JSON.stringify(this.fieldsMain));
      this.loaderVisible = false;
    }).catch(error => {
      this.loaderVisible = false;
      this.errorMessage = "Error loading data. "+error;
    });
  }

  onDialogClose(result : boolean)
  {
    if (result)
    {
      //console.log(this.model);
      //console.log("xxx ");
      //console.log("payload "+this.data.payload);
      const contentTypes = ['application/json'];
      const pathParams = {
        'nodeId': this.taskParentFolderId
      };
      const accepts = ['application/json'];
      let targets = "";
      if (this.model.fileRefs && this.model.fileRefs.length > 0)
      {
        targets = ',"targets": [';
        for (let i=0; i<this.model.fileRefs.length;i++)
        {
          targets += `{"targetId":"${this.model.fileRefs[i]}","assocType":"mrbt:associatedDocument"}`
          targets += (i == this.model.fileRefs.length-1) ? "]" : ",";
        }
      }
      const postBody = `
      {
        "name": "-",
        "nodeType": "${MRBauTask.MRBT_TASK}",
        "properties":{
          "mrbt:category": ${this.model.category},
          "mrbt:priority": ${this.model.priority},
          "mrbt:description": "${this.model.description}",
          "mrbt:assignedUserName": "${this.model.assignedUser}",
          "mrbt:fullDescription": "${this.model.fullDescription ? this.model.fullDescription : ""}",
          "mrbt:dueDate": "${this.model.dueDate ? this.model.dueDate : ""}"
        }
        ${targets}
      }`;

      //console.log(postBody);
      this.nodesApiService.nodesApi.apiClient.callApi("/nodes/{nodeId}/children", "POST", pathParams, {}, {}, {}, postBody, contentTypes, accepts).then(
        (success) => {
          //console.log(success);
          success;
          this.notificationService.showInfo('Aufgabe erfolgreich erstellt');
        })
        .catch((error) => {
          //console.log("Promise rejected with: ");
          console.log(error);
          this.notificationService.showError('Fehler: '+error);
        });
    }
  }

  modelChangeEvent()
  {
    const cat = this.model['category'];
    if (cat && cat != this._oldCategory)
    {
      this._oldCategory = cat;
      let newFieldGroup = this.fieldGroupEmpty;

      if (cat > EMRBauTaskCategory.CommonTaskStart && cat < EMRBauTaskCategory.CommonTaskLast)
      {
        newFieldGroup = this.fieldGroupCommonTasks;

        // set default date today + 14 days
        let date = new Date();
        date.setDate( date.getDate() + MRBauTask.DEFAULT_TASK_DURATION );
        this.model.dueDate = this.datePipe.transform(date, 'yyyy-MM-dd');
        // set default priority
        this.model.priority = 2;
        // update model parameter according to task
        if (cat == EMRBauTaskCategory.CommonTaskInfo)
        {
          this.model.description = "Zur Information";
          delete this.model.dueDate;
        }
        else if (cat == EMRBauTaskCategory.CommonTaskApprove)
        {
          this.model.description = "Überprüfen und Genehmigen";
        }
        else
        {
          this.model.description = "";
        }
      }
      else if (cat > EMRBauTaskCategory.InvoiceAuditStart && cat < EMRBauTaskCategory.InvoiceAuditLast)
      {}
      else if (cat > EMRBauTaskCategory.NewDocumentStart && cat < EMRBauTaskCategory.NewDocumentLast)
      {}

      this.fieldsMain[0].fieldGroup[1].fieldGroup = newFieldGroup;
      this.fields = JSON.parse(JSON.stringify(this.fieldsMain));
    }
  }

  fieldsMain: FormlyFieldConfig[] = [
    {
      fieldGroupClassName: 'flex-container-min-width',
      type: 'newWorkflowStepper',
      fieldGroup: [
        {
          templateOptions: { label: 'Art der Aufgabe' },
          fieldGroup: [
            {
              className: 'flex-3',
              key: 'category',
              type: 'select',
              templateOptions: {
                label: 'Aufgabe auswählen',
                options: [
                  {label: 'Eine Aufgabe sich selbst oder einem Kollegen zuweisen', value: EMRBauTaskCategory.CommonTaskGeneral, group: 'Allgemeine Aufgaben'},
                  {label: 'Zur Information übermitteln', value: EMRBauTaskCategory.CommonTaskInfo, group: 'Allgemeine Aufgaben'},
                  {label: 'Überprüfen und genehmigen (ein Überprüfer)', value: EMRBauTaskCategory.CommonTaskApprove, group: 'Allgemeine Aufgaben'},

                  //{label: 'Spezielle Aufgabe 1', value: '2001', group: 'Spezielle Aufgabe'},
                  //{label: 'Spezielle Aufgabe 2', value: '2002', group: 'Spezielle Aufgabe'},
                  //{label: 'Spezielle Aufgabe 3', value: '2003', group: 'Spezielle Aufgabe'},
                ],
                required: true,
              },
            }
          ],
        },
        {
          templateOptions: { label: 'Aufgaben Details' },
          fieldGroupClassName: 'flex-container-min-width',
          fieldGroup: [],
        }
      ]
    }
  ];

  fieldGroupEmpty = [];
  fieldGroupCommonTasks = [
    {
      className: 'flex-6',
      key: 'description',
      type: 'input',
      templateOptions: {
        label: 'Aufgabe',
        description: 'Bezeichnung',
        maxLength: CONST.MAX_LENGTH_TASK_DESC,
        required: true,
      },
    },
    {
      className: 'flex-6',
      key: 'fullDescription',
      type: 'textarea',
      templateOptions: {
        label: 'Beschreibung',
        description: 'Beschreibung',
        maxLength: CONST.MAX_LENGTH_TASK_FULL_DESC,
        required: false,
      },
    },
    {
      className: 'flex-2',
      key: 'dueDate',
      type: 'input',
      templateOptions: {
        label: 'Fällig bis',
        type: 'date',
      },
      validators: {
        validation: ['date-future'],
      },
    },
    {
      className: 'flex-2',
      key: 'priority',
      type: 'select',
      templateOptions: {
        label: 'Priorität',
        placeholder: 'Placeholder',
        required: true,
        options: [
          { value: 1, label: 'Hoch' },
          { value: 2, label: 'Mittel', default: true },
          { value: 3, label: 'Niedrig'  },
        ],
      },
    },
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
    {
      className: 'flex-3',
      type: 'taskLinkedDocuments',
      key: ['fileRefs','fileNames'],
      templateOptions: {
        text: 'Dokumente Hinzufügen',
        description: 'Verknüpfte Dokumente',
      },
    }
  ];
}
