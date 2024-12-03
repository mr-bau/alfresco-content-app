import { NotificationService } from '@alfresco/adf-core';
import { Node, NodeBodyUpdate } from '@alfresco/js-api';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { EMRBauTaskStatus, MRBauTask } from '../mrbau-task-declarations';
import { MrbauCommonService } from '../services/mrbau-common.service';
import { ITaskChangedData } from '../tasks/tasks.component';

@Component({
  selector: 'aca-tasks-menu-discard-document',
  template: `
  <button mat-menu-item (click)="onMenuClicked()" [disabled]="isDisabled()">
    <mat-icon>delete</mat-icon>
      <span>{{label}}</span>
  </button>
`,
})
export class TasksMenuDiscardDocumentComponent {
  @Input() task: MRBauTask;
  _taskNode : Node;
  @Input() set taskNode(val : Node) {
    this._taskNode = val;
    this.onTaskNodeChanged();
  }
  get taskNode() : Node {
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
    return !this.task || this.task.associatedDocumentRef.length == 0;
  }

  async undeleteDocument() {
    if (!this.isDiscardedDocument()) {
      return;
    }
    try {
      const id = this.taskNode.id;
      const result = await this.mrbauCommonService.getNode(id, {fields : ['aspectNames']}).toPromise();
      const index = result.entry?.aspectNames?.indexOf("mrba:discardedDocument");
      if (index !== null && index >= 0) {
        const aspectNames = result.entry.aspectNames;
        aspectNames.splice(index, 1);
        const nodeBodyUpdate : NodeBodyUpdate = {
          aspectNames : aspectNames
        }
        await this.mrbauCommonService.updateNode(id, nodeBodyUpdate);
        this.notificationService.showInfo('Dokument erfolgreich wiederhergestellt');
        this.taskChangeEvent.emit({task : this.task, queryTasks : true});
      }
    }
    catch (error) {
      console.log(error);
      this.notificationService.showError(error);
    }
  }

  async deleteDocument() {
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
    } catch(error) {
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
