import { NodesApiService, NotificationService } from '@alfresco/adf-core';
import { Node, NodeBodyUpdate, NodeEntry } from '@alfresco/js-api';
import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FormlyFieldConfig, FormlyFormOptions } from '@ngx-formly/core';
import { EMRBauTaskStatus, MRBauTask, MRBauWorkflowStateCallback, MRBauWorkflowStateCallbackData } from '../mrbau-task-declarations';
import { MrbauArchiveModelService } from '../services/mrbau-archive-model.service';
import { MrbauCommonService } from '../services/mrbau-common.service';
import { MrbauFormLibraryService } from '../services/mrbau-form-library.service';
import { IFileSelectData, ITaskChangedData } from '../tasks/tasks.component';
import { TaskBarButton } from '../tasksdetail/tasksdetail.component';

@Component({
  selector: 'aca-tasks-detail-new-document',
  templateUrl: './tasks-detail-new-document.component.html',
  styleUrls: ['./tasks-detail-new-document.component.scss']
})
export class TasksDetailNewDocumentComponent implements OnInit {

  @Output() fileSelectEvent = new EventEmitter<IFileSelectData>();
  @Output() taskChangeEvent = new EventEmitter<ITaskChangedData>();
  @Output() errorEvent = new EventEmitter<string>();

  private _task : MRBauTask;
  @Input() set task(val : MRBauTask) {
    this._task = val;
    this.updateTask();
  }
  get task() : MRBauTask {
    return this._task;
  }

  private _taskNode : Node;

  readonly taskBarButtonsNormal : TaskBarButton[]=[
    { icon:"navigate_before", class:"mat-primary", tooltip:"Zurück", text:"Zurück", disabled: () => {return !this.isPrevButtonEnabled();}, onClick: (event?:any) => { this.onPrevClicked(event); } },
    { icon:"navigate_next", class:"mat-primary", tooltip:"Weiter zum nächsten Schritt", text:"Weiter", disabled: () => {return !this.isNextButtonEnabled();}, onClick: (event?:any) => { this.onNextClicked(event); } },
  ];
  taskBarButtons : TaskBarButton[] = this.taskBarButtonsNormal;

  set errorMessage(val : string) {
    this._errorMessage = val;
    this.errorEvent.emit(this._errorMessage);
  }
  private _errorMessage: string = null;
  isLoading: boolean = false;
  form = new FormGroup({});
  model: any = {};
  options: FormlyFormOptions = { } ;
  fields : FormlyFieldConfig[] = [];
  taskTitle : string;
  taskDescription : string;

  submitButtonText : string;

  constructor(
    private mrbauCommonService:MrbauCommonService,
    private mrbauFormLibraryService:MrbauFormLibraryService,
    private mrbauArchiveModelService : MrbauArchiveModelService,
    private changeDetectorRef: ChangeDetectorRef,
    private nodesApiService : NodesApiService,
    private notificationService: NotificationService,
  ) {}

  ngOnInit(): void {
  }

  testId : string;

  updateTask() {
    this.updateButtonText();
    this.form.reset();
    this.queryData();
  }

  queryData()
  {
    this.fields = [];
    this._taskNode = undefined;
    if (!(this._task && this._task.associatedDocumentRef.length > 0))
    {
      this.errorEvent.emit("Dokument-Assoziation fehlt!");
      return;
    }

    this.isLoading = true;
    this.changeDetectorRef.detectChanges();
    this.mrbauCommonService.getNode(this._task.associatedDocumentRef[0]).subscribe(
      (nodeEntry) => {
        nodeEntry;
        this._taskNode = nodeEntry.entry;
        this.isLoading = false;
        this.updateFormDC();
      },
      (error) => {
        this.errorEvent.emit(error);
        this.isLoading = false;
      }
    );
  }

  updateFormDC() {
    this.updateForm();
    // workaround for ExpressionChangedAfterItHasBeenCheckedError
    // https://stackoverflow.com/questions/43375532/expressionchangedafterithasbeencheckederror-explained
    // https://hackernoon.com/everything-you-need-to-know-about-the-expressionchangedafterithasbeencheckederror-error-e3fd9ce7dbb4
    this.changeDetectorRef.detectChanges();
  }

  onButtonSubmitClicked()
  {
    this.onNextClicked();
  }

  onNextClicked(event?:any)
  {
    event;
    this.performStateChangeAction(this.mrbauArchiveModelService.mrbauArchiveModel.getNextTaskStateFromNodeType.bind(this.mrbauArchiveModelService.mrbauArchiveModel), {task : this._task, node: this._taskNode});
  }

  onPrevClicked(event?:any)
  {
    event;
    this.performStateChangeAction(this.mrbauArchiveModelService.mrbauArchiveModel.getPrevTaskStateFromNodeType.bind(this.mrbauArchiveModelService.mrbauArchiveModel), {task : this._task, node: this._taskNode});
  }

  private doPerformStateChangePromise(newState, data) : Promise<any> {
    const performAction = (this._task.status != newState);
    if (performAction)
    {
      this.updateTaskStatusAndButtons(newState);
      this.updateFormDC();
      const workflowState = this.mrbauArchiveModelService.mrbauArchiveModel.getWorkFlowStateFromNodeType(data);
      if (workflowState.onEnterAction)
      {
        return workflowState.onEnterAction(data);
      }
    }
    return new Promise((resolve) => resolve(null));
  }

  performStateChangeAction(nextStateFunction : MRBauWorkflowStateCallback, data: MRBauWorkflowStateCallbackData)
  {
    this.isLoading = true;
    this.writeMetadata()
    .then( () => {return nextStateFunction(data);})
    .then( (newState) => {return this.doPerformStateChangePromise(newState, data)})
    .then( () => {return this.mrbauCommonService.updateTaskStatus(this._task.id, this._task.status)}) // update task meta data
    .then( () => this.isLoading = false)
    .catch((error) => {
      console.log(error);
      this.isLoading = false;
      this.notificationService.showError('Fehler: '+error);
    });
  }

  updateButtonText()
  {
    if (!this.task)
    {
      return;
    }
    if (this.task.status == EMRBauTaskStatus.STATUS_ALL_SET)
    {
      this.taskBarButtonsNormal[1].text = "Erledigen";
      this.taskBarButtonsNormal[1].icon = "done";
    }
    else
    {
      this.taskBarButtonsNormal[1].text = "Weiter";
      this.taskBarButtonsNormal[1].icon = "navigate_next";
    }
    this.submitButtonText = this.taskBarButtonsNormal[1].text
  }

  updateTaskStatusAndButtons(newState : EMRBauTaskStatus)
  {
    this.task.status = newState;
    this.updateButtonText();
    this.taskChangeEvent.emit({task : this.task, queryTasks : MRBauTask.isTaskInNotifyOrDoneState(newState)});
  }

  writeMetadata() : Promise<NodeEntry> {
    let nodeBody : NodeBodyUpdate =  {
      properties: {
      }
    };
    Object.keys(this.model).forEach( key =>
    {
      if (this.model[key])
      {
      nodeBody.properties[key] = this.model[key];
      }
    })
    //console.log(nodeBody);
    return this.nodesApiService.nodesApi.updateNode(this._taskNode.id, nodeBody, {});
  }

  isFormValid()
  {
    return this.form && !this.form.invalid;
  }

  isTaskModificationUiVisible() :boolean
  {
    return (this.task) ? this.task.isTaskModificationUiVisible() : false;
  }

  isPrevButtonEnabled() : boolean {
    return this.task && this.task.status > EMRBauTaskStatus.STATUS_METADATA_EXTRACT_1;
  }

  isNextButtonEnabled() : boolean {
    return this.isFormValid();
  }

  updateForm()
  {
    this.taskTitle = this.task.getStateLabel();
    this.taskDescription = this._taskNode.name;

    const nodeType = this._taskNode.nodeType;
    this.task.status = this.mrbauArchiveModelService.mrbauArchiveModel.initTaskStateFromNodeType(this.task.status, nodeType);
    const stateName = MRBauTask.getStateAsString(this.task.status);
    this.fields = this.mrbauFormLibraryService.getFormForNodeType(stateName, nodeType);
    // note https://stackblitz.com/edit/angular-ivy-yspupc?file=src%2Fapp%2Fapp.component.ts
    this.updateFormValues();
    this.form = new FormGroup({});
  }

  updateFormValues() {
    this.fields.forEach( (field) => this.updateFormValueRecursive(field));
  }

  updateFormValueRecursive(formlyFieldConfig: FormlyFieldConfig)
  {
    let key = formlyFieldConfig.key as string;
    if (key)
    {
      if (this._taskNode.properties[key])
      {
        let value = this._taskNode.properties[key]
        if (formlyFieldConfig.templateOptions.type == 'date')
        {
          value = this.mrbauCommonService.getFormDateValue(new Date(value));
        }
        this.model[key] = value;
      }
    }
    if (formlyFieldConfig.fieldGroup)
    {
      formlyFieldConfig.fieldGroup.forEach( (fc) => this.updateFormValueRecursive(fc))
    }
  }
}
