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
  selector: 'mrbau-tasks-menu-delete',
  template: `
    <button *ngIf="!isDisabled()" mat-menu-item (click)="onDeleteTaskClicked()" [disabled]="isDisabled()">
      <mat-icon>delete</mat-icon>
        <span>Aufgabe Löschen</span>
    </button>
  `,
})
export class TaskMenuDeleteComponent {
  @Input() task: MRBauTask | undefined;
  @Output() taskChangeEvent = new EventEmitter<ITaskChangedData>();

  constructor(
    private notificationService:NotificationService,
    private mrbauCommonService: MrbauCommonService,
    ) { }

  isDisabled() : boolean {
    return !this.mrbauCommonService.isSuperUser();
  }

  async onDeleteTaskClicked()
  {
    try
    {
      if (!this.task) {
        throw new Error('Error - Task is null');
      }
      await this.mrbauCommonService.deleteNode(this.task.id, {permanent : true});
      this.taskChangeEvent.emit({task : this.task, queryTasks : true});
      this.notificationService.showInfo('Aufgabe wurde gelöscht');
    }
    catch(error:any) {
      console.log(error);
      this.notificationService.showError(''+error);
    };
  }
}
