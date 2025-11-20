import { NotificationService } from '@alfresco/adf-core';
import { NodeBodyUpdate } from '@alfresco/js-api';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MrbauDelegateTaskDialogComponent } from '../../../dialogs/mrbau-delegate-task-dialog/mrbau-delegate-task-dialog.component';
import { EMRBauTaskStatus, ITaskChangedData, MRBauTask } from '../../../declaration/mrbau-task-declarations';
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
  selector: 'mrbau-tasks-menu-delegate',
  template: `
    <button mat-menu-item (click)="onDelegateTaskClicked()">
      <mat-icon>send</mat-icon>
        <span>Aufgabe Delegieren</span>
    </button>
  `,
})
export class TaskMenuDelegateComponent {
  @Input() task: MRBauTask | null = null;
  @Output() taskChangeEvent = new EventEmitter<ITaskChangedData>();

  constructor(
    private dialog: MatDialog,
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

  async delegateTask(model:any)
  {
    const newUser : string = model["mrbt:assignedUserName"]
    if (!newUser || !this.task)
    {
      return;
    }

    let nodeBodyUpdate : NodeBodyUpdate = {};
    nodeBodyUpdate.properties = {"mrbt:assignedUserName": newUser};
    if (this.task.isInNotifyState())
    {
      // change state to new
      nodeBodyUpdate.properties["mrbt:status"] = ""+EMRBauTaskStatus.STATUS_NEW;
    }
    if (this.task.status == EMRBauTaskStatus.STATUS_FINAL_APPROVAL)
    {
      // change state to verification
      nodeBodyUpdate.properties["mrbt:status"] = ""+EMRBauTaskStatus.STATUS_INVOICE_VERIFICATION;
    }

    let commentNodeId = this.task.id;
    if (this.task.isNewDocumentTask() && this.task.associatedDocumentRef.length > 0 )
    {
      commentNodeId = this.task.associatedDocumentRef[0];
    }

    try
    {
      await this.mrbauCommonService.addComment(commentNodeId, model.comment);
      const nodeEntry = await this.mrbauCommonService.updateNode(this.task.id, nodeBodyUpdate);
      this.task.assignedUserName = newUser;
      this.task.updateWithNodeData(nodeEntry.entry);
      this.taskChangeEvent.emit({task : this.task, queryTasks : true});
      this.notificationService.showInfo('Änderungen erfolgreich gespeichert');
    }
    catch(err:any)
    {
      this.notificationService.showError(err);
    };
  }
}
