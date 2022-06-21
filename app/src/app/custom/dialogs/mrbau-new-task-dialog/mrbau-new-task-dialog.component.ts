import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { ContentApiService } from '@alfresco/aca-shared';
import { FormlyFormOptions, FormlyFieldConfig } from '@ngx-formly/core';
import { FormGroup } from '@angular/forms';
//import { MrbauDialogFormLibrary, MrbauDialogForms } from '../../form/mrbau-dialog-form-library';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PeopleContentService,PeopleContentQueryResponse, EcmUserModel, NodesApiService} from '@alfresco/adf-core';
import { MRBauTask, EMRBauTaskCategory} from '../../mrbau-task-declarations';
import { DatePipe } from '@angular/common';
import { isDevMode } from '@angular/core';

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
    <button mat-button mat-dialog-close>ABBRECHEN</button>
    <!-- The mat-dialog-close directive optionally accepts a value as a result for the dialog. -->
    <button mat-button [mat-dialog-close]="true" [disabled]="this.form.invalid && !this.errorMessage">ERSTELLEN</button>
  </mat-dialog-actions>
  `,
  styleUrls: ['../mrbau-dialog-global.scss', '../../form/mrbau-form-global.scss',],
  encapsulation: ViewEncapsulation.None
})
export class MrbauNewTaskDialogComponent implements OnInit {
  errorMessage: string;
  loaderVisible: boolean;
  form = new FormGroup({});
  model: any = {};
  options: FormlyFormOptions = {  };
  // initially empty - exchanged with final field data after loading completed
  fields : FormlyFieldConfig[] = [ { } ];
  people: EcmUserModel[] = [];
  taskParentFolderId: string;

  constructor(private contentApi : ContentApiService,private nodeService: NodesApiService, private datePipe: DatePipe, private peopleService: PeopleContentService, public dialogRef: MatDialogRef<MrbauNewTaskDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: {payload: any}) {
    // set default date today + 14 days
    let date = new Date();
    date.setDate( date.getDate() + 14 );
    this.model.dueDate = this.datePipe.transform(date, 'yyyy-MM-dd');
    // set default priority
    this.model.priority = 2;

    if (isDevMode()) {
      this.model.assignedUser = "Wolfgang Moser";
      this.model.description = "Test-Aufgabe ";
      this.model.category = EMRBauTaskCategory.CommonTaskGeneral;
      //this.model.dueDate = "";
    }
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

      this.fields = JSON.parse(JSON.stringify(this.fieldsMain));
      this.loaderVisible = false;

        // TODO remove: list all childs from Aufgaben folder
        this.contentApi.getNodeChildren(this.taskParentFolderId, {maxItems: 999, skipCount: 0}).toPromise().then(nodePaging => {
        for (let i=0; i<nodePaging.list.entries.length; i++ )
        {
          //let entry = nodePaging.list.entries[i].entry;
          //console.log(entry.name);
          //console.log(entry);
          //if (!entry.properties["mrbt:assignedUser"])
          //{
          //  let x = {"name":"My new name", "properties" : {"mrbt:priority": "2"}};
          //  this.contentApi.nodesApi.updateNode(entry.id, x)
          //  .then(nodeEntry => console.log(nodeEntry))
          //  .catch(error => console.log(error));
          //}
        }
      });

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
      //console.log("payload "+this.data.payload);
      const contentTypes = ['application/json'];
      const pathParams = {
        'nodeId': this.taskParentFolderId
      };
      const accepts = ['application/json'];
      const postBody = `{
        "name": "--",
        "nodeType": "${MRBauTask.MRBT_TASK}",
        "properties":{
          "mrbt:category": ${this.model.category},
          "mrbt:priority": ${this.model.priority},
          "mrbt:description": "${this.model.description}",
          "mrbt:assignedUser": "${this.model.assignedUser}",
          "mrbt:fullDescription": "${this.model.fullDescription ? this.model.fullDescription : ""}",
          "mrbt:dueDate": "${this.model.dueDate ? this.model.dueDate : ""}"
        }}`;
      //console.log(postBody);
      this.nodeService.nodesApi.apiClient.callApi("/nodes/{nodeId}/children", "POST", pathParams, {}, {}, {}, postBody, contentTypes, accepts).then(
        (success) => {
          console.log(success);
        })
        .catch((error) => {
          console.log("Promise rejected with: ");
          console.log(error);
        });
    }
  }

  modelChangeEvent()
  {
    if (this.model['category'])
    {
      //console.log(this.model['category']);
      const cat = this.model['category'];
      let newFieldGroup = this.fieldGroupTBD;
      if (cat > EMRBauTaskCategory.CommonTaskStart && cat < EMRBauTaskCategory.CommonTaskLast)
      {
        newFieldGroup = this.fieldGroupCommonTasks;
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
      fieldGroupClassName: 'flex-container',
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

                  {label: 'Spezielle Aufgabe 1', value: '2001', group: 'Spezielle Aufgabe'},
                  {label: 'Spezielle Aufgabe 2', value: '2002', group: 'Spezielle Aufgabe'},
                  {label: 'Spezielle Aufgabe 3', value: '2003', group: 'Spezielle Aufgabe'},
                ],
                required: true,
              },
            }
          ],
        },
        {
          templateOptions: { label: 'Aufgaben Details' },
          fieldGroupClassName: 'flex-container',
          fieldGroup: [],
        }
      ]
    }
  ];

  fieldGroupTBD = [];
  fieldGroupCommonTasks = [
    {
      className: 'flex-6',
      key: 'description',
      type: 'input',
      templateOptions: {
        label: 'Aufgabe',
        description: 'Bezeichnung',
        maxLength: 100,
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
        maxLength: 250,
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
  ];
}
