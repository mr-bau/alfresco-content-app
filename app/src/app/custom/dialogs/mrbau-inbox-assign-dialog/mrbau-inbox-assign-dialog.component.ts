import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { MrbauConventionsService } from '../../services/mrbau-conventions.service';
import { MrbauBaseDialogComponent } from '../mrbau-base-dialog/mrbau-base-dialog.component';
import { DatePipe } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SelectionState } from '@alfresco/adf-extensions';
import { Node } from '@alfresco/js-api';
import { EMRBauTaskCategory, MRBauTask } from '../../mrbau-task-declarations';
import { NodesApiService, NotificationService } from '@alfresco/adf-core';
import { MrbauFormLibraryService } from '../../services/mrbau-form-library.service';

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
    private datePipe : DatePipe,
    private notificationService: NotificationService,
    private nodesApiService: NodesApiService,
    private mrbauFormLibraryService: MrbauFormLibraryService,
    private dialogRef: MatDialogRef<MrbauInboxAssignDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: {payload: any}
    )
  {
    super();

    this.fields = this.fieldsMain;
    const date = new Date();
    this.model.archivedDateValue = this.datePipe.transform(date, 'yyyy-MM-dd');
    this.model.organisationUnit = this.mrbauConventionsService.getDefaultOrganisationUnit();
    this.model.fiscalYear = date.getFullYear();
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
    // TODO adapt document type properties and aspects
    // TODO set receive time stamp and fiscal year
    // TODO move document to according folder
    // TODO create and assign a new task
    this.doCreateTask(node, EMRBauTaskCategory.NewDocumentExtractMetadata);
    // TODO add entry to incoming post book
  }

  doCreateTask(node :Node, taskCategory : EMRBauTaskCategory)
  {
    const contentTypes = ['application/json'];
    const pathParams = {'nodeId': '-root-' };
    const accepts = ['application/json'];
    // TODO
    const postBody = `
    {
      "name": "-",
      "nodeType": "${MRBauTask.MRBT_TASK}",
      "relativePath": "${MRBauTask.TASK_RELATIVE_ROOT_PATH}",
      "properties":{
        "mrbt:category": ${taskCategory},
        "mrbt:priority": 2,
        "mrbt:description": "${this.mrbauConventionsService.getTaskDescription(taskCategory, this.model.category)}",
        "mrbt:assignedUserName": "${this.mrbauConventionsService.getTaskAssignedUserId(taskCategory, this.model.category)}",
        "mrbt:fullDescription": "${this.mrbauConventionsService.getTaskFullDescription(taskCategory, this.model.category)}",
        "mrbt:dueDate": "${this.model.dueDate ? this.model.dueDate : ""}"
      },
      "targets": [{"targetId":"${node.id}","assocType":"mrbt:associatedDocument"}]
    }`;

    //console.log(postBody);
    this.nodesApiService.nodesApi.apiClient.callApi("/nodes/{nodeId}/children", "POST", pathParams, {}, {}, {}, postBody, contentTypes, accepts).then(
      (success) => {
        success;
        this.notificationService.showInfo('Aufgabe erfolgreich erstellt');
      })
      .catch((error) => {
        console.log(error);
        this.notificationService.showError('Fehler: '+error);
      });
  }
}
