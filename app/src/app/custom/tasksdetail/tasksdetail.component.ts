import { Component, Input, Output, OnInit, EventEmitter, ViewEncapsulation, ViewChild } from '@angular/core';

import { ConfirmDialogComponent, ContentNodeSelectorComponentData, ContentNodeSelectorComponent } from '@alfresco/adf-content-services';
import { CommentContentService, CommentModel, ContentService, NodesApiService, NotificationService } from '@alfresco/adf-core';
import { NodeBodyUpdate, NodeEntry, Node } from '@alfresco/js-api';

import { FormlyFormOptions, FormlyFieldConfig } from '@ngx-formly/core';
import { Subject } from 'rxjs';
import { FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';

import { CONST } from '../mrbau-global-declarations';
import { EMRBauTaskCategory, EMRBauTaskStatus, MRBauTask } from '../mrbau-task-declarations';
import { MrbauDelegateTaskDialogComponent } from '../dialogs/mrbau-delegate-task-dialog/mrbau-delegate-task-dialog.component';
import { MrbauConfirmTaskDialogComponent } from '../dialogs/mrbau-confirm-task-dialog/mrbau-confirm-task-dialog.component';
import { TaskCommentlistComponent } from '../task-commentlist/task-commentlist.component';
import { MrbauTaskFormLibrary } from '../form/mrbau-task-form-library';

interface TaskBarButton {
 icon : string;
 text:string,
 tooltip:string;
 class: string;
 onClick?: (event?:any) => void;
}

@Component({
  selector: 'aca-tasksdetail',
  templateUrl: './tasksdetail.component.html',
  styleUrls: ['../form/mrbau-form-global.scss', './tasksdetail.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class TasksdetailComponent implements OnInit {
  @ViewChild('commentlist') commentList : TaskCommentlistComponent;

  @Output() fileSelectEvent = new EventEmitter<string>();
  @Output() taskChangeEvent = new EventEmitter<MRBauTask>();

  @Input()
  set task(val: MRBauTask) {
    this._task = val;
    this.queryNewData();
  }
  get task(): MRBauTask {
    return this._task;
  }
  private _task : MRBauTask = null;

  nodeId : string = null;
  errorMessage: string = null;

  form = new FormGroup({});
  model: any = {};
  options: FormlyFormOptions = { } ;
  fields : FormlyFieldConfig[] = [];

  historyPanelOpened:boolean=false;
  commentPanelOpened:boolean=false;

  isTaskComplete : boolean = false;

  constructor(private _dialog: MatDialog,
    private _nodesApiService: NodesApiService,
    private _contentService: ContentService,
    private _notificationService: NotificationService,
    private _commentContentService: CommentContentService,
    ) {
  }

  readonly taskBarButtonsNormal : TaskBarButton[] = [
    { icon:"done", class:"mat-primary", tooltip:"Aufgabe abschließen", text:"Erledigen", onClick: (event?:any) => { this.onFinishApproveTaskClicked(event); } }
  ];

  readonly taskBarButtonsNotifyState : TaskBarButton[] = [
    { icon:"done", class:"mat-primary", tooltip:"Aufgabe abschließen", text:"Gelesen", onClick: (event?:any) => { this.onFinishApproveTaskClicked(event); } }
  ];

  readonly taskBarButtonsApprove : TaskBarButton[] = [
    { icon:"done", class:"mat-primary", tooltip:"Aufgabe genehmigen", text:"Genehmigen", onClick: (event?:any) => { this.onFinishApproveTaskClicked(event, 'Aufgabe genehmigen', '', 'AUFGABE GENEHMIGEN'); } },
    { icon:"done", class:"mat-warn", tooltip:"Aufgabe ablehnen", text:"Ablehnen", onClick: (event?:any) => { this.onDeclineTaskClicked(event); } }
  ];

  taskBarButtons : TaskBarButton[] = [];

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

  modelChangeEvent()
  {
    //console.log(this.model);
  }

  buttonSaveClicked()
  {
    this.saveStatusCommentUser(this.model.status, this.model.comment);
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
    comment = comment.trim();
    if (comment.length == 0)
    {
        return;
    }
    this._commentContentService.addNodeComment(this._task.id, comment).subscribe(
      (res: CommentModel) => {
        res;
        this._notificationService.showInfo('Änderungen erfolgreich gespeichert');
        this.resetModel();
        // update comment list
        this.commentList.queryData();
      },
      (err) => {
        this.errorMessage = (this.errorMessage) ? err : this.errorMessage+"\n"+err;
      }
    );
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
        this.taskChangeEvent.emit(this._task);
        this._notificationService.showInfo('Änderungen erfolgreich gespeichert');
      })
      .catch((err) => this.errorMessage = err);
  }

  resetModel()
  {
    this.model = {};
    this.model.status = this._task.status;
  }

  queryNewData()
  {
    this.errorMessage = null;
    if (this._task == null)
    {
      this.fileSelectEvent.emit(null);
      return;
    }
    this.nodeId = this._task.id;
    this.resetModel();
    this.fields = MrbauTaskFormLibrary.getForm(this.task);
    this.updateTaskBarButtons();
    this.onAssociationClicked(0, false);
  }

  ngAfterViewInit(): void {
    // check form validation
    // workaround for error "Expression has changed after it was checked."
    setTimeout(() => {
      this.isTaskComplete = this.form.valid;
    });
    this.form.statusChanges.subscribe(res => {
      this.isTaskComplete = ("VALID" === res as string);
    })
  }

  getTaskDescription() : string {
    return (this.task && this.task.fullDescription) ? this.task.fullDescription : "(keine weitere Beschreibung angegeben)";
  }

  isTaskModificationUiVisible() :boolean
  {
    return (this.task) ? this.task.isTaskModificationUiVisible() : false;
  }

  isToolbarVisible() : boolean
  {
    return !this._task.isTaskInDoneState();
  }

  buttonAddFilesClicked()
  {
    const data: ContentNodeSelectorComponentData = {
        title: "Datei auswählen",
        dropdownHideMyFiles: true,
        selectionMode: 'multiple',
        currentFolderId: null,
        select: new Subject<Node[]>()
    };

    this._dialog.open(
        ContentNodeSelectorComponent,
        {
            data,
            panelClass: 'adf-content-node-selector-dialog',
            minWidth: '630px'
        },
    );

    data.select.subscribe((selections: Node[]) => {
        // Use or store selection...
        this.addFiles(selections);
    },
    (error)=>{
        //your error handling
        this.errorMessage = error;
    },
    ()=>{
        //action called when an action or cancel is clicked on the dialog
        this._dialog.closeAll();
    });
  }

  addFiles(nodes: Node[])
  {
    if (nodes.length == 0)
    {
      return;
    }

    let bodyParams = [];
    for (let i=0; i< nodes.length; i++)
    {
      bodyParams.push({
        targetId : nodes[i].id,
        assocType : 'mrbt:associatedDocument'}
      );
    };

    const pathParams = {
      'nodeId': this._task.id
    };
    const queryParams = {};
    const headerParams= {};
    const formParams = {};
    const contentTypes = ['application/json'];
    const accepts = ['application/json'];
    this._nodesApiService.nodesApi.apiClient.callApi("/nodes/{nodeId}/targets", "POST", pathParams, queryParams, headerParams, formParams, bodyParams, contentTypes, accepts).then(
      (success) => {
        success;
        this.resetModel();
        for (let i=0; i< nodes.length; i++)
        {
          const node = nodes[i];
          this._task.associatedDocumentName.push(node.name);
          this._task.associatedDocumentRef.push(node.id);
        }
        this.taskChangeEvent.emit(this._task);
        this._notificationService.showInfo('Änderungen erfolgreich gespeichert');
    })
    .catch((error) => {
      this.errorMessage = error;
    });
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

    const pathParams = {
       nodeId: this._task.id,
       targetId: this._task.associatedDocumentRef[i],
       assocType : 'mrbt:associatedDocumentRef'
    };
    const queryParams = {};
    const headerParams= {};
    const formParams = {};
    const bodyParams = [];
    const contentTypes = ['application/json'];
    const accepts = ['application/json'];
    this._nodesApiService.nodesApi.apiClient.callApi("/nodes/{nodeId}/targets/{targetId}", "DELETE", pathParams, queryParams, headerParams, formParams, bodyParams, contentTypes, accepts).then(
      (success) => {
        success;
        this.resetModel();
        // remove items from list
        this._task.associatedDocumentName.splice(i, 1);
        this._task.associatedDocumentRef.splice(i, 1);
        this.taskChangeEvent.emit(this._task);
        this._notificationService.showInfo('Änderungen erfolgreich gespeichert');
    })
    .catch((error) => {
      this.errorMessage = error;
    });
  }

  onAssociationClickedById(id : string, suppressNotification?:boolean)
  {
    this._contentService.getNode(id).subscribe(
      (node: NodeEntry) => {
        if (CONST.isPdfDocument(node))
        {
          this.fileSelectEvent.emit(this._contentService.getContentUrl(id));
        }
        else
        {
          this.fileSelectEvent.emit(null);
          if (!suppressNotification)
          {
            this._notificationService.showInfo('Nur PDF-Dokumente werden angezeigt!');
          }
        }
      },
      error => {
        this.errorMessage = error;
      }
    );
  }

  onAssociationClicked(i:number, suppressNotification?:boolean)
  {
    if (!this._task.associatedDocumentRef[i])
    {
      this.fileSelectEvent.emit(null);
      return;
    }

    let id : string = this._task.associatedDocumentRef[i];
    this.onAssociationClickedById(id, suppressNotification);
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
                templateOptions: {
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
        dialogTitle: title ? title : 'Aufgabe Abschließen',
        dialogMsg: message ? message : 'Eine abgeschlossene Aufgabe kann nicht mehr geöffnet werden.',
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
                templateOptions: {
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

  onDelegateTaskClicked(model)
  {
    model;
    const dialogRef = this._dialog.open(MrbauDelegateTaskDialogComponent, {
      data: { payload: this._task }
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

    if (model.comment)
    {
      this.addComment(model.comment);
    }

    let nodeBodyUpdate : NodeBodyUpdate = {"properties": {"mrbt:assignedUserName": newUser}};
    if (this._task.isInNotifyState())
    {
      // change state to new
      nodeBodyUpdate.properties["mrbt:status"] = ""+EMRBauTaskStatus.STATUS_NEW;
    }

    this._contentService.nodesApi.updateNode(this._task.id, nodeBodyUpdate).then(
      (nodeEntry) => {
        this._task.assignedUserName = newUser;
        this._task.updateWithNodeData(nodeEntry.entry);
        this.resetModel();
        this._notificationService.showInfo('Änderungen erfolgreich gespeichert');
        this.taskChangeEvent.emit(this._task);
      })
      .catch((err) => this.errorMessage = err);
  }

  onCancelTaskClicked(model)
  {
    model
    const dialogRef = this._dialog.open(MrbauConfirmTaskDialogComponent, {
      data: {
        dialogTitle: 'Aufgabe Abbrechen',
        dialogMsg: 'Eine beendete Aufgabe kann nicht mehr geöffnet werden.',
        dialogButtonOK: 'AUFGABE BEENDEN',
        callQueryData: false,
        fieldsMain: [
          {
            fieldGroupClassName: 'flex-container-min-width',
            fieldGroup: [
              {
                className: 'flex-2',
                key: 'comment',
                type: 'textarea',
                templateOptions: {
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
        this.saveStatusCommentUser(EMRBauTaskStatus.STATUS_CANCELED, result.comment, this._task.createdUser.id);
      }
    });
  }
}
