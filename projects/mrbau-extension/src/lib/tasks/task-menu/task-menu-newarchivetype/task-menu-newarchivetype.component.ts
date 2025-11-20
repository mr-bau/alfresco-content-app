import { NotificationService } from '@alfresco/adf-core';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { EMRBauTaskStatus, ITaskChangedData, MRBauTask } from '../../../declaration/mrbau-task-declarations';
import { MrbauArchiveModelService } from '../../../services/mrbau-archive-model.service';
import { MrbauCommonService } from '../../../services/mrbau-common.service';
import { MrbauWorkflowService } from '../../../services/mrbau-workflow.service';

import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';

@Component({
  standalone:true,
  imports:[
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
  ],
  selector: 'mrbau-tasks-menu-newarchivetype',
  template: `
  <button mat-menu-item (click)="onMenuClicked()" [disabled]="isDisabled()">
    <mat-icon>edit</mat-icon>
      <span>Dokument-Typ Ändern</span>
  </button>
`,
})
export class TaskMenuNewarchivetypeComponent {
  @Input() task: MRBauTask | null = null;
  @Output() taskChangeEvent = new EventEmitter<ITaskChangedData>();

  constructor(
    private mrbauWorkflowService: MrbauWorkflowService,
    private mrbauCommonService: MrbauCommonService,
    private mrbauArchiveModelService : MrbauArchiveModelService,
    private notificationService : NotificationService,
    ) { }

  isDisabled() : boolean {
    return !this.task || this.task.associatedDocumentRef.length == 0 || this.task.status != EMRBauTaskStatus.STATUS_METADATA_EXTRACT_1;
  }

  async onMenuClicked()
  {
    if (!this.task || this.task.associatedDocumentRef.length == 0)
    {
      return;
    }
    try {
      const result = await this.mrbauWorkflowService.resetArchiveTypeWithConfirmDialog(this.task.associatedDocumentRef[0]);
      if (result == null)
      {
        return;
      }
      const documentCategory = this.mrbauArchiveModelService.mrbauArchiveModel.getDocumentCategoryFromName(result);
      if (documentCategory == null) {
        throw new Error('documentCategory not found');
      }
      const desc = this.mrbauArchiveModelService.getTaskDescription(this.task.category, documentCategory);
      const taskCategory = MRBauTask.getCategoryForArchiveDocument(documentCategory);
      const result2 = await this.mrbauCommonService.updateTaskDescriptionAndCategory(this.task.id, desc, taskCategory);
      if (result2 != null)
      {
        this.taskChangeEvent.emit({task: this.task, queryTasks: true});
      }
    }
     catch(error : any) {
      console.log(error);
      this.notificationService.showError(error);
    }
  }
}
