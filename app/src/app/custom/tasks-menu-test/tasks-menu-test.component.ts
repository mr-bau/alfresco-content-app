
import { Component, Input } from '@angular/core';

import { MrbauCommonService } from '../services/mrbau-common.service';
import { MrbauWorkflowService } from '../services/mrbau-workflow.service';
import { TasksDetailNewDocumentComponent } from '../tasks-detail-new-document/tasks-detail-new-document.component';
import { EMRBauTaskStatus } from '../mrbau-task-declarations';


@Component({
  selector: 'aca-tasks-menu-test',
  template: `
    <button *ngIf="isVisible()" mat-menu-item (click)="onTestTaskClicked()" [disabled]="isDisabled()">
      <mat-icon>auto_fix_height</mat-icon>
        <span>Run Test "Proposed Documents"</span>
    </button>
  `,
})
export class TasksMenuTestComponent {
  @Input() tasksDetailNewDocumentComponent: TasksDetailNewDocumentComponent;

  constructor(
    private mrbauCommonService: MrbauCommonService,
    private mrbauWorkflowService: MrbauWorkflowService,
    ) { }

  isDisabled() : boolean {
    return false;
  }

  isVisible() : boolean {
    return this.mrbauCommonService.isSuperUser();
  }

  async onTestTaskClicked()
  {
    const result = await this.mrbauWorkflowService.queryProposedDocuments(this.tasksDetailNewDocumentComponent.taskNode);
    const entries = result.list.entries;
    console.log(entries.length);
    let a = [];
    for (let i=0; i< entries.length; i++) {
      const e = entries[i].entry;
      a.push({n:e.name,kt:e.properties['mrba:costCarrierNumber'],date:e.properties['mrba:documentDate'],create:e.createdAt});
    }
    console.log(a);


    //console.log(result);
    this.tasksDetailNewDocumentComponent.task.status = EMRBauTaskStatus.STATUS_LINK_DOCUMENTS;
    this.tasksDetailNewDocumentComponent.updateButtonText();
    this.tasksDetailNewDocumentComponent.model = {};
    this.tasksDetailNewDocumentComponent.form.reset();
    this.tasksDetailNewDocumentComponent.fields = [];
    this.tasksDetailNewDocumentComponent.updateFormDC();
    this.tasksDetailNewDocumentComponent.recreateForm();
  }
}
