import { NotificationService } from '@alfresco/adf-core';
import { Node, NodeBodyUpdate } from '@alfresco/js-api';
import { Component, EventEmitter, Input, Output } from '@angular/core';
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
  selector: 'mrbau-tasks-menu-discard-document',
  template: `
  <button mat-menu-item (click)="onMenuClicked()" [disabled]="isDisabled()">
    <mat-icon>delete</mat-icon>
      <span>{{label}}</span>
  </button>
`,
})
export class TaskMenuDiscardDocumentComponent {
  @Input() task: MRBauTask | null = null;
  _taskNode : Node | null = null;
  @Input() set taskNode(val : Node | null) {
    this._taskNode = val;
    this.onTaskNodeChanged();
  }
  get taskNode() : Node | null {
    return this._taskNode;
  }

  @Output() taskChangeEvent = new EventEmitter<ITaskChangedData>();
  label = "-";

  constructor(
    private mrbauCommonService: MrbauCommonService,
    private notificationService : NotificationService,
    ) { }

  onTaskNodeChanged() {
    this.label = this.isDiscardedDocument() ? "Dokument Wiederherstellen" : "Dokument löschen";
  }

  isDiscardedDocument() : boolean {
    return !(this.taskNode?.properties["mrba:discardDate"] == null);
  }

  isDisabled() : boolean {
    return !this.task || this.task.associatedDocumentRef.length == 0 || !this.mrbauCommonService.isSettingsUser();
  }

  async undeleteDocument() {
    if (!this.isDiscardedDocument()) {
      return;
    }
    if (this.taskNode == null || this.task == null)
    {
      return;
    }
    try {
      const id = this.taskNode.id;
      const result = await this.mrbauCommonService.getNode(id, {fields : ['aspectNames']}).toPromise();
      const index = result?.entry?.aspectNames?.indexOf("mrba:discardedDocument");
      if (result != null && index != null && index >= 0) {
        const aspectNames = result?.entry.aspectNames;
        aspectNames?.splice(index, 1);
        const nodeBodyUpdate : NodeBodyUpdate = {
          aspectNames : aspectNames
        }
        await this.mrbauCommonService.updateNode(id, nodeBodyUpdate);
        this.notificationService.showInfo('Dokument erfolgreich wiederhergestellt');
        this.taskChangeEvent.emit({task : this.task, queryTasks : true});
      }
    }
    catch (error : any) {
      this.notificationService.showError(error);
    }
  }

  async deleteDocument() {
    if (this.taskNode == null || this.task == null)
    {
      return;
    }
    try {
      const result = await this.mrbauCommonService.discardDocumentWithConfirmDialog(this.task.associatedDocumentRef[0])
      // successfully deleted or canceled
      if (result === true)
      {
        //DELETE_SUCCESS
        this.mrbauCommonService.updateTaskStatus(this.task.id, EMRBauTaskStatus.STATUS_FINISHED)
        this.notificationService.showInfo('Dokument erfolgreich gelöscht');
        this.taskChangeEvent.emit({task : this.task, queryTasks : true});
      } else {
        // DELETE CANCEL
        console.log(result);
      }
    } catch(error:any) {
      this.notificationService.showError(error);
    };
  }

  onMenuClicked()
  {
    if (!this.task || this.task.associatedDocumentRef.length == 0)
    {
      return;
    }

    if (this.isDiscardedDocument()) {
      this.undeleteDocument();
    }
    else {
      this.deleteDocument();
    }
  }
}
