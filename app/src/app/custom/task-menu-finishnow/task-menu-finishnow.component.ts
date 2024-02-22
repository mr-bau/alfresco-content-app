import { ContentService, NotificationService } from '@alfresco/adf-core';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { EMRBauTaskStatus, MRBauTask } from '../mrbau-task-declarations';
import { MrbauCommonService } from '../services/mrbau-common.service';
import { ITaskChangedData } from '../tasks/tasks.component';
import { ConfirmDialogComponent } from '@alfresco/adf-content-services';
import { NodeBodyUpdate } from '@alfresco/js-api';


@Component({
  selector: 'aca-tasks-menu-finishnow',
  template: `
    <button  *ngIf="isVisible()" mat-menu-item (click)="onFinishNowClicked()">
      <mat-icon>flash_on</mat-icon>
        <span>Ohne Freigabe beenden</span>
    </button>
  `,
})
export class TaskMenuFinishnowComponent {
  @Input() task: MRBauTask;
  @Output() taskChangeEvent = new EventEmitter<ITaskChangedData>();

  constructor(
    private dialog: MatDialog,
    private contentService: ContentService,
    private mrbauCommonService:MrbauCommonService,
    private notificationService:NotificationService,
    ) { }

  isVisible() : boolean {
    return !this.task?.isTaskInDoneState() && this.task?.status == EMRBauTaskStatus.STATUS_INVOICE_REVIEW && this.mrbauCommonService.isSettingsUser();
  }

  onFinishNowClicked()
  {
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
    let nodeBodyUpdate : NodeBodyUpdate = {"properties": {"mrbt:status" : ""+EMRBauTaskStatus.STATUS_FINISHED}};
    try {
      const nodeEntry = await this.contentService.nodesApi.updateNode(this.task.id, nodeBodyUpdate)
      this.task.updateWithNodeData(nodeEntry.entry);
      this.notificationService.showInfo('Änderungen erfolgreich gespeichert');
      //await new Promise(f => setTimeout(f, 1000));
      this.taskChangeEvent.emit({task : this.task, queryTasks : true});
    } catch(err) {
        //this.errorMessage = err;
        this.notificationService.showError(err);
    }
  }
}
