import { Component, Input } from '@angular/core';
import { MRBauTask } from '../../../declaration/mrbau-task-declarations';
import { MrbauActionService } from '../../../services/mrbau-action.service';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { IconModule } from '@alfresco/adf-core';
import { MatMenuModule } from '@angular/material/menu';
@Component({
  standalone:true,
  imports:[
    CommonModule,
    MatButtonModule,
    MatIconModule,
    IconModule,
    MatMenuModule,
  ],
  selector: 'mrbau-tasks-menu-ocr',
  template: `
      <button mat-menu-item (click)="onClicked()" [disabled]="isDisabled()">
        <adf-icon value="mrbau:ocr"></adf-icon>
          <span>OCR starten</span>
      </button>
    `,
})
export class TaskMenuOcrComponent {
  @Input() task: MRBauTask | null = null;

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
