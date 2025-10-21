
import { Component, Input } from '@angular/core';


import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { TasksDetailNewDocumentComponent } from '../../task-detail/task-detail-new-document/tasks-detail-new-document.component';
import { MrbauCommonService } from '../../../services/mrbau-common.service';
import { MrbauWorkflowService } from '../../../services/mrbau-workflow.service';
import { EMRBauTaskStatus } from '../../../declaration/mrbau-task-declarations';


@Component({
  selector: 'mrbau-tasks-menu-test',
  standalone:true,
  imports:[
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
  ],
  template: `
    <button *ngIf="isVisible()" mat-menu-item (click)="onTestTaskClicked()" [disabled]="isDisabled()">
      <mat-icon>auto_fix_height</mat-icon>
        <span>Run Test "Proposed Documents"</span>
    </button>
  `,
})
export class TasksMenuTestComponent {
  @Input() tasksDetailNewDocumentComponent : TasksDetailNewDocumentComponent | undefined ;

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
    if (this.tasksDetailNewDocumentComponent == null || this.tasksDetailNewDocumentComponent.taskNode == null || this.tasksDetailNewDocumentComponent.task == null) {
      return;
    }

    const result = await this.mrbauWorkflowService.queryProposedDocuments(this.tasksDetailNewDocumentComponent.taskNode);
    const entries = result?.list?.entries;
    if (entries == null) {
      return;
    }
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
