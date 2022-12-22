import { Component, Input } from '@angular/core';
import { MRBauTask } from '../mrbau-task-declarations';
import { MrbauActionService } from '../services/mrbau-action.service';
@Component({
  selector: 'aca-tasks-menu-ocr',
  template: `
      <button mat-menu-item (click)="onClicked()" [disabled]="isDisabled()">
        <adf-icon value="mrbau:ocr"></adf-icon>
          <span>OCR starten</span>
      </button>
    `,
})
export class TasksMenuOcrComponent {
  @Input() task: MRBauTask;

  constructor(
    private mrbauActionService: MrbauActionService,
    ) { }

  isDisabled() : boolean {
    return !this.task || this.task.associatedDocumentRef.length == 0;
  }

  onClicked()
  {
    if (!this.task || this.task.associatedDocumentRef.length == 0)
    {
      return;
    }
    this.mrbauActionService.startOcrTransformById(this.task.associatedDocumentRef[0])
  }
}
