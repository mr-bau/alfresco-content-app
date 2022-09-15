import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { MrbauConventionsService } from '../../services/mrbau-conventions.service';
import { MrbauBaseDialogComponent } from '../mrbau-base-dialog/mrbau-base-dialog.component';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SelectionState } from '@alfresco/adf-extensions';
import { Node, NodeBodyUpdate } from '@alfresco/js-api';
import { EMRBauTaskCategory, EMRBauTaskStatus, MRBauTask } from '../../mrbau-task-declarations';
import { NodesApiService, NotificationService } from '@alfresco/adf-core';
import { MrbauFormLibraryService } from '../../services/mrbau-form-library.service';
import { MrbauCommonService } from '../../services/mrbau-common.service';
import { EMRBauDocumentCategory } from '../../mrbau-doc-declarations';
import { MrbauArchiveModelService } from '../../services/mrbau-archive-model.service';

@Component({
  selector: 'aca-mrbau-inbox-assign-dialog',
  template: `
  <h2 mat-dialog-title>Dokumente kategorisieren</h2>
  <mat-dialog-content>
      <form [formGroup]="form">
        <formly-form [form]="form" [fields]="fields" [options]="options" [model]="model" (modelChange)="modelChangeEvent()"></formly-form>
      </form>
  </mat-dialog-content>
  <mat-dialog-actions>
    <!-- The mat-dialog-close directive optionally accepts a value as a result for the dialog. -->
    <button mat-button color="primary" [mat-dialog-close]="true" [disabled]="formIsInValid()">ZUORDNEN</button>
    <button mat-button mat-dialog-close>ABBRECHEN</button>
  </mat-dialog-actions>
  `,
  styleUrls: ['../mrbau-dialog-global.scss', '../../form/mrbau-form-global.scss',],
  encapsulation: ViewEncapsulation.None
})
export class MrbauInboxAssignDialogComponent extends MrbauBaseDialogComponent implements OnInit {

  fieldsMain: FormlyFieldConfig[] = [
    {
      templateOptions: { label: 'Kategorisieren' },
      fieldGroupClassName: 'flex-container-min-width',
      fieldGroup: [
        this.mrbauFormLibraryService.mrba_organisationUnit,
        this.mrbauFormLibraryService.common_archiveModelTypes,
      ]
    },
    {
      templateOptions: { label: 'Datum' },
      fieldGroupClassName: 'flex-container-min-width',
      fieldGroup: [
        this.mrbauFormLibraryService.mrba_archivedDateValue,
        this.mrbauFormLibraryService.mrba_fiscalYear
      ]
    }
  ];

  constructor(
    private mrbauConventionsService : MrbauConventionsService,
    private mrbauCommonService : MrbauCommonService,
    private mrbauArchiveModelService: MrbauArchiveModelService,
    private notificationService: NotificationService,
    private nodesApiService: NodesApiService,
    private mrbauFormLibraryService: MrbauFormLibraryService,
    private dialogRef: MatDialogRef<MrbauInboxAssignDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {payload: any}
    )
  {
    super();

    this.fields = this.fieldsMain;
    const date = new Date();
    this.model['mrba:archivedDateValue'] = this.mrbauCommonService.getFormDateValue(date);
    this.model['mrba:organisationUnit'] = this.mrbauConventionsService.getDefaultOrganisationUnit();
    this.model['mrba:fiscalYear'] = date.getFullYear();
  }

  ngOnInit(): void {
    this.dialogRef.afterClosed().subscribe(result => {
      this.onDialogClose(result);
    });
  }

  onDialogClose(result : boolean)
  {
    if (result)
    {
      const selection = this.data.payload as SelectionState;
      selection.nodes.forEach((node) => {
        this.categorizeNode(node.entry);
      });
    }
  }

  categorizeNode(node:Node) {
    const docCategory : EMRBauDocumentCategory = this.model.archiveModelTypes;
    const nodeType = this.mrbauArchiveModelService.getArchiveModelNodeTye(docCategory);
    console.log(nodeType);
    if (!nodeType)
    {
      this.notificationService.showError('Fehler: NodeType nicht gefunden!');
      return;
    }
    // TODO move document to according folder -> backend
    // TODO add entry to incoming post book

    // execute sequentially !
    // adapt document type and set receive time stamp and fiscal year
    this.changeDocumentType(node, nodeType)
    // create and assign a new task
    .then(() => this.doCreateTask(node, EMRBauTaskCategory.NewDocumentValidateAndArchive, docCategory, EMRBauTaskStatus.STATUS_NEW))
    .then(() => this.notificationService.showInfo('Aufgabe erfolgreich erstellt'))
    .catch((error) => {
      //console.log(error);
      this.notificationService.showError('Fehler: '+error);
    });
  }

  changeDocumentType(node :Node, nodeType : string) : Promise<any>
  {
    let nodeBody : NodeBodyUpdate =  {
      nodeType: nodeType,
      properties: {
        //"mrba:mrBauId"
        "mrba:fiscalYear"        : this.model['mrba:fiscalYear'],
        "mrba:archivedDateValue" : this.model['mrba:archivedDateValue'],
        "mrba:organisationUnit"  : this.model['mrba:organisationUnit'],
      }
    };
    return this.nodesApiService.nodesApi.updateNode(node.id, nodeBody, {});
  }

  doCreateTask(node :Node, taskCategory : EMRBauTaskCategory, docCategory? : EMRBauDocumentCategory, status?: EMRBauTaskStatus) : Promise<any>
  {
    const contentTypes = ['application/json'];
    const pathParams = {'nodeId': '-root-' };
    const accepts = ['application/json'];
    const postBody = `
    {
      "name": "-",
      "nodeType": "${MRBauTask.MRBT_TASK}",
      "relativePath": "${MRBauTask.TASK_RELATIVE_ROOT_PATH}",
      "properties":{
        "mrbt:category": ${taskCategory},
        "mrbt:status": ${status ? status : EMRBauTaskStatus.STATUS_NEW},
        "mrbt:priority": 2,
        "mrbt:description": "${this.mrbauArchiveModelService.getTaskDescription(taskCategory, docCategory)}",
        "mrbt:assignedUserName": "${this.mrbauConventionsService.getNewTaskDefaultAssignedUserId(taskCategory)}",
        "mrbt:dueDateValue": "${this.mrbauConventionsService.getTaskDueDateValue(taskCategory)}"
      },
      "targets": [{"targetId":"${node.id}","assocType":"mrbt:associatedDocument"}]
    }`;
    //console.log(postBody);
    return this.nodesApiService.nodesApi.apiClient.callApi("/nodes/{nodeId}/children", "POST", pathParams, {}, {}, {}, postBody, contentTypes, accepts);
  }
}
