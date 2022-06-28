import { Component, Input, Output, OnInit, EventEmitter, ViewEncapsulation, ViewChild } from '@angular/core';
import { EMRBauTaskStatus, MRBauTask } from '../mrbau-task-declarations';
import { MrbauTaskFormLibrary } from '../form/mrbau-task-form-library';
import { FormlyFormOptions, FormlyFieldConfig } from '@ngx-formly/core';
import { FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '@alfresco/adf-content-services';
import { ContentService, NotificationService } from '@alfresco/adf-core';
import { MinimalNodeEntryEntity, NodeBodyUpdate } from '@alfresco/js-api';
import { MrbauDelegateTaskDialogComponent } from '../dialogs/mrbau-delegate-task-dialog/mrbau-delegate-task-dialog.component';

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
  constructor(private _dialog: MatDialog, private _contentService: ContentService, private _notificationService: NotificationService) {
  }

  ngOnInit(): void {
  }

  modelChangeEvent()
  {
    //console.log(this.model);
  }

  buttonSaveClicked()
  {
    this.saveNewStatus(this.model.status);
  }

  saveNewStatus(status : EMRBauTaskStatus)
  {
    let nodeBodyUpdate : NodeBodyUpdate = {"properties": {"mrbt:status": ""+status}};
    this._contentService.nodesApi.updateNode(this._task.id, nodeBodyUpdate).then(
      (nodeEntry) => {
        this._task.status = status;
        this._task.updateWithNodeData(nodeEntry);
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
  }

  get task(): MRBauTask {
    return this._task;
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
        console.log("OK")
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
    console.log(newUser);
    let nodeBodyUpdate : NodeBodyUpdate = {"properties": {"mrbt:assignedUser": newUser}};
    this._contentService.nodesApi.updateNode(this._task.id, nodeBodyUpdate).then(
      (nodeEntry) => {
        this._task.assignedUser = newUser;
        this._task.updateWithNodeData(nodeEntry);
        this.resetModel();
        this.taskChangeEvent.emit(this._task);
        this._notificationService.showInfo('Änderungen erfolgreich gespeichert');
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
        console.log("OK")
        this.saveNewStatus(EMRBauTaskStatus.STATUS_CANCELED);
      }
    });
  }
}
