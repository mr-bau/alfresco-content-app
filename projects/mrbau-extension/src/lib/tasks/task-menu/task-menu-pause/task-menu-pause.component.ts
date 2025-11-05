import { Component, EventEmitter, Input, Output } from '@angular/core';
import { EMRBauTaskStatus, MRBauTask } from '../../../declaration/mrbau-task-declarations';
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
  selector: 'mrbau-tasks-menu-pause',
  template: `
    <button mat-menu-item (click)="onPauseTaskClicked()">
      <mat-icon>pause</mat-icon>
        <span>{{label}}</span>
    </button>
  `,
})
export class TaskMenuPauseComponent{
  private _task: MRBauTask | undefined;
  @Input() set task(value: MRBauTask)
  {
    this._task = value;
    this.setLabel();
  }
  get task(): MRBauTask | undefined {
    return this._task;
  }
  @Output() pauseClicked = new EventEmitter<void>();
  label : string = ""

  setLabel() {
    if (this.task && this.task.status === EMRBauTaskStatus.STATUS_PAUSED)
    {
      this.label = "Aufgabe Fortsetzen";
    }
    else
    {
      this.label = "Aufgabe Pausieren";
    }
  }

  onPauseTaskClicked()
  {
    if (!this.task)
      return;

    this.pauseClicked.emit();
  }
}
