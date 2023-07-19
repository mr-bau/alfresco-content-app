import { NotificationService } from '@alfresco/adf-core';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { EMRBauTaskStatus, MRBauTask } from '../mrbau-task-declarations';
import { MrbauCommonService } from '../services/mrbau-common.service';
import { ITaskChangedData } from '../tasks/tasks.component';

@Component({
  selector: 'aca-tasks-menu-discard-document',
  template: `
  <button mat-menu-item (click)="onMenuClicked()" [disabled]="isDisabled()">
    <mat-icon>delete</mat-icon>
      <span>Dokument löschen</span>
  </button>
`,
})
export class TasksMenuDiscardDocumentComponent {
  @Input() task: MRBauTask;
  @Output() taskChangeEvent = new EventEmitter<ITaskChangedData>();

  constructor(
    private mrbauCommonService: MrbauCommonService,
    private notificationService : NotificationService,
    ) { }

  isDisabled() : boolean {
    return !this.task || this.task.associatedDocumentRef.length == 0;
  }

  onMenuClicked()
  {
    if (!this.task || this.task.associatedDocumentRef.length == 0)
    {
      return;
    }
    this.task.associatedDocumentRef[0]

    this.mrbauCommonService.discardDocumentWithConfirmDialog(this.task.associatedDocumentRef[0])
    .then((result) => {
      // successfully deleted or canceled
      if (result === true)
      {
        //DELETE_SUCCESS
        this.mrbauCommonService.updateTaskStatus(this.task.id, EMRBauTaskStatus.STATUS_FINISHED)
        this.notificationService.showInfo('Dokument erfolgreich gelöscht');
        this.taskChangeEvent.emit({task : this.task, queryTasks : true});
      } else {
        // DELETE CANCEL
      }
    })
    .catch(error => {
      this.notificationService.showError(error);
    });
  }
}
