import { ContentService, NotificationService } from '@alfresco/adf-core';
import { NodeBodyUpdate } from '@alfresco/js-api';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MrbauDelegateTaskDialogComponent } from '../dialogs/mrbau-delegate-task-dialog/mrbau-delegate-task-dialog.component';
import { EMRBauTaskStatus, MRBauTask } from '../mrbau-task-declarations';
import { MrbauCommonService } from '../services/mrbau-common.service';

@Component({
  selector: 'aca-tasks-menu-delegate',
  template: `
    <button mat-menu-item (click)="onDelegateTaskClicked()">
      <mat-icon>send</mat-icon>
        <span>Aufgabe Deligieren</span>
    </button>
  `,
})
export class TasksMenuDelegateComponent {
  @Input() task: MRBauTask;
  @Output() taskChangeEvent = new EventEmitter<MRBauTask>();

  constructor(
    private dialog: MatDialog,
    private contentService: ContentService,
    private mrbauCommonService:MrbauCommonService,
    private notificationService:NotificationService,
    ) { }

  onDelegateTaskClicked()
  {
    const dialogRef = this.dialog.open(MrbauDelegateTaskDialogComponent, {
      data: { payload: this.task }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result)
      {
        this.delegateTask(result);
      }
    });
  }

  delegateTask(model) {
    const newUser : string = model.assignedUser
    if (!newUser)
    {
      return;
    }

    this.mrbauCommonService.addComment(this.task, model.comment);

    let nodeBodyUpdate : NodeBodyUpdate = {"properties": {"mrbt:assignedUserName": newUser}};
    if (this.task.isInNotifyState())
    {
      // change state to new
      nodeBodyUpdate.properties["mrbt:status"] = ""+EMRBauTaskStatus.STATUS_NEW;
    }

    this.contentService.nodesApi.updateNode(this.task.id, nodeBodyUpdate).then(
      (nodeEntry) => {
        this.task.assignedUserName = newUser;
        this.task.updateWithNodeData(nodeEntry.entry);
        this.notificationService.showInfo('Änderungen erfolgreich gespeichert');
        this.taskChangeEvent.emit(this.task);
      })
      .catch(
        (err) => {
          //this.errorMessage = err;
          this.notificationService.showError(err);
      });
  }
}
