import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MRBauTask } from '../mrbau-task-declarations';
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
    this.mrbauWorkflowService.resetArchiveTypeWithConfirmDialog(this.task.associatedDocumentRef[0])
  }
}
