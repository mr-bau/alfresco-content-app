import { Component, Input, OnInit } from '@angular/core';
import { MRBauTask } from '../mrbau-task-declarations';

@Component({
  selector: 'aca-task-summary',
  template: `
  <mat-card class="addMarginTop" style="background:whitesmoke;">
      <div class="flex-container">
        <div class="flex-2">{{this.task.category | mrbauTaskCategory}}</div>
      </div>
      <div class="flex-container addMarginTop">

        <div class="flex-2"><i>Zugewiesen:</i> {{this.task.assignedUserName}} </div>
        <div class="flex-2"><i>Zu erledigen bis:</i> {{this.task.dueDateValue | date:'mediumDate'}}</div>
        <div class="flex-2"><i>Status:</i> {{this.task.status | mrbauTaskStatus}}</div>
      </div>
      <div class="flex-container addMarginTop">
        <div class="flex-2">{{getTaskDescription()}}</div>
      </div>
    </mat-card>
  `,
})
export class TaskSummaryComponent implements OnInit {
  @Input() task : MRBauTask;
  constructor() { }

  ngOnInit(): void {
  }

  getTaskDescription() : string {
    return (this.task && this.task.fullDescription) ? this.task.fullDescription : "(keine weitere Beschreibung angegeben)";
  }

}
