import { ContentService, NotificationService } from '@alfresco/adf-core';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MRBauTask } from '../mrbau-task-declarations';
import { MrbauCommonService } from '../services/mrbau-common.service';
import { ITaskChangedData } from '../tasks/tasks.component';

@Component({
  selector: 'aca-tasks-menu-delete',
  template: `
    <button mat-menu-item (click)="onDeleteTaskClicked()" [disabled]="isDisabled()">
      <mat-icon>delete</mat-icon>
        <span>Aufgabe Löschen</span>
    </button>
  `,
})
export class TasksMenuDeleteComponent {
  @Input() task: MRBauTask;
  @Output() taskChangeEvent = new EventEmitter<ITaskChangedData>();

  constructor(
    private contentService: ContentService,
    private notificationService:NotificationService,
    private mrbauCommonService: MrbauCommonService,
    ) { }

  isDisabled() : boolean {
    return !this.mrbauCommonService.isAdminUser();
  }

  onDeleteTaskClicked()
  {
    this.contentService.nodesApi.deleteNode(this.task.id,{permanent : true}).then(
      () => {
        this.taskChangeEvent.emit({task : this.task, queryTasks : true});
        this.notificationService.showInfo('Aufgabe wurde gelöscht');
      })
      .catch(
        (err) => {
          this.notificationService.showError(err);
      });
  }
}
