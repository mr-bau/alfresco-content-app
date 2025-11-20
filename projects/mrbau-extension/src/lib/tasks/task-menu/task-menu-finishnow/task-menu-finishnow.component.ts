import { ConfirmDialogComponent, NotificationService } from '@alfresco/adf-core';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { EMRBauTaskStatus, ITaskChangedData, MRBauTask } from '../../../declaration/mrbau-task-declarations';
import { MrbauCommonService } from '../../../services/mrbau-common.service';
import { NodeBodyUpdate } from '@alfresco/js-api';
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
  selector: 'mrbau-tasks-menu-finishnow',
  template: `
    <button  *ngIf="isVisible()" mat-menu-item (click)="onFinishNowClicked()">
      <mat-icon>flash_on</mat-icon>
        <span>Ohne Freigabe beenden</span>
    </button>
  `,
})
export class TaskMenuFinishnowComponent {
  @Input() task: MRBauTask | null = null;
  @Output() taskChangeEvent = new EventEmitter<ITaskChangedData>();

  constructor(
    private dialog: MatDialog,
    private mrbauCommonService:MrbauCommonService,
    private notificationService:NotificationService,
    ) { }

  isVisible() : boolean {
    return this.mrbauCommonService.isFinishNowUser() &&
    (this.task?.status == EMRBauTaskStatus.STATUS_INVOICE_REVIEW || this.task?.status == EMRBauTaskStatus.STATUS_FORMAL_REVIEW);
  }

  onFinishNowClicked()
  {
    if (this.task == null) {
      return;
    }

    if (this.task.isTaskInDoneState()) {
      this.notificationService.showInfo('Already finished - nothing to do');
      return;
    }
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
          title: 'Aufgabe ohne Freigabe beenden',
          message: 'Soll die Aufgabe ohne Freigabe beendet werden?',
          yesLabel: 'Aufgabe Beenden',
          noLabel: 'Abbrechen',
        },
        minWidth: '250px'
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result)
      {
        this.finishTask();
      }
    });
  }

  async finishTask() {
    if (this.task == null) {
      return;
    }
    let nodeBodyUpdate : NodeBodyUpdate = {"properties": {"mrbt:status" : ""+EMRBauTaskStatus.STATUS_FINISHED}};
    try {
      const nodeEntry = await this.mrbauCommonService.updateNode(this.task.id, nodeBodyUpdate)
      this.task.updateWithNodeData(nodeEntry.entry);
      this.notificationService.showInfo('Änderungen erfolgreich gespeichert');
      //await new Promise(f => setTimeout(f, 1000));
      this.taskChangeEvent.emit({task : this.task, queryTasks : true});
    } catch(err:any) {
        //this.errorMessage = err;
        this.notificationService.showError(err);
    }
  }
}
