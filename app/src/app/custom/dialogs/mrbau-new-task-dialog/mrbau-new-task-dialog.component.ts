import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NodesApiService, NotificationService} from '@alfresco/adf-core';
import { MRBauTask, EMRBauTaskCategory} from '../../mrbau-task-declarations';
import { isDevMode } from '@angular/core';
import { SelectionState } from '@alfresco/adf-extensions';
import { MrbauFormLibraryService } from '../../services/mrbau-form-library.service';
import { MrbauBaseDialogComponent } from '../mrbau-base-dialog/mrbau-base-dialog.component';
import { MrbauCommonService } from '../../services/mrbau-common.service';
import { AbstractControl } from '@angular/forms';

@Component({
  selector: 'aca-mrbau-new-task-dialog',
  template: `
  <h2 mat-dialog-title>Aufgabe erstellen</h2>
  <mat-dialog-content>
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
export class MrbauNewTaskDialogComponent extends MrbauBaseDialogComponent implements OnInit {
  addDocumentsVisible = false;

  fieldsMain : FormlyFieldConfig[] = [
    {
      fieldGroupClassName: 'flex-container-min-width',
      type: 'mrbauFormlyNewTaskStepper',
      fieldGroup: [
        {
          props: { label: 'Art der Aufgabe' },
          fieldGroup: [
            this.mrbauFormLibraryService.mrbt_category
          ],
        },
        {
          props: { label: 'Aufgaben Details' },
          fieldGroupClassName: 'flex-container-min-width',
          fieldGroup: [
            this.mrbauFormLibraryService.mrbt_description,
            this.mrbauFormLibraryService.mrbt_fullDescription,
            this.mrbauFormLibraryService.mrbt_dueDateValue,
            this.mrbauFormLibraryService.mrbt_priority,
            this.mrbauFormLibraryService.mrbt_assignedUserName,
            // TODO fix mrbauFormLibraryService.common_taskLinkedDocuments
            //this.mrbauFormLibraryService.common_taskLinkedDocuments
          ],
        }
      ]
    }
  ];

  private _oldCategory : EMRBauTaskCategory = null;

  constructor(
              private nodesApiService: NodesApiService,
              private notificationService: NotificationService,
              private mrbauCommonService: MrbauCommonService,
              private mrbauFormLibraryService: MrbauFormLibraryService,
              private dialogRef: MatDialogRef<MrbauNewTaskDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: {payload: any}) {
    super();

    this.fieldsMain.forEach((fc) => this.mrbauCommonService.patchFormFieldConfigRequiredPropertyRecursive(fc, ['mrbt:category', 'mrbt:description', 'mrbt:priority', 'mrbt:assignedUserName']));
    this.fields = this.fieldsMain;

    if (isDevMode()) {
      this.model["mrbt:assignedUserName"] = "Wolfgang Moser";
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
  }

  onDialogClose(result : boolean)
  {
    if (result)
    {
      const contentTypes = ['application/json'];
      const pathParams = {
        'nodeId': '-root-',
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
        "relativePath": "${MRBauTask.TASK_RELATIVE_ROOT_PATH}",
        "properties":{
          "mrbt:category": ${this.model["mrbt:category"]},
          "mrbt:priority": ${this.model["mrbt:priority"]},
          "mrbt:description": "${this.model["mrbt:description"]}",
          "mrbt:assignedUserName": "${this.model["mrbt:assignedUserName"]}",
          "mrbt:fullDescription": "${this.model["mrbt:fullDescription"] ? this.model["mrbt:fullDescription"] : ""}",
          "mrbt:dueDateValue": "${this.model["mrbt:dueDateValue"] ? this.model["mrbt:dueDateValue"] : ""}"
        }
        ${targets}
      }`;
      //console.log(postBody);
      this.nodesApiService.nodesApi.apiClient.callApi("/nodes/{nodeId}/children", "POST", pathParams, {}, {}, {}, postBody, contentTypes, accepts).then(
        (success) => {
          success;
          this.notificationService.showInfo('Aufgabe erfolgreich erstellt');
        })
        .catch((error) => {
          //console.log(error);
          this.notificationService.showError('Fehler: '+error);
        });
    }
  }

  modelChangeEvent()
  {
    const cat = this.model['mrbt:category'];
    if (cat && cat != this._oldCategory)
    {
      this._oldCategory = cat;
      if (cat > EMRBauTaskCategory.CommonTaskStart && cat < EMRBauTaskCategory.CommonTaskLast)
      {
        // set default date today + 14 days
        let date = new Date();
        date.setDate( date.getDate() + MRBauTask.DEFAULT_TASK_DURATION );
        (this.form.get('mrbt:dueDateValue') as AbstractControl<string,string>).patchValue(this.mrbauCommonService.getFormDateValue(date));
        // set default priority
        (this.form.get('mrbt:priority') as AbstractControl<number,number>).patchValue(2);
        // update model parameter according to task
        if (cat == EMRBauTaskCategory.CommonTaskInfo)
        {
          (this.form.get('mrbt:description') as AbstractControl<string,string>).patchValue("Zur Information");
          (this.form.get('mrbt:dueDateValue') as AbstractControl<string,string>).patchValue(undefined);
        }
        else if (cat == EMRBauTaskCategory.CommonTaskApprove)
        {
          (this.form.get('mrbt:description') as AbstractControl<string,string>).patchValue("Überprüfen und Genehmigen");
        }
        else
        {
          (this.form.get('mrbt:description') as AbstractControl<string,string>).patchValue("");
        }
      }
      else if (cat > EMRBauTaskCategory.NewDocumentStart && cat < EMRBauTaskCategory.NewDocumentLast)
      {}
    }
  }
}
