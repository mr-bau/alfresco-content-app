import { Component, Input, Output, OnInit, EventEmitter, ViewEncapsulation } from '@angular/core';

import { ConfirmDialogComponent } from '@alfresco/adf-content-services';
import { ContentService, NotificationService } from '@alfresco/adf-core';
import { NodeBodyUpdate, Node } from '@alfresco/js-api';

import { FormlyFormOptions, FormlyFieldConfig } from '@ngx-formly/core';
import { FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';

import { CONST } from '../mrbau-global-declarations';
import { EMRBauTaskCategory, EMRBauTaskStatus, MRBauTask } from '../mrbau-task-declarations';
import { MrbauConfirmTaskDialogComponent } from '../dialogs/mrbau-confirm-task-dialog/mrbau-confirm-task-dialog.component';
import { MrbauFormLibraryService } from '../services/mrbau-form-library.service';
import { TaskBarButton } from '../tasksdetail/tasksdetail.component';
import { IFileSelectData, ITaskChangedData } from '../tasks/tasks.component';
import { MrbauCommonService } from '../services/mrbau-common.service';

@Component({
  selector: 'aca-tasks-detail-common',
  templateUrl: './tasks-detail-common.component.html',
  styleUrls: ['../form/mrbau-form-global.scss', './tasks-detail-common.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class TasksDetailCommonComponent implements OnInit {
  @Output() fileSelectEvent = new EventEmitter<IFileSelectData>();
  @Output() taskChangeEvent = new EventEmitter<ITaskChangedData>();
  @Output() errorEvent = new EventEmitter<string>();

  @Input()
  set task(val: MRBauTask) {
    this._task = val;
    this.queryNewData();
  }
  get task(): MRBauTask {
    return this._task;
  }
  private _task : MRBauTask = null;

  set errorMessage(val : string) {
    this._errorMessage = val;
    this.errorEvent.emit(this._errorMessage);
  }
  private _errorMessage: string = null;

  form = new FormGroup({});
  model: any = {};
  options: FormlyFormOptions = { } ;
  fields : FormlyFieldConfig[] = [];

  commentPanelOpened:boolean=false;
  historyPanelOpened:boolean=false;

  taskBarButtons : TaskBarButton[] = [];

  constructor(private _dialog: MatDialog,
    private _contentService: ContentService,
    private _notificationService: NotificationService,
    private _mrbauFormLibraryService : MrbauFormLibraryService,
    private _mrbauCommonService : MrbauCommonService,
    ) {
  }

  readonly taskBarButtonsNormal : TaskBarButton[] = [
    { icon:"done", class:"mat-primary", tooltip:"Aufgabe fertigstellen", text:"Erledigen", onClick: (event?:any) => { this.onFinishApproveTaskClicked(event); } }
  ];

  readonly taskBarButtonsNotifyState : TaskBarButton[] = [
    { icon:"done", class:"mat-primary", tooltip:"Aufgabe fertigstellen", text:"Gelesen", onClick: (event?:any) => { this.onFinishApproveTaskClicked(event); } }
  ];

  readonly taskBarButtonsApprove : TaskBarButton[] = [
    { icon:"done", class:"mat-primary", tooltip:"Aufgabe genehmigen", text:"Genehmigen", onClick: (event?:any) => { this.onFinishApproveTaskClicked(event, 'Aufgabe genehmigen', '', 'AUFGABE GENEHMIGEN'); } },
    { icon:"done", class:"mat-warn", tooltip:"Aufgabe ablehnen", text:"Ablehnen", onClick: (event?:any) => { this.onDeclineTaskClicked(event); } }
  ];

  updateTaskBarButtons()
  {
    if (!this._task)
    {
      this.taskBarButtons = [];
      return;
    }
    if (this._task.isInNotifyState())
    {
      this.taskBarButtons = this.taskBarButtonsNotifyState;
      return;
    }
    if (this._task.category == EMRBauTaskCategory.CommonTaskApprove)
    {
      this.taskBarButtons = this.taskBarButtonsApprove;
      return;
    }

    this.taskBarButtons = this.taskBarButtonsNormal;
  }

  ngOnInit(): void {
  }

  emitTaskChangeEvent(taskChangedData?:ITaskChangedData)
  {
    if (taskChangedData)
    {
      this.taskChangeEvent.emit(taskChangedData);
    }
    else
    {
      this.taskChangeEvent.emit({task : this.task, queryTasks : true});
    }
  }

  modelChangeEvent()
  {
    //console.log(this.model);
  }

  buttonSaveClicked()
  {
    this.saveStatusCommentUser(this.model['mrbt:status'], this.model.comment);
    this.model.comment = "";
  }

  saveStatusCommentUser(status : EMRBauTaskStatus, comment: string, newUserId?: string)
  {
    if (comment)
    {
      this.addComment(comment)
    }

    if (status != this._task.status || (newUserId && newUserId != this._task.assignedUserName))
    {
      this.saveNewStatus(status, newUserId);
    }
  }

  addComment(comment: string)
  {
    this._mrbauCommonService.addComment(this._task.id, comment)
    .then(() => {

      this._notificationService.showInfo('Änderungen erfolgreich gespeichert');
      this.resetModel();
    })
    .catch(err => this.errorMessage = (this.errorMessage) ? err : this.errorMessage+"\n"+err)
  }

  saveNewStatus(status : EMRBauTaskStatus, newUserId?: string)
  {
    let nodeBodyUpdate : NodeBodyUpdate = {"properties": {"mrbt:status": ""+status}};
    if (newUserId)
    {
      nodeBodyUpdate.properties["mrbt:assignedUserName"] = newUserId;
    }

    this._contentService.nodesApi.updateNode(this._task.id, nodeBodyUpdate).then(
      (nodeEntry) => {
        this._task.status = status;
        this._task.updateWithNodeData(nodeEntry.entry);
        this.resetModel();
        this.taskChangeEvent.emit({task : this._task, queryTasks : MRBauTask.isTaskInNotifyOrDoneState(status)});
        this._notificationService.showInfo('Änderungen erfolgreich gespeichert');
      })
      .catch((err) => this.errorMessage = err);
  }

  resetModel()
  {
    this.model = {};
    this.model['mrbt:status'] = this._task.status;
  }

  queryNewData()
  {
    this.errorMessage = null;
    this.resetModel();
    this.fields = [
      {
        fieldGroupClassName: 'flex-container',
        fieldGroup: [this._mrbauFormLibraryService.mrbt_status],
      },
      {
        fieldGroupClassName: 'flex-container',
        fieldGroup: [this._mrbauFormLibraryService.common_comment],
      }
    ];

    this.updateTaskBarButtons();
  }

  isTaskAdditionalToolbarButtonsVisible() : boolean{
    return this._mrbauCommonService.isAdminUser() || this.isTaskToolbarButtonsVisible();
  }

  isTaskToolbarButtonsVisible() : boolean{
    return this.task && !this.task.isTaskInDoneState();
  }

  isTaskModificationUiVisible() :boolean
  {
    return this.task && this.task.isTaskModificationUiVisible();
  }

  buttonAddFilesClicked()
  {
    this._mrbauCommonService.openLinkFilesDialog(this.addFiles.bind(this), this.setErrorMessage.bind(this));
  }
  setErrorMessage(error:string)
  {
    this.errorMessage = error;
  }
  addFiles(selectedNodes: Node[])
  {
    // remove folders
    const nodes = selectedNodes.filter((value:Node) => value.isFile)

    if (nodes.length == 0)
    {
      return;
    }

    let nodeIds: string[] = [];
    for (let i=0; i< nodes.length; i++)
    {
      nodeIds.push(nodes[i].id);
    }
    this._mrbauCommonService.addAssociatedDocumentFromTask(this._task.id, nodeIds)
    .then((success) => {
        success;
        this.resetModel();
        for (let i=0; i< nodes.length; i++)
        {
          const node = nodes[i];
          this._task.associatedDocumentName.push(node.name);
          this._task.associatedDocumentRef.push(node.id);
        }
        this.taskChangeEvent.emit({task : this._task, queryTasks : false});
        this._notificationService.showInfo('Änderungen erfolgreich gespeichert');
    })
    .catch((error) => {
      this.errorMessage = error;
    });
  }

  onAssociationClickedById(id : string)
  {
    if (!id)
    {
      this.fileSelectEvent.emit(null);
      return;
    }
    this.fileSelectEvent.emit({nodeId : id});
  }

  onAssociationClicked(i:number)
  {
    this.onAssociationClickedById(this._task.associatedDocumentRef[i]);
  }

  onRemoveAssociationClicked(i:number)
  {
    const dialogRef = this._dialog.open(ConfirmDialogComponent, {
      data: {
          title: 'Verknüpfung Löschen',
          message: 'Soll die Verknüpfung entfernt werden?',
          yesLabel: 'Verknüpfung Löschen',
          noLabel: 'Abbrechen',
        },
        minWidth: '250px'
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === true)
      {
        this.deleteAssociation(i);
      }
    });
  }

  deleteAssociation(i:number)
  {
    if (!this._task.associatedDocumentRef[i])
    {
      return;
    }
    this._mrbauCommonService.deleteAssociatedDocumentFromTask(this._task.id, this._task.associatedDocumentRef[i])
    .then((success) => {
        success;
        this.resetModel();
        // remove items from list
        this._task.associatedDocumentName.splice(i, 1);
        this._task.associatedDocumentRef.splice(i, 1);
        this.taskChangeEvent.emit({task : this._task, queryTasks : false});
        this._notificationService.showInfo('Änderungen erfolgreich gespeichert');
    })
    .catch((error) => {
      this.errorMessage = error;
    });
  }


  onDeclineTaskClicked(event?:any)
  {
    event;
    const dialogRef = this._dialog.open(MrbauConfirmTaskDialogComponent, {
      data: {
        dialogTitle: 'Aufgabe Ablehnen',
        dialogMsg: 'Eine abgeschlossene Aufgabe kann nicht mehr geöffnet werden.',
        dialogButtonOK: 'AUFGABE ABLEHNEN',
        callQueryData: false,
        fieldsMain: [
          {
            fieldGroupClassName: 'flex-container-min-width',
            fieldGroup: [
              {
                className: 'flex-2',
                key: 'comment',
                type: 'textarea',
                props: {
                  label: 'Optionaler Kommentar',
                  description: 'Kommentar',
                  maxLength: CONST.MAX_LENGTH_COMMENT,
                  required: false,
                },
              },
            ]
          }
        ],
        payload: this._task
      }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result)
      {
        this.saveStatusCommentUser(EMRBauTaskStatus.STATUS_NOTIFY_DECLINED, result.comment);
      }
    });
  }

  onFinishApproveTaskClicked(event?:any, title? :string, message?: string, okText? : string)
  {
    event;
    // if in notify state finish immediately
    if (this._task.isInNotifyState() || this._task.category == EMRBauTaskCategory.CommonTaskInfo)
    {
      this.saveNewStatus(EMRBauTaskStatus.STATUS_FINISHED);
      return;
    }

    const dialogRef = this._dialog.open(MrbauConfirmTaskDialogComponent, {
      data: {
        dialogTitle: title ? title : 'Aufgabe Fertigstellen',
        dialogMsg: message ? message : 'Eine fertiggestellte Aufgabe kann nicht mehr geöffnet werden.',
        dialogButtonOK: okText ? okText : 'AUFGABE ERLEDIGEN',
        callQueryData: false,
        fieldsMain: [
          {
            fieldGroupClassName: 'flex-container-min-width',
            fieldGroup: [
              {
                className: 'flex-2',
                key: 'comment',
                type: 'textarea',
                props: {
                  label: 'Optionaler Kommentar',
                  description: 'Kommentar',
                  maxLength: CONST.MAX_LENGTH_COMMENT,
                  required: false,
                },
              },
            ]
          }
        ],
        payload: this._task
      }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result)
      {
        if (this._task.category == EMRBauTaskCategory.CommonTaskApprove)
        {
          // notify always to keep approval status in version history
          this.saveStatusCommentUser(EMRBauTaskStatus.STATUS_NOTIFY_APPROVED, result.comment, this._task.createdUser.id);
        }
        else if (this._task.assignedUserName == this._task.createdUser.id || this._task.category == EMRBauTaskCategory.CommonTaskInfo)
        {
          // finish immediately and keep assigned user - no need for notify state
          this.saveStatusCommentUser(EMRBauTaskStatus.STATUS_FINISHED, result.comment);
        }
        else
        {
          // notify creator
          this.saveStatusCommentUser(EMRBauTaskStatus.STATUS_NOTIFY_DONE, result.comment, this._task.createdUser.id);
        }
      }
    });
  }
}