import { NotificationService } from '@alfresco/adf-core';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MRBauTask } from '../mrbau-task-declarations';
import { MrbauCommonService } from '../services/mrbau-common.service';
import { ITaskChangedData } from '../tasks/tasks.component';

@Component({
  selector: 'aca-tasks-menu-reopen',
  template: `
    <button *ngIf="isVisible()" mat-menu-item (click)="onReopenTaskClicked()" [disabled]="isDisabled()">
      <mat-icon>lock_open</mat-icon>
        <span>Reopen Task</span>
    </button>
  `,
})
export class TasksMenuReopenComponent {
  @Input() task: MRBauTask;
  @Output() reopenClickedEvent = new EventEmitter<ITaskChangedData>();

  constructor(
    private notificationService:NotificationService,
    private mrbauCommonService: MrbauCommonService,
    ) { }

  isDisabled() : boolean {
    if (this.task)
    {
      return !this.task?.isTaskInDoneState() || !this.mrbauCommonService.isSuperUser();
    }
    return false;
  }

  isVisible() : boolean {
    return this.task?.isTaskInDoneState()
  }

  onReopenTaskClicked()
  {
    this.reopenClickedEvent.emit({task : this.task, queryTasks : true});
    this.notificationService.showInfo('Aufgabe wurde wieder geöffnet');
  }
}
