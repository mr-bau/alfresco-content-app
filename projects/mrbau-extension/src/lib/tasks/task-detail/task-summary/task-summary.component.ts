import { Component, Input, OnInit } from '@angular/core';
import { MRBauTask, MRBauTaskCategoryPipe, MRBauTaskStatusPipe } from '../../../declaration/mrbau-task-declarations';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';

@Component({
  standalone:true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MRBauTaskCategoryPipe,
    MRBauTaskStatusPipe,
  ],
  selector: 'mrbau-task-common-summary',
  template: `
  <mat-card class="addMarginTop addPadding">
      <ng-container *ngIf="this.task">
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
      </ng-container>
    </mat-card>
  `,
})
export class TaskSummaryComponent implements OnInit {
  @Input() task : MRBauTask | undefined;
  constructor() { }
  ngOnInit(): void {
  }

  getTaskDescription() : string {
    return (this.task && this.task.fullDescription) ? this.task.fullDescription : "(keine weitere Beschreibung angegeben)";
  }
}
