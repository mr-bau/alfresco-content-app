import { NotificationService } from '@alfresco/adf-core';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ITaskChangedData, MRBauTask } from '../../../declaration/mrbau-task-declarations';
import { MrbauCommonService } from '../../../services/mrbau-common.service';
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
  selector: 'mrbau-tasks-menu-reopen',
  template: `
    <button *ngIf="isVisible()" mat-menu-item (click)="onReopenTaskClicked()" [disabled]="isDisabled()">
      <mat-icon>lock_open</mat-icon>
        <span>Reopen Task</span>
    </button>
  `,
})
export class TaskMenuReopenComponent {
  @Input() task: MRBauTask | null = null;
  @Output() reopenClickedEvent = new EventEmitter<ITaskChangedData>();

  constructor(
    private notificationService:NotificationService,
    private mrbauCommonService: MrbauCommonService,
    ) { }

  isDisabled() : boolean {
    if (this.task != null)
    {
      return !this.task.isTaskInDoneState() || !this.mrbauCommonService.isSettingsUser();
    }
    return false;
  }

  isVisible() : boolean {
    if (this.task != null)
    {
      return this.task.isTaskInDoneState();
    }
    return false;
  }

  onReopenTaskClicked()
  {
    if (this.task == null) {
      return;
    }
    this.reopenClickedEvent.emit({task : this.task, queryTasks : true});
    this.notificationService.showInfo('Aufgabe wurde wieder geöffnet');
  }
}
