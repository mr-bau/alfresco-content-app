
import { ConfirmDialogComponent, NotificationService, ToolbarModule } from '@alfresco/adf-core';
import { Node, NodeAssociationEntry, NodeBodyUpdate, NodeEntry } from '@alfresco/js-api';
import { AfterViewChecked, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { FormlyFieldConfig, FormlyFormOptions, FormlyModule } from '@ngx-formly/core';
import { FormlyMatToggleModule } from '@ngx-formly/material/toggle'
import { DocumentAssociations,  EMRBauDocumentAssociations, MRBauWorkflowStateCallback, MRBauWorkflowStateCallbackData } from '../../../declaration/mrbau-doc-declarations';
//import { DocumentInvoiceTypes, DocumentOfferTypes, DocumentOrderTypes, EMRBauInvoiceTypes, EMRBauOfferTypes, EMRBauOrderTypes  } from '../mrbau-doc-declarations';
import { CONST } from '../../../declaration/mrbau-global-declarations';
import { EMRBauTaskCategory, EMRBauTaskStatus, IFileSelectData, IMRBauTaskStatusAndUser, ITaskChangedData, MRBauTask } from '../../../declaration/mrbau-task-declarations';
import { MrbauArchiveModelService } from '../../../services/mrbau-archive-model.service';
import { MrbauCommonService } from '../../../services/mrbau-common.service';
import { MrbauFormLibraryService } from '../../../services/mrbau-form-library.service';
import { MrbauWorkflowService } from '../../../services/mrbau-workflow.service';
import { TaskProposeMatchingDocuments } from '../../task-util/task-linked-documents/task-propose-matching-documents';

import { TaskBarButton } from '../tasksdetail.component';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { LoaderoverlayComponent } from '@mrbau/mrbau-common';
import { NodesApiService } from '@alfresco/adf-content-services';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TaskMenuOcrComponent } from '../../task-menu/task-menu-ocr/task-menu-ocr.component';
import { TaskMenuDiscardDocumentComponent } from '../../task-menu/task-menu-discard-document/task-menu-discard-document';
import { TaskMenuNewarchivetypeComponent } from '../../task-menu/task-menu-newarchivetype/task-menu-newarchivetype.component';
import { MatDividerModule } from '@angular/material/divider';
import { TaskMenuDelegateComponent } from '../../task-menu/task-menu-delegate/task-menu-delegate.component';
import { TaskMenuFinishnowComponent } from '../../task-menu/task-menu-finishnow/task-menu-finishnow.component';
import { TaskMenuDeleteComponent } from '../../task-menu/task-menu-delete/task-menu-delete.component';
import { TaskMenuReopenComponent } from '../../task-menu/task-menu-reopen/task-menu-reopen.component';
import { TaskCommentlistInvoiceWorkflowComponent } from '../../task-util/task-commentlist/task-commentlist-invoice-workflow';
import { TaskLinkedDocumentsInvoiceWorkflowComponent } from '../../task-util/task-linked-documents/task-linked-documents-invoice-workflow';
import { TaskTagManagerComponent } from '../../task-util/task-tag-manager/task-tag-manager.component';
import { TaskVersionlistInvoiceWorkflowComponent } from '../../task-util/task-versionlist/task-versionlist-invoice-workflow';
import { TasksMenuTestComponent } from '../../task-menu/tasks-menu-test/tasks-menu-test.component';
import { TextFieldModule } from '@angular/cdk/text-field';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormlyMaterialModule } from '@ngx-formly/material';
import { FormlyMatTextAreaModule } from '@ngx-formly/material/textarea';
import { MatListModule } from '@angular/material/list';
import { MatStepperModule } from '@angular/material/stepper';
import { TaskMenuPauseComponent } from '../../task-menu/task-menu-pause/task-menu-pause.component';
import { ContentApiService } from '@alfresco/aca-shared';
import { EDataServiceEvents, MrbauDataService } from '../../../services/mrbau-data.service';

@Component({
  standalone:true,
  imports:[
    CommonModule,
    LoaderoverlayComponent,

    ReactiveFormsModule,
    FormlyModule,
    FormlyMatToggleModule,
    FormlyMaterialModule,
    FormlyMatTextAreaModule,

    ToolbarModule,
    TaskMenuOcrComponent,
    TaskMenuNewarchivetypeComponent,
    TaskMenuDiscardDocumentComponent,
    TaskMenuDelegateComponent,
    TaskMenuPauseComponent,
    TaskMenuFinishnowComponent,
    TaskMenuDeleteComponent,
    TaskMenuReopenComponent,
    TasksMenuTestComponent,
    TaskCommentlistInvoiceWorkflowComponent,
    TaskProposeMatchingDocuments,
    TaskLinkedDocumentsInvoiceWorkflowComponent,
    TaskTagManagerComponent,
    TaskVersionlistInvoiceWorkflowComponent,

    TextFieldModule,
    MatSelectModule,
    MatStepperModule,
    MatListModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatTooltipModule,
    MatMenuModule,
    MatIconModule,
    MatDividerModule,
    MatExpansionModule,

  ],
  selector: 'mrbau-tasks-detail-new-document',
  templateUrl: './tasks-detail-new-document.component.html',
  styleUrls: ['./tasks-detail-new-document.component.scss']
})
export class TasksDetailNewDocumentComponent implements OnInit, AfterViewChecked  {
  @ViewChild('taskProposeMatchingDocuments') taskProposeMatchingDocuments! : TaskProposeMatchingDocuments;

  @Output() fileSelectEvent = new EventEmitter<IFileSelectData>();
  @Output() taskChangeEvent = new EventEmitter<ITaskChangedData>();
  @Output() errorEvent = new EventEmitter<string | null>();

  private _task : MRBauTask | null = null;
  @Input() set task(val : MRBauTask | null) {
    this._task = val;
    this.setErrorMessage(null);
    this.updateTask();
  }
  get task() : MRBauTask | null {
    return this._task;
  }

  private _taskNode : Node | null = null;
  get taskNode() : Node | null {
    return this._taskNode;
  }
  private _taskNodeAssociations : NodeAssociationEntry[] | undefined;
  get taskNodeAssociations() : NodeAssociationEntry[] {
    return this._taskNodeAssociations || [];
  }
  duplicateNode : Node | undefined;

  commentPanelOpened:boolean=false;
  tagPanelOpened:boolean=false;
  historyPanelOpened:boolean=false;

  readonly taskBarButtonsNormal : TaskBarButton[]=[
    //{ icon:"repeat", class:"mat-primary", tooltip:"Fristen Berechnen", text:"", disabled: () => {return false;} , onClick: (event?:any) => { this.onCalculateClicked(event); } },
    //{ icon:"save", class:"mat-primary", tooltip:"Speichern", text:"", disabled: () => {return false;} , onClick: (event?:any) => { this.onSaveClicked(event); } },
    { icon:"navigate_before", class:"mat-primary", tooltip:"Zurück", text:"Zurück", disabled: () => {return !this.isPrevButtonEnabled();}, onClick: (event?:any) => { this.onPrevClicked(event); } },
    { icon:"navigate_next", class:"mat-primary", tooltip:"Weiter zum nächsten Schritt", text:"Weiter", disabled: () => {return !this.isNextButtonEnabled();}, onClick: (event?:any) => { this.onNextClicked(event); } },
  ];
  taskBarButtons : TaskBarButton[] = this.taskBarButtonsNormal;

  set errorMessage(val : string | null) {
    this._errorMessage = val;
    this.errorEvent.emit(this._errorMessage);
  }
  private _errorMessage: string | null = null;
  set reloadTaskRequiredFlag(val:boolean)
  {
    this._reloadTaskRequiredFlag = val;
  }
  _reloadTaskRequiredFlag = false;
  isLoading: boolean = false;
  form = new FormGroup({});
  model: any = {};
  options: FormlyFormOptions = { } ;
  fields : FormlyFieldConfig[] = [];

  taskTitle : string = '';
  taskDescription : string = '';

  submitButtonText : string = '';

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private dialog: MatDialog,
    private mrbauWorkflowService:MrbauWorkflowService,
    private mrbauCommonService:MrbauCommonService,
    private mrbauFormLibraryService:MrbauFormLibraryService,
    private mrbauArchiveModelService : MrbauArchiveModelService,
    private mrbauDataService: MrbauDataService,
    private nodesApiService : NodesApiService,
    private notificationService: NotificationService,
    private contentApiService: ContentApiService,

  ) {
  }

  ngOnInit(): void {
  }

  ngAfterViewChecked(): void {
    // workaround for ExpressionChangedAfterItHasBeenCheckedError
    // https://stackoverflow.com/questions/43375532/expressionchangedafterithasbeencheckederror-explained
    // https://hackernoon.com/everything-you-need-to-know-about-the-expressionchangedafterithasbeencheckederror-error-e3fd9ce7dbb4
    // this.changeDetectorRef.detectChanges();
  }

  updateTask() {
    this.updateButtonText();
    this.model = {};
    this.form.reset();
    this.queryData();
  }

  autoOpenCommentsList(){
    if (this._taskNode == null) {
      return;
    }
    this.mrbauCommonService.getNodeComments(this._taskNode.id).toPromise()
    .then((comments) => {
      if (comments && comments instanceof Array && comments.length > 0) {
        this.commentPanelOpened = true;
      }
      else{
        this.commentPanelOpened = false;
      }
    });
  }

  async queryData()
  {
    this.fields = [];
    //console.log(this._task);
    this._taskNode = null;
    if (!(this._task && this._task.associatedDocumentRef.length > 0))
    {
      this.errorEvent.emit("Dokument-Assoziation fehlt!");
      return;
    }
    this.startLoading();
    try
    {
      const nodeEntry = await this.mrbauCommonService.getNode(this._task.associatedDocumentRef[0], {include: CONST.GET_NODE_DEFAULT_INCLUDE}).toPromise();
      if (nodeEntry == null) {
        throw new Error('nodeEntry is null');
      }
      this._taskNode = nodeEntry.entry;
      this.autoOpenCommentsList();
      const result = await this.nodesApiService.nodesApi.listTargetAssociations(nodeEntry.entry.id, {skipCount:0, maxItems: 999, include: CONST.GET_NODE_DEFAULT_INCLUDE});
      if (result.list == null) {
        throw new Error('result.list is null');
      }
      this._taskNodeAssociations = result.list.entries;
      // update Form
      this.updateFormDC();
      // execute onEnterAction
      const workflowState = this.mrbauArchiveModelService.mrbauArchiveModel.getWorkFlowStateFromNodeType({taskDetailNewDocument: this});
      if (workflowState?.onEnterAction)
      {
        workflowState.onEnterAction({taskDetailNewDocument:this}).finally( () =>
        {
          this.recreateForm();
          this.finishLoading();
        });
      }
      else {
        this.recreateForm();// create new form to reflect data from model
        this.finishLoading();
      }
    }
    catch(error:any)
    {
      this.errorEvent.emit(error);
      this.finishLoading();
    }
  }

  recreateForm()
  {
    this.form = new FormGroup({});
    this.changeDetectorRef.detectChanges();
  }
  startLoading()
  {
    this.isLoading = true;
  }

  finishLoading()
  {
    this.isLoading = false;
  }
  updateFormDC() {
    this.updateForm();
    this.resetFormTouchedAttribute();
    this.changeDetectorRef.detectChanges();
  }

  resetFormTouchedAttribute() {
    // reset touched attribute for each FormlyFieldConfig control to avoid validation message on dialog open
    this.fields.forEach((val) => {val.fieldGroup?.forEach((x)=> x.formControl?.markAsUntouched())});
  }

  onButtonSubmitClicked()
  {
    this.onNextClicked();
  }

  async getPreviousState() : Promise<EMRBauTaskStatus> {
    return new Promise<EMRBauTaskStatus>(async (resolve) => {
      this.isLoading = true;
      let newState = this.task!.status;
      try {
        const list = await this.contentApiService.getNodeVersions(this.task!.id, {maxItems: 999, skipCount: 0, include:['properties'] }).toPromise();
        let lastDifferentState = newState;
        if (list?.list?.entries) {
          for (let i=list.list.entries.length-1; i>=0; i--)
          {
            const a = list.list.entries[i];
            const versionState = a.entry?.properties['mrbt:status'];
            // use the last state that is different to the current task state as new unpause state
            if (versionState != newState) {
              lastDifferentState = versionState;
            }
          }
        }
        newState = lastDifferentState;
      }
      catch (error:any) {
        this.errorMessage = error;
      }
      finally {
        this.isLoading = false;
        resolve(newState);
      }
    });
  }

  isButtonPauseVisible() : boolean {
    if (this.task && this.task.status === EMRBauTaskStatus.STATUS_PAUSED) {
      //(this.task.status === EMRBauTaskStatus.STATUS_PAUSED ||  this.task.status === EMRBauTaskStatus.STATUS_SIGNING)) {
      return true;
    }
    return false;
  }

  pauseClickedEvent() {
    this.onButtonPauseClicked();
  }

  async onButtonPauseClicked() {
    if (!this.task)
      return;

    let newState = EMRBauTaskStatus.STATUS_PAUSED;
    if (this.task.status === EMRBauTaskStatus.STATUS_PAUSED)
    {
      newState = await this.getPreviousState();
    }

    if (newState === this.task.status) {
      // nothing to do or error in getPreviousState()
      return;
    }

    this.reloadTaskRequiredFlag = true;
    const callback : MRBauWorkflowStateCallback = () => new Promise<IMRBauTaskStatusAndUser>(resolve => resolve({state:newState}));
    this.performStateChangeAction(callback, {taskDetailNewDocument: this});
  }

  onNextClicked(event?:any)
  {
    event;
    this.performStateChangeAction(this.mrbauArchiveModelService.mrbauArchiveModel.getNextTaskStateFromNodeType.bind(this.mrbauArchiveModelService.mrbauArchiveModel), {taskDetailNewDocument: this});
  }

  onPrevClicked(event?:any)
  {
    event;
    this.performStateChangeAction(this.mrbauArchiveModelService.mrbauArchiveModel.getPrevTaskStateFromNodeType.bind(this.mrbauArchiveModelService.mrbauArchiveModel), {taskDetailNewDocument: this});
  }

  onSaveClicked(event?:any)
  {
    event;
    console.log('save');
  }
  onCalculateClicked(event?:any)
  {
    event;
    console.log('calculate');
  }

  private doPerformStateChangePromise(newState:IMRBauTaskStatusAndUser, data:MRBauWorkflowStateCallbackData) : Promise<IMRBauTaskStatusAndUser> {
    this.log('doPerformStateChangePromise');
    const performAction = (this._task?.status != newState.state);
    if (performAction)
    {
      this.updateTaskStatusAndButtons(newState.state);
      this.updateFormDC();
      const workflowState = this.mrbauArchiveModelService.mrbauArchiveModel.getWorkFlowStateFromNodeType(data);
      if (workflowState?.onEnterAction)
      {
        return new Promise(async (resolve, reject) => {
          try {
            if (workflowState?.onEnterAction) {
              await workflowState.onEnterAction(data)
            }
            resolve(newState);
          }
          catch(error)
          {
            reject(error)
          };
        });
      }
    }
    return new Promise((resolve) => resolve(newState));
  }

  performStateChangeAction(nextStateFunction : MRBauWorkflowStateCallback, data: MRBauWorkflowStateCallbackData)
  {
    this.startLoading();
    this.writeMetadata() // update document meta data
    .then( () => {return this.updateTaskNodeMetadataFromServer();}) // update local document meta data
    .then( () => {return nextStateFunction(data);})
    .then( (newStateObject) => {
      return this.doPerformStateChangePromise(newStateObject, data)})
    .then( (newStateObject) => {
      if (newStateObject.userName) {
        if (data.taskDetailNewDocument.task) {
          data.taskDetailNewDocument.task.assignedUserName = newStateObject.userName;
        }
      }
      if (this._task == null) {
        return new Promise<any>((resolve) => {resolve('')});
      }
      return this.mrbauCommonService.updateTaskStatus(this._task.id, this._task.status, newStateObject.userName)}) // update task meta data
    .then( () => {
      this.emitTaskChangeEvent();
      this.recreateForm(); // create new form to reflect data from model
      this.finishLoading();})
    .catch((error) => {
      console.log(error);
      this.finishLoading();
      this.notificationService.showError('Fehler: '+error);
    });
  }

  updateButtonText()
  {
    if (!this.task)
    {
      return;
    }
    const lastIndex = this.taskBarButtonsNormal.length - 1;
    if (this.task.status == EMRBauTaskStatus.STATUS_ALL_SET || this.task.status == EMRBauTaskStatus.STATUS_INTERNAL_INVOICE_VIEW)
    {
      this.taskBarButtonsNormal[lastIndex].text = "Erledigen";
      this.taskBarButtonsNormal[lastIndex].icon = "done";
    }
    else if (this.task.status == EMRBauTaskStatus.STATUS_FORMAL_REVIEW
          || this.task.status == EMRBauTaskStatus.STATUS_INVOICE_REVIEW
          || this.task.status == EMRBauTaskStatus.STATUS_FINAL_APPROVAL)
    {
      this.taskBarButtonsNormal[lastIndex].text = "Weiterleiten";
      this.taskBarButtonsNormal[lastIndex].icon = "send";
    }
    else
    {
      this.taskBarButtonsNormal[lastIndex].text = "Weiter";
      this.taskBarButtonsNormal[lastIndex].icon = "navigate_next";
    }
    this.submitButtonText = this.taskBarButtonsNormal[1].text
  }

  updateTaskStatusAndButtons(newState : EMRBauTaskStatus)
  {
    if (this.task == null) {
      return;
    }
    this.task.status = newState;
    this.updateButtonText();
    //this.taskChangeEvent.emit({task : this.task, queryTasks : MRBauTask.isTaskInNotifyOrDoneState(newState)});
  }

  reopenClickedEvent(taskChangedData?:ITaskChangedData)
  {
    if (taskChangedData == null) {
      return;
    }
    this.log('reopenClickedEvent');
    if (this._task == taskChangedData.task && this._task.isTaskInDoneState())
    {
      this.onPrevClicked(null);
      this.emitTaskChangeEvent(taskChangedData);
    }
  }

  emitTaskChangeEvent(taskChangedData?:ITaskChangedData)
  {
    this.log('emitTaskChangeEvent');
    if (taskChangedData)
    {
      this.taskChangeEvent.emit(taskChangedData);
    }
    else
    {
      if (this.task != null) {
        this.taskChangeEvent.emit({task : this.task, queryTasks : this.shouldQueryTasks()});
      }
    }
  }

  private shouldQueryTasks() : boolean {
    let result = this._reloadTaskRequiredFlag;
    if (this.task) {
      result = this._reloadTaskRequiredFlag || MRBauTask.isTaskInNotifyOrDoneState(this.task.status);
    }
    this._reloadTaskRequiredFlag = false;
    //console.log(result);
    return result;
  }

  private keyIsValid(key:string) : boolean
  {
    if (this.model[key] || this.model[key] === 0 || this.model[key] === "" || this.model[key] === false)
    {
      if (!key.startsWith('ignore:'))// ignore fields where the key starts with ignore: e.g. calculated values
      {
        return true;
      }
    }
    return false;
  }

  writeMetadata() : Promise<NodeEntry| null> {
    this.log('writeMetadata');
    if (this._taskNode == null) {
      return new Promise((resolve) => resolve(null));
    }
    let nodeBody : NodeBodyUpdate = {};
    nodeBody.properties = { };
    //this.log(this.model);
    const keys = Object.keys(this.model);
    for (let i=0; i< keys.length; i++)
    {
      const key = keys[i];
      if (this.keyIsValid(key))
      {
        // if the data for the key is a object (e.g. AutocompleteSelectFormOptionsComponent) with a value key, then use the value data else use the data
        const value = (this.model[key]?.value) ? (this.model[key].value) : this.model[key];
        // only update node if some values have changed
        let nodeValue = this._taskNode.properties[key];
        // hack to fix date comparison "2021-12-21" (form) vs "2021-12-21T11:00:00.000+0000" (node)
        if (key.endsWith('DateValue') && nodeValue != null)
        {
          nodeValue = this.mrbauCommonService.getFormDateValue(new Date(nodeValue));
        }
        if (value != nodeValue)
        {
          if (nodeBody.properties == null) {
            nodeBody.properties = {};
          }
          nodeBody.properties[key] = value;
        }
      }
    }
    if (Object.keys(nodeBody.properties).length == 0)
    {
      return new Promise((resolve) => resolve(null));
    }
    //this.log(nodeBody);
    return this.mrbauCommonService.updateNode(this._taskNode.id, nodeBody, {});
  }

  updateTaskNodeMetadata() : Promise<any>
  {
    if (this._taskNode == null)
    {
      return Promise.resolve(null);
    }
    const keys = Object.keys(this.model);
    for (let i=0; i<keys.length; i++)
    {
      const key = keys[i];
      if (this.keyIsValid(key))
      {
        this._taskNode.properties[key] = this.model[key];
      }
    };
    return Promise.resolve(null);
  }

  log(val:any)
  {
    val;
    //console.log(val);
  }

  updateTaskNodeMetadataFromServer() : Promise<any>
  {
    this.log('updateTaskNodeMetadataFromServer');
    return new Promise( async (resolve, reject) =>
    {
      try {
        if (this._task == null) {
          throw new Error('Task is null');
        }
        const nodeEntry = await this.mrbauCommonService.getNode(this._task.associatedDocumentRef[0], {include: CONST.GET_NODE_DEFAULT_INCLUDE}).toPromise();
        this._taskNode = nodeEntry?.entry || null;
        return resolve(null);
      }
      catch(error : any)
      {
        return reject(error);
      }
    });
  }

  isFormValid()
  {
    return this.form && this.form.valid;
  }

  isUploadAuditSheetButtonVisible() : boolean
  {
    return true;
    //return this._task?.status == EMRBauTaskStatus.STATUS_INVOICE_VERIFICATION
  }

  isProposeMatchingDocumentsVisible() : boolean
  {
    return (this.task != null) && this.task.status == EMRBauTaskStatus.STATUS_LINK_DOCUMENTS;
  }

  isTaskAdditionalToolbarButtonsVisible() : boolean{
    return this.mrbauCommonService.isSuperUser() || this.mrbauCommonService.isSettingsUser() || this.isTaskToolbarButtonsVisible();
  }

  isTaskToolbarButtonsVisible() : boolean{

    return (this.task != null) && !this.task.isTaskInDoneState();
  }

  isTaskModificationUiVisible() :boolean
  {
    return (this.task != null) && this.task.isTaskModificationUiVisible();
  }

  isPrevButtonEnabled() : boolean {
    if (this.task) {
      if (this.task.status == EMRBauTaskStatus.STATUS_INVOICE_VERIFICATION && !this.mrbauCommonService.isOrderPostUser()) {
        return false;
      }
      if (this.task.status == EMRBauTaskStatus.STATUS_MR_SIGNING && !this.mrbauCommonService.isMRSigningUser()) {
        return false;
      }
      if (this.task.status == EMRBauTaskStatus.STATUS_PAUSED) {
        return false;
      }
      return this.task.status > EMRBauTaskStatus.STATUS_METADATA_EXTRACT_1;
    }
    return false;
  }

  isNextButtonEnabled() : boolean {
    if (this.task) {
      if (this.task.status == EMRBauTaskStatus.STATUS_MR_SIGNING && !this.mrbauCommonService.isMRSigningUser()) {
        return false;
      }
      if (this.task.category == EMRBauTaskCategory.NewDocumentValidateORDER && this.task.status == EMRBauTaskStatus.STATUS_ALL_SET && !this.mrbauCommonService.isMRSigningUser()) {
        return false;
      }
      if (this.task.status == EMRBauTaskStatus.STATUS_PAUSED) {
        return false;
      }
      if (this.task.status == EMRBauTaskStatus.STATUS_ALL_SET && !this.mrbauCommonService.isOrderPostUser()) {
        return false;
      }
    }

    return this.isFormValid();
  }

  updateForm()
  {
    if (this.task == null || this._taskNode == null) {
      return;
    }

    this.taskTitle = this.task.getStateLabel();
    this.taskDescription = this._taskNode.name;

    const nodeType = this._taskNode.nodeType;
    this.task.status = this.mrbauArchiveModelService.mrbauArchiveModel.initTaskStateFromNodeType(this.task.status, nodeType);
    const stateName = MRBauTask.getStateAsString(this.task.status);

    this.fields = this.mrbauFormLibraryService.getFormForNodeType(stateName, nodeType);
    // note https://stackblitz.com/edit/angular-ivy-yspupc?file=src%2Fapp%2Fapp.component.ts
    //console.log('xxx');
    //console.log(this.fields);
    this.updateFormValues();
    //console.log(this.model);
    // new FormGroup is delayed to allow additional model changes in onEnterAction. Is done in performStateChangeAction
    //this.form = new FormGroup({});
  }

  updateFormValues() {
    this.fields.forEach( (field) => this.updateFormValueRecursive(field));
  }

  async dialogCallback(data :any ) {
    data;
    if (data.eventType === EDataServiceEvents.PDF_VIEWER_EVENT) {
      this.isLoading = true;
      try {
        await this.mrbauDataService.emitPDFViewerEvent(data);
      } finally {
        this.isLoading = false;
      }
    }
  }

  updateFormValueRecursive(formlyFieldConfig: FormlyFieldConfig)
  {
    // add task node and associations for special use cases
    this.model['ignore:taskNode'] = this.taskNode;
    this.model['ignore:taskNodeAssociations'] = this.taskNodeAssociations;
    this.model['ignore:dialogCallback'] = this.dialogCallback.bind(this);

    let keys: string[] = [];
    keys.push(formlyFieldConfig.key as string);
    if (formlyFieldConfig?.props && formlyFieldConfig.props['additionalKeys'] && Array.isArray(formlyFieldConfig.props.additionalKeys)) {
      const additionalKeys = formlyFieldConfig.props.additionalKeys as Array<string>;
      for (let i=0; i<additionalKeys.length; i++) {
        keys.push(additionalKeys[i] as string);
      }
    }
    for (let i = 0; i<keys.length;i++)
    {
      const key = keys[i];
      if (key)
      {
        if (this._taskNode?.properties[key] || this._taskNode?.properties[key] === 0  || this._taskNode?.properties[key] === false)
        {
          let value = this._taskNode.properties[key]
          if (formlyFieldConfig.props != null && formlyFieldConfig.props.type == 'date')
          {
            value = this.mrbauCommonService.getFormDateValue(new Date(value));
          }
          this.model[key] = value;
        }

        if (formlyFieldConfig.type == 'mrbauFormlyDuplicatedDocument')
        {
          this.model['ignore:taskNode'] = this.taskNode;
          this.model['ignore:duplicateNode'] = this.duplicateNode;
          this.model['ignore:callback'] = this.mrbauFormlyDuplicatedDocumentCallback.bind(this);
        }
      }
    }
    if (formlyFieldConfig.fieldGroup)
    {
      formlyFieldConfig.fieldGroup.forEach( (fc) => this.updateFormValueRecursive(fc))
    }
  }

  mrbauFormlyDuplicatedDocumentCallback(nodeId?:string)
  {
    if (!nodeId)
    {
      this.mrbauWorkflowService.performDuplicateCheck({taskDetailNewDocument: this})
      .then((result) => {
        result;
        this.model['ignore:duplicateNode'] = this.duplicateNode;
      })
      .catch((error) => this.setErrorMessage(error));
    }
    else
    {
      this.fileSelectEvent.emit({nodeId : nodeId});
    }
  }

  onModelChangeEvent(model :any) {
    model;
  }

  private uploadNodeType : string = '';
  onUploadNodeTypeInfo(value : string) {
    this.uploadNodeType = value;
  }

  async onUploadDocumentClicked(node: NodeEntry) : Promise<NodeEntry|null>
  {
    if (this._taskNode == null) {
      return null;
    }

    const nodeType = this.uploadNodeType;
    // auto assign properties
    let nodeBody : NodeBodyUpdate =  {
      nodeType: nodeType,
      properties: {
        //"mrba:mrBauId"
        "mrba:fiscalYear"        : this._taskNode.properties['mrba:fiscalYear'],
        "mrba:archivedDateValue" : this.mrbauCommonService.getFormDateValue(new Date()) || '',
        "mrba:organisationUnit"  : this._taskNode.properties['mrba:organisationUnit'],

        'mrba:companyId' : this._taskNode.properties['mrba:companyId'],
        'mrba:companyName' : this._taskNode.properties['mrba:companyName'],
        'mrba:companyVatID' : this._taskNode.properties['mrba:companyVatID'],
        'mrba:companyStreet' : this._taskNode.properties['mrba:companyStreet'],
        'mrba:companyZipCode' : this._taskNode.properties['mrba:companyZipCode'],
        'mrba:companyCity' : this._taskNode.properties['mrba:companyCity'],
        'mrba:companyCountryCode' : this._taskNode.properties['mrba:companyCountryCode'],
        'mrba:costCarrierNumber' : this._taskNode.properties['mrba:costCarrierNumber'],
        'mrba:projectName' : this._taskNode.properties['mrba:projectName'],
      }
    };

    try {
      // update properties
      await this.nodesApiService.nodesApi.updateNode(node.entry.id, nodeBody, {});
      // add invoice association
      await this.addAssociationsToNode(node.entry.id, [this._taskNode]);
      await this.addAssociations([node.entry]);

      // set document number - this may cause a name conflict if a file with the same name already exists.
      nodeBody.properties = {};
      if (nodeType == 'mrba:miscellaneousDocument') {
        const index = node.entry.name.lastIndexOf('.');
        const name = index > 0 ? node.entry.name.substring(0, index) : node.entry.name;
        nodeBody.properties['mrba:documentNumber'] = name;
      } else if (nodeType == 'mrba:invoiceReviewSheet') {
        nodeBody.properties['mrba:documentNumber'] = this._taskNode.properties['mrba:documentNumber'];
      }
      return this.nodesApiService.nodesApi.updateNode(node.entry.id, nodeBody, {});
    }
    catch(error:any) {
      this.setErrorMessage(error);
    }
    return null;
  }

  onTaskNodeClicked()
  {
    if (this._taskNode) {
      this.fileSelectEvent.emit({nodeId : this._taskNode.id});
    }
  }

  onAssociationClickedByNodeAssociationIndex(i:number)
  {
    if (this._taskNodeAssociations) {
      this.fileSelectEvent.emit({nodeId : this._taskNodeAssociations[i].entry.id});
    }
  }

  onAssociationClicked(data : IFileSelectData)
  {
    this.fileSelectEvent.emit(data);
  }

  setErrorMessage(error : string | null)
  {
    this.errorMessage = error;
  }

  addAssociationCheckDuplicate(val:Node[])
  {
    this.addAssociations(val)
    .then(() => {})
    .catch((error : Error) => {
      let errObj = null;
      try {
        errObj = JSON.parse(error.message);
      } catch (error)
      {error;}
      if (errObj?.error?.statusCode == 409)
      {
        // An association of this assoc type already exists between these two nodes
        this.mrbauCommonService.showError("Es existiert bereits eine Assoziation für dieses Dokument!");
      }
      else
      {
        this.setErrorMessage(error.message);
      }
    });
  }

  onButtonAddFilesClicked()
  {
    this.mrbauCommonService.openLinkFilesDialog(this.addAssociationCheckDuplicate.bind(this), this.setErrorMessage.bind(this));
  }

  onRemoveAssociationClicked(id:string)
  {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
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
        this.deleteAssociation(id);
      }
    });
  }

  async deleteAssociation(id:string)
  {
    if (this._taskNodeAssociations == null || this._task == null || this._taskNode == null) {
      return;
    }
    const index = this._taskNodeAssociations.findIndex((value) => value.entry.id == id)
    if (index < 0)
    {
      return;
    }
    try {
      const success = await this.nodesApiService.nodesApi.deleteAssociation(this._taskNode.id, id)
      success;
      this._taskNodeAssociations.splice(index, 1);
      this._taskNodeAssociations = this._taskNodeAssociations.slice(); // create a shallow copy to trigger onChange event
      this.taskChangeEvent.emit({task : this._task, queryTasks : false});
      this.notificationService.showInfo('Änderungen erfolgreich gespeichert');
    }
    catch(error:any)
    {
      this.errorMessage = error;
    }
  }

  getAssocTypeByNodeType(node:Node) : string | undefined
  {
    // special cases
    /*
    if (node.nodeType == 'mrba:offer')
    {
      if (node.properties['mrba:offerType'] == DocumentOfferTypes.get(EMRBauOfferTypes.NACHTRAGSANGEBOT).value)
      {
        return DocumentAssociations.get(EMRBauDocumentAssociations.ADDON_OFFER_REFERENCE).associationName;
      }
      return DocumentAssociations.get(EMRBauDocumentAssociations.OFFER_REFERENCE).associationName;
    }
    if (node.nodeType == 'mrba:order')
    {
      if (node.properties['mrba:orderType'] == DocumentOrderTypes.get(EMRBauOrderTypes.ZUSATZAUFTRAG).value)
      {
        return DocumentAssociations.get(EMRBauDocumentAssociations.ADDON_ORDER_REFERENCE).associationName;
      }
      return DocumentAssociations.get(EMRBauDocumentAssociations.ORDER_REFERENCE).associationName;
    }
    if (node.nodeType == 'mrba:invoice')
    {
      if (node.properties['mrba:invoiceType'] == DocumentInvoiceTypes.get(EMRBauInvoiceTypes.TEILRECHNUNG).value)
      {
        return DocumentAssociations.get(EMRBauDocumentAssociations.PARTIAL_INVOICE_REFERENCE).associationName;
      }
      return DocumentAssociations.get(EMRBauDocumentAssociations.INVOICE_REFERENCE).associationName;
    }
    if (this.mrbauArchiveModelService.mrbauArchiveModel.isContractDocument(node.nodeType))
    {
      if (node.nodeType == 'mrba:contractCancellation')
      {
        return DocumentAssociations.get(EMRBauDocumentAssociations.CANCELLED_CONTRACT_REFERENCE).associationName;
      }
      return DocumentAssociations.get(EMRBauDocumentAssociations.CONTRACT_REFERENCE).associationName;
    }*/
    // standard cases
    const associations = Array.from(DocumentAssociations.values()).filter((item) => item.category != EMRBauDocumentAssociations.DOCUMENT_REFERENCE && item.targetClass == node.nodeType);
    if (associations.length == 1)
    {
      return associations[0].associationName;
    }

    return DocumentAssociations.get(EMRBauDocumentAssociations.DOCUMENT_REFERENCE)?.associationName;
  }

  getBodyParamsForAddAssociations(nodes: Node[]) : any[]
  {
    let bodyParams = [];
    for (let i=0; i< nodes.length; i++)
    {
      const nodeAssocType = this.getAssocTypeByNodeType(nodes[i]);
      bodyParams.push({
        targetId : nodes[i].id,
        assocType : nodeAssocType}
      );
    };
    return bodyParams;
  }

  addAssociationsToNode(nodeId : string, nodes: Node[]) : Promise<any>
  {
    const bodyParams = this.getBodyParamsForAddAssociations(nodes);
    const pathParams = {nodeId: nodeId};
    const queryParams = {include:'association'};
    const contentTypes = ['application/json'];
    const accepts = ['application/json'];
    return this.nodesApiService.nodesApi.apiClient.callApi("/nodes/{nodeId}/targets", "POST", pathParams, queryParams, {}, {}, bodyParams, contentTypes, accepts);
  }

  async addAssociations(selectedNodes: Node[]) : Promise<any>
  {
    if (this._task == null || this._taskNode == null || this._taskNodeAssociations == null) {
      return Promise.reject('task is null');
    }

    // remove folders from list
    const nodes = selectedNodes.filter((value:Node) => value.isFile)
    if (nodes.length == 0)
    {
      return Promise.resolve(null);
    }
    const bodyParams = this.getBodyParamsForAddAssociations(nodes);
    const pathParams = {'nodeId': this._taskNode.id};
    const queryParams = {include:CONST.GET_NODE_DEFAULT_INCLUDE};
    const headerParams= {};
    const formParams = {};
    const contentTypes = ['application/json'];
    const accepts = ['application/json'];
    try {
      const success = await this.nodesApiService.nodesApi.apiClient.callApi("/nodes/{nodeId}/targets", "POST", pathParams, queryParams, headerParams, formParams, bodyParams, contentTypes, accepts);
      success;
      for (let i=0; i< nodes.length; i++)
      {
        const node = nodes[i];
        const bodyParam = bodyParams[i];
        this._taskNodeAssociations.push({entry: {association: {assocType : bodyParam.assocType}, properties: node.properties, id:node.id, isFolder:node.isFolder, isFile:node.isFile, name: node.name,
          nodeType: node.nodeType, modifiedAt: node.modifiedAt, modifiedByUser: node.modifiedByUser, createdAt:node.createdAt, createdByUser:node.createdByUser, allowableOperations: node.allowableOperations}});
      }
      this._taskNodeAssociations = this._taskNodeAssociations.slice(); // create a shallow copy to trigger onChange event
      this.taskChangeEvent.emit({task : this._task, queryTasks : false});
      this.notificationService.showInfo('Änderungen erfolgreich gespeichert');
      return Promise.resolve(null);
    }
    catch(error : any)
    {
      //this.errorMessage = error;
      return Promise.reject(error);
    }
  }

  async addProposedMatchingDocuments() : Promise<any>
  {
    if (this.taskProposeMatchingDocuments == undefined) {
      return Promise.reject('taskProposeMatchingDocuments is null');
    }

    const nodes = this.taskProposeMatchingDocuments.resultNodes.filter((val)=> this.taskProposeMatchingDocuments.selectedOptions.includes(val.id))
    return this.addAssociations(nodes);
  }
}
