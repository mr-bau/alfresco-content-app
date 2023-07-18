import { NotificationService } from '@alfresco/adf-core';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { EMRBauTaskStatus, MRBauTask } from '../mrbau-task-declarations';
import { MrbauArchiveModelService } from '../services/mrbau-archive-model.service';
import { MrbauCommonService } from '../services/mrbau-common.service';
import { MrbauWorkflowService } from '../services/mrbau-workflow.service';
import { ITaskChangedData } from '../tasks/tasks.component';

@Component({
  selector: 'aca-tasks-menu-newarchivetype',
  template: `
  <button mat-menu-item (click)="onMenuClicked()" [disabled]="isDisabled()">
    <mat-icon>edit</mat-icon>
      <span>Dokument-Typ Ändern</span>
  </button>
`,
})
export class TasksMenuNewarchivetypeComponent {
  @Input() task: MRBauTask;
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

  onMenuClicked()
  {
    if (!this.task || this.task.associatedDocumentRef.length == 0)
    {
      return;
    }
    this.mrbauWorkflowService.resetArchiveTypeWithConfirmDialog(this.task.associatedDocumentRef[0])
    .then((result) => {
      if (result == null)
      {
        return Promise.resolve(null);
      }
      const documentCategory = this.mrbauArchiveModelService.mrbauArchiveModel.getDocumentCategoryFromName(result);
      const desc = this.mrbauArchiveModelService.getTaskDescription(this.task.category, documentCategory);
      return this.mrbauCommonService.updateTaskDescription(this.task.id, desc);
    })
    .then((result) => {
      if (result != null)
      {
        this.taskChangeEvent.emit({task: this.task, queryTasks: true});
      }
    })
    .catch(error => {
      console.log(error);
      this.notificationService.showError(error);
    });
  }
}
