import { Component, Input, Output, OnInit, EventEmitter, ViewEncapsulation } from '@angular/core';
import { EMRBauTaskStatus, MRBauTask } from '../mrbau-task-declarations';
import { MrbauTaskFormLibrary } from '../form/mrbau-task-form-library';
import { FormlyFormOptions, FormlyFieldConfig } from '@ngx-formly/core';
import { FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent, ContentNodeDialogService } from '@alfresco/adf-content-services';
import { ContentService, NodesApiService, NotificationService } from '@alfresco/adf-core';
import { MinimalNode, MinimalNodeEntryEntity, NodeBodyUpdate, NodeEntry } from '@alfresco/js-api';
import { MrbauDelegateTaskDialogComponent } from '../dialogs/mrbau-delegate-task-dialog/mrbau-delegate-task-dialog.component';
import { CONST } from '../mrbau-global-declarations';

@Component({
  selector: 'aca-tasksdetail',
  templateUrl: './tasksdetail.component.html',
  styleUrls: ['../form/mrbau-form-global.scss', './tasksdetail.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class TasksdetailComponent implements OnInit {
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
  //isLoading: boolean = false;

  form = new FormGroup({});
  model: any = {};
  options: FormlyFormOptions = { } ;
  fields : FormlyFieldConfig[] = [];

  historyPanelOpened:boolean=false;

  node : MinimalNodeEntryEntity = null;
  isTaskComplete : boolean = false;
  constructor(private _dialog: MatDialog,
    private nodesApiService: NodesApiService,
    private contentService: ContentService,
    private notificationService: NotificationService,
    //private commentContentService: CommentContentService,
    private contentDialogService: ContentNodeDialogService) {
  }

  ngOnInit(): void {
  }

  modelChangeEvent()
  {
    //console.log(this.model);
  }

  buttonSaveClicked()
  {
    if (this.model.status != this._task.status || this.model.comment)
    {
      this.saveNewStatus(this.model.status, this.model.comment);
      this.model.comment = "";
    }
/*
    if (this.model.comment)
    {
      let comment : string = this.model.comment;
      comment.trim();
      if (comment.length > 0)
      {
        this.addComment(comment);
      }
    }*/
  }

  buttonAddFilesClicked()
  {
    this.contentDialogService.openFileBrowseDialogBySite()
    .subscribe((selections: MinimalNode[]) => {
        // place your action here on operation success!
        selections.forEach(selection => {
          this.addFile(selection);
        }
        );
    });
  }

  addFile(node: MinimalNode)
  {
    const bodyParams = [{
      targetId : node.id,
      assocType : 'mrbt:associatedDocumentRef'
    }];

    const pathParams = {
      'nodeId': this._task.id
    };
    const queryParams = {};
    const headerParams= {};
    const formParams = {};
    const contentTypes = ['application/json'];
    const accepts = ['application/json'];
    this.nodesApiService.nodesApi.apiClient.callApi("/nodes/{nodeId}/targets", "POST", pathParams, queryParams, headerParams, formParams, bodyParams, contentTypes, accepts).then(
      (success) => {
        success;
        this.resetModel();
        this._task.associatedDocumentName.push(node.name);
        this._task.associatedDocumentRef.push(node.id);
        this.taskChangeEvent.emit(this._task);
        this.notificationService.showInfo('Änderungen erfolgreich gespeichert');
    })
    .catch((error) => {
      this.errorMessage = error;
    });
  }

/*
  getComments()
  {
    this.commentContentService.getNodeComments(this._task.id).subscribe(
      (comments: CommentModel[]) => {
        if (comments && comments instanceof Array) {
          console.log(comments.length+" comments received");
          comments = comments.sort((comment1: CommentModel, comment2: CommentModel) => {
              const date1 = new Date(comment1.created);
              const date2 = new Date(comment2.created);
              return date1 > date2 ? -1 : date1 < date2 ? 1 : 0;
          });
          comments.forEach((comment) => {
            console.log(comment);
          });
      }
      },
      (err) => {
        console.log("xxx comment error");
        console.log(err);
      }
    );
  }
  addComment(comment: string)
  {
    this.commentContentService.addNodeComment(this._task.id, comment).subscribe(
      (res: CommentModel) => {
        console.log("xxx comment added");
        console.log(res);
      },
      (err) => {
        console.log("xxx comment error");
        console.log(err);
      }
    );
  }*/

  saveNewStatus(status : EMRBauTaskStatus, commentString? : string)
  {
    let nodeBodyUpdate : NodeBodyUpdate = {"properties": {"mrbt:status": ""+status}};
    let opts;
    if (commentString)
    {
      commentString.trim();
      if (commentString.length > 0)
      {
        opts = {comment : commentString};
      }
    }

    this.contentService.nodesApi.updateNode(this._task.id, nodeBodyUpdate, opts).then(
      (nodeEntry) => {
        this._task.status = status;
        this._task.updateWithNodeData(nodeEntry.entry);
        this.resetModel();
        this.taskChangeEvent.emit(this._task);
        this.notificationService.showInfo('Änderungen erfolgreich gespeichert');
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
    this.nodesApiService.nodesApi.apiClient.callApi("/nodes/{nodeId}/targets/{targetId}", "DELETE", pathParams, queryParams, headerParams, formParams, bodyParams, contentTypes, accepts).then(
      (success) => {
        success;
        this.resetModel();
        // remove items from list
        this._task.associatedDocumentName.splice(i, 1);
        this._task.associatedDocumentRef.splice(i, 1);
        this.taskChangeEvent.emit(this._task);
        this.notificationService.showInfo('Änderungen erfolgreich gespeichert');
    })
    .catch((error) => {
      this.errorMessage = error;
    });
  }

  onAssociationClicked(i:number, doNotShowNotification?:boolean)
  {
    if (!this._task.associatedDocumentRef[i])
    {
      this.fileSelectEvent.emit(null);
      return;
    }

    let id : string = this._task.associatedDocumentRef[i];
    this.contentService.getNode(id).subscribe(
      (node: NodeEntry) => {
        if (CONST.isPdfDocument(node))
        {
          this.fileSelectEvent.emit(this.contentService.getContentUrl(id));
        }
        else
        {
          this.fileSelectEvent.emit(null);
          if (!doNotShowNotification)
          {
            this.notificationService.showInfo('Nur PDF-Dokumente werden angezeigt!');
          }
        }
      },
      error => {
        this.errorMessage = error;
      }
    );
  }

  onFinishTaskClicked(model) {
    model;
    const dialogRef = this._dialog.open(ConfirmDialogComponent, {
      data: {
          title: 'Aufgabe Abschließen',
          message: 'Eine abgeschlossene Aufgabe kann nicht mehr geöffnet werden.',
          yesLabel: 'Aufgabe Erledigen',
          noLabel: 'Abbrechen',
        },
        minWidth: '250px'
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === true)
      {
        this.saveNewStatus(EMRBauTaskStatus.STATUS_FINISHED);
      }
    });
  }

  delegateTask(model) {
    const newUser : string = model.assignedUser
    if (!newUser)
    {
      return;
    }
    let nodeBodyUpdate : NodeBodyUpdate = {"properties": {"mrbt:assignedUserName": newUser}};
    this.contentService.nodesApi.updateNode(this._task.id, nodeBodyUpdate).then(
      (nodeEntry) => {
        this._task.assignedUserName = newUser;
        this._task.updateWithNodeData(nodeEntry.entry);
        this.resetModel();
        this.notificationService.showInfo('Änderungen erfolgreich gespeichert');
        this.taskChangeEvent.emit(this._task);
      })
      .catch((err) => this.errorMessage = err);
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

  onCancelTaskClicked(model)
  {
    model
    const dialogRef = this._dialog.open(ConfirmDialogComponent, {
      data: {
          title: 'Aufgabe Abbrechen',
          message: 'Eine beendete Aufgabe kann nicht mehr geöffnet werden.',
          yesLabel: 'Aufgabe Beenden',
          noLabel: 'Abbrechen',
        },
        minWidth: '250px'
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === true)
      {
        this.saveNewStatus(EMRBauTaskStatus.STATUS_CANCELED);
      }
    });
  }
}
