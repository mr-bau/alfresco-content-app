import { Component, Input, Output, OnInit, EventEmitter, ViewEncapsulation, ChangeDetectorRef, ViewChild } from '@angular/core';

import { ConfirmDialogComponent, NotificationService, ToolbarModule } from '@alfresco/adf-core';
import { NodeBodyUpdate, Node } from '@alfresco/js-api';

import { FormlyFormOptions, FormlyFieldConfig, FormlyModule } from '@ngx-formly/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';

import { CONST } from '../../../declaration/mrbau-global-declarations';
import { EMRBauTaskCategory, EMRBauTaskStatus, IFileSelectData, ITaskChangedData, MRBauTask } from '../../../declaration/mrbau-task-declarations';
import { MrbauConfirmTaskDialogComponent } from '../../../dialogs/mrbau-confirm-task-dialog/mrbau-confirm-task-dialog.component';
import { MrbauFormLibraryService } from '../../../services/mrbau-form-library.service';
import { TaskBarButton } from '../tasksdetail.component';
import { MrbauCommonService } from '../../../services/mrbau-common.service';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDividerModule } from '@angular/material/divider';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TaskMenuDelegateComponent } from '../../task-menu/task-menu-delegate/task-menu-delegate.component';
import { TaskMenuDeleteComponent } from '../../task-menu/task-menu-delete/task-menu-delete.component';
import { TaskVersionlistComponent } from '../../task-util/task-versionlist/task-versionlist.component';
import { TaskCommentlistComponent } from '../../task-util/task-commentlist/task-commentlist.component';
import { TaskLinkedDocumentsComponent } from '../../task-util/task-linked-documents/task-linked-documents.component';
import { TaskSummaryComponent } from '../task-summary/task-summary.component';
import { FormlyMaterialModule } from '@ngx-formly/material';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { FormlyMatTextAreaModule } from '@ngx-formly/material/textarea';
import { TextFieldModule } from '@angular/cdk/text-field';
import { FormlyMatDatepickerModule } from '@ngx-formly/material/datepicker';

@Component({
  standalone:true,
  imports:[
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatExpansionModule,
    CommonModule,
    MatTooltipModule,
    MatMenuModule,
    MatDividerModule,
    ReactiveFormsModule,
    FormlyModule,
    ToolbarModule,
    TaskMenuDelegateComponent,
    TaskMenuDeleteComponent,
    TaskVersionlistComponent,
    TaskCommentlistComponent,
    TaskLinkedDocumentsComponent,
    TaskSummaryComponent,
    TextFieldModule,
    FormlyMatTextAreaModule,
    MatSelectModule,
    MatInputModule, MatFormFieldModule,
    FormlyMaterialModule,
    FormlyMatDatepickerModule
  ],
  selector: 'mrbau-task-detail-common',
  templateUrl: './task-detail-common.component.html',
  styleUrls: ['../../../form/mrbau-form-global.scss', './task-detail-common.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class TaskDetailCommonComponent implements OnInit {
  @ViewChild('commentlist') commentlist : TaskCommentlistComponent | undefined;

  @Output() fileSelectEvent = new EventEmitter<IFileSelectData | null>();
  @Output() taskChangeEvent = new EventEmitter<ITaskChangedData>();
  @Output() errorEvent = new EventEmitter<string | null>();

  @Input()
  set task(val: MRBauTask) {
    this._task = val;
    this.queryNewData();
  }
  get task(): MRBauTask | null {
    return this._task;
  }
  private _task : MRBauTask | null = null;

  set errorMessage(val : string | null) {
    this._errorMessage = val;
    this.errorEvent.emit(this._errorMessage);
  }
  private _errorMessage: string | null = null;

  form = new FormGroup({});
  model: any = {};
  options: FormlyFormOptions = { } ;
  fields : FormlyFieldConfig[] = [];

  commentPanelOpened:boolean=false;
  historyPanelOpened:boolean=false;

  taskBarButtons : TaskBarButton[] = [];

  constructor(private _dialog: MatDialog,
    private _notificationService: NotificationService,
    private _mrbauFormLibraryService : MrbauFormLibraryService,
    private _mrbauCommonService : MrbauCommonService,
    private changeDetectorRef : ChangeDetectorRef,
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
      if (this.task != null) {
        this.taskChangeEvent.emit({task : this.task, queryTasks : true});
      }
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

  buttonDisabled() : boolean {
    if (this.task) {
      return this.task.status == this.model['mrbt:status'] && !this.model.comment
    }
    return true;
  }

  saveStatusCommentUser(status : EMRBauTaskStatus, comment: string, newUserId?: string)
  {
    if (this._task == null) {
      return;
    }

    if (comment)
    {
      this.addComment(comment)
    }

    if (status != this._task.status || (newUserId && newUserId != this._task.assignedUserName))
    {
      this.saveNewStatus(status, newUserId);
    }
  }

  async addComment(comment: string)
  {
    if (this._task == null) {
      return;
    }
    try {
      await this._mrbauCommonService.addComment(this._task.id, comment);
      this._notificationService.showInfo('Änderungen erfolgreich gespeichert');
      this.resetModel();
      this.commentlist?.queryData();
    }
    catch(err:any) {
       this.errorMessage = (this.errorMessage) ? err : this.errorMessage+"\n"+err
    }
  }

  async saveNewStatus(status : EMRBauTaskStatus, newUserId?: string)
  {
    let nodeBodyUpdate : NodeBodyUpdate = {}
    nodeBodyUpdate.properties = {"mrbt:status": ""+status};
    if (newUserId)
    {
      nodeBodyUpdate.properties["mrbt:assignedUserName"] = newUserId;
    }
    try {
      if (this._task == null){
        throw new Error('task is null');
      }
      const nodeEntry = await this._mrbauCommonService.updateNode(this._task.id, nodeBodyUpdate);
      this._task.status = status;
      this._task.updateWithNodeData(nodeEntry.entry);
      this.resetModel();
      this.taskChangeEvent.emit({task : this._task, queryTasks : MRBauTask.isTaskInNotifyOrDoneState(status)});
      this._notificationService.showInfo('Änderungen erfolgreich gespeichert');
    }
    catch(err:any) {
      this.errorMessage = err;
    }
  }

  resetModel()
  {
    this.model = {};
    this.model['mrbt:status'] = this._task?.status;
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
    this.changeDetectorRef.detectChanges();
  }

  isTaskAdditionalToolbarButtonsVisible() : boolean{
    return this._mrbauCommonService.isSuperUser() || this.isTaskToolbarButtonsVisible();
  }

  isTaskToolbarButtonsVisible() : boolean{
    return (this.task != null) && !this.task.isTaskInDoneState();
  }

  isTaskModificationUiVisible() :boolean
  {
    return (this.task != null) && this.task.isTaskModificationUiVisible();
  }

  buttonAddFilesClicked()
  {
    this._mrbauCommonService.openLinkFilesDialog(this.addFiles.bind(this), this.setErrorMessage.bind(this));
  }
  setErrorMessage(error:string)
  {
    this.errorMessage = error;
  }
  async addFiles(selectedNodes: Node[])
  {
    if (this._task == null) {
      return;
    }

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
    try {
      const success = await this._mrbauCommonService.addAssociatedDocumentFromTask(this._task.id, nodeIds)
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
      this.changeDetectorRef.detectChanges();
    }
    catch(error:any) {
      this.errorMessage = error;
    };
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
    if (this._task != null)
    {
      this.onAssociationClickedById(this._task.associatedDocumentRef[i]);
    }
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

  async deleteAssociation(i:number)
  {
    if (this._task == null || !this._task.associatedDocumentRef[i])
    {
      return;
    }
    try {
      const success = await this._mrbauCommonService.deleteAssociatedDocumentFromTask(this._task.id, this._task.associatedDocumentRef[i]);
      success;
      this.resetModel();
      // remove items from list
      this._task.associatedDocumentName.splice(i, 1);
      this._task.associatedDocumentRef.splice(i, 1);
      this.taskChangeEvent.emit({task : this._task, queryTasks : false});
      this._notificationService.showInfo('Änderungen erfolgreich gespeichert');
      this.changeDetectorRef.detectChanges();
    }
    catch(error: any)
    {
      this.errorMessage = error;
    };
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
      if (result && this._task != null)
      {
        this.saveStatusCommentUser(EMRBauTaskStatus.STATUS_NOTIFY_DECLINED, result.comment, this._task.createdUser?.id);
      }
    });
  }

  onFinishApproveTaskClicked(event?:any, title? :string, message?: string, okText? : string)
  {
    if (this._task == null)
    {
      return;
    }

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
      if (result && this._task != null)
      {
        if (this._task.category == EMRBauTaskCategory.CommonTaskApprove)
        {
          // notify always to keep approval status in version history
          this.saveStatusCommentUser(EMRBauTaskStatus.STATUS_NOTIFY_APPROVED, result.comment, this._task.createdUser?.id);
        }
        else if (this._task.assignedUserName == this._task.createdUser?.id || this._task.category == EMRBauTaskCategory.CommonTaskInfo)
        {
          // finish immediately and keep assigned user - no need for notify state
          this.saveStatusCommentUser(EMRBauTaskStatus.STATUS_FINISHED, result.comment);
        }
        else
        {
          // notify creator
          this.saveStatusCommentUser(EMRBauTaskStatus.STATUS_NOTIFY_DONE, result.comment, this._task.createdUser?.id);
        }
      }
    });
  }
}
