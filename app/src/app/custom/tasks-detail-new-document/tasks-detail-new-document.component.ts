import { ConfirmDialogComponent } from '@alfresco/adf-content-services';
import { NodesApiService, NotificationService } from '@alfresco/adf-core';
import { Node, NodeAssociationEntry, NodeBodyUpdate, NodeEntry } from '@alfresco/js-api';
import { AfterViewChecked, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { FormlyFieldConfig, FormlyFormOptions } from '@ngx-formly/core';
import { DocumentAssociations,  EMRBauDocumentAssociations, MRBauWorkflowStateCallback, MRBauWorkflowStateCallbackData } from '../mrbau-doc-declarations';
//import { DocumentInvoiceTypes, DocumentOfferTypes, DocumentOrderTypes, EMRBauInvoiceTypes, EMRBauOfferTypes, EMRBauOrderTypes  } from '../mrbau-doc-declarations';
import { CONST } from '../mrbau-global-declarations';
import { EMRBauTaskStatus, IMRBauTaskStatusAndUser, MRBauTask } from '../mrbau-task-declarations';
import { MrbauArchiveModelService } from '../services/mrbau-archive-model.service';
import { MrbauCommonService } from '../services/mrbau-common.service';
import { MrbauFormLibraryService } from '../services/mrbau-form-library.service';
import { MrbauWorkflowService } from '../services/mrbau-workflow.service';
import { TaskProposeMatchingDocuments } from '../task-linked-documents/task-propose-matching-documents';
import { IFileSelectData, ITaskChangedData } from '../tasks/tasks.component';
import { TaskBarButton } from '../tasksdetail/tasksdetail.component';

@Component({
  selector: 'aca-tasks-detail-new-document',
  templateUrl: './tasks-detail-new-document.component.html',
  styleUrls: ['./tasks-detail-new-document.component.scss']
})
export class TasksDetailNewDocumentComponent implements OnInit, AfterViewChecked  {
  @ViewChild('taskProposeMatchingDocuments') taskProposeMatchingDocuments : TaskProposeMatchingDocuments;

  @Output() fileSelectEvent = new EventEmitter<IFileSelectData>();
  @Output() taskChangeEvent = new EventEmitter<ITaskChangedData>();
  @Output() errorEvent = new EventEmitter<string>();

  private _task : MRBauTask;
  @Input() set task(val : MRBauTask) {
    this._task = val;
    this.setErrorMessage(null);
    this.updateTask();
  }
  get task() : MRBauTask {
    return this._task;
  }

  private _taskNode : Node;
  get taskNode() : Node {
    return this._taskNode;
  }
  private _taskNodeAssociations : NodeAssociationEntry[];
  get taskNodeAssociations() : NodeAssociationEntry[] {
    return this._taskNodeAssociations;
  }
  duplicateNode : Node;

  commentPanelOpened:boolean=false;
  historyPanelOpened:boolean=false;

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
  taskTitle : string;
  taskDescription : string;

  submitButtonText : string;

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private dialog: MatDialog,
    private mrbauWorkflowService:MrbauWorkflowService,
    private mrbauCommonService:MrbauCommonService,
    private mrbauFormLibraryService:MrbauFormLibraryService,
    private mrbauArchiveModelService : MrbauArchiveModelService,
    private nodesApiService : NodesApiService,
    private notificationService: NotificationService,
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

  queryData()
  {
    this.fields = [];
    //console.log(this._task);
    this._taskNode = undefined;
    if (!(this._task && this._task.associatedDocumentRef.length > 0))
    {
      this.errorEvent.emit("Dokument-Assoziation fehlt!");
      return;
    }
    this.startLoading();
    this.mrbauCommonService.getNode(this._task.associatedDocumentRef[0], {include: CONST.GET_NODE_DEFAULT_INCLUDE}).toPromise()
    .then((nodeEntry) => {
        nodeEntry;
        this._taskNode = nodeEntry.entry;
        return this.nodesApiService.nodesApi.listTargetAssociations(nodeEntry.entry.id, {skipCount:0, maxItems: 999, include: CONST.GET_NODE_DEFAULT_INCLUDE});
      }
    )
    .then(
      (result) => {
        this._taskNodeAssociations = result.list.entries;
        // update Form
        this.updateFormDC();
        // execute onEnterAction
        const workflowState = this.mrbauArchiveModelService.mrbauArchiveModel.getWorkFlowStateFromNodeType({taskDetailNewDocument: this});
        if (workflowState.onEnterAction)
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
    )
    .catch((error) => {
      this.errorEvent.emit(error);
      this.finishLoading();
    });
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
    this.changeDetectorRef.detectChanges();
  }

  onButtonSubmitClicked()
  {
    this.onNextClicked();
  }

  getPrevStat() : EMRBauTaskStatus {
    return EMRBauTaskStatus.STATUS_SIGNING;
  }

  isButtonPauseVisible() : boolean {
    if (this.task &&
      (this.task.status === EMRBauTaskStatus.STATUS_PAUSED ||  this.task.status === EMRBauTaskStatus.STATUS_SIGNING)) {
      return true;
    }
    return false;
  }

  onButtonPauseClicked() {
    this.reloadTaskRequiredFlag = true;
    const newState : EMRBauTaskStatus = (this.task.status === EMRBauTaskStatus.STATUS_PAUSED) ? this.getPrevStat() : EMRBauTaskStatus.STATUS_PAUSED;
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

  private doPerformStateChangePromise(newState:IMRBauTaskStatusAndUser, data:MRBauWorkflowStateCallbackData) : Promise<IMRBauTaskStatusAndUser> {
    this.log('doPerformStateChangePromise');
    const performAction = (this._task.status != newState.state);
    if (performAction)
    {
      this.updateTaskStatusAndButtons(newState.state);
      this.updateFormDC();
      const workflowState = this.mrbauArchiveModelService.mrbauArchiveModel.getWorkFlowStateFromNodeType(data);
      if (workflowState?.onEnterAction)
      {
        return new Promise((resolve, reject) => {
          workflowState.onEnterAction(data)
          .then( () => resolve(newState))
          .catch( (error) => reject(error))
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
      if (newStateObject.userName) {data.taskDetailNewDocument.task.assignedUserName = newStateObject.userName;}
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
    if (this.task.status == EMRBauTaskStatus.STATUS_ALL_SET)
    {
      this.taskBarButtonsNormal[1].text = "Erledigen";
      this.taskBarButtonsNormal[1].icon = "done";
    }
    else if (this.task.status == EMRBauTaskStatus.STATUS_FORMAL_REVIEW
          || this.task.status == EMRBauTaskStatus.STATUS_INVOICE_REVIEW
          || this.task.status == EMRBauTaskStatus.STATUS_FINAL_APPROVAL)
    {
      this.taskBarButtonsNormal[1].text = "Weiterleiten";
      this.taskBarButtonsNormal[1].icon = "send";
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
    //this.taskChangeEvent.emit({task : this.task, queryTasks : MRBauTask.isTaskInNotifyOrDoneState(newState)});
  }

  reopenClickedEvent(taskChangedData?:ITaskChangedData)
  {
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
      this.taskChangeEvent.emit({task : this.task, queryTasks : this.shouldQueryTasks()});
    }
  }

  private shouldQueryTasks() : boolean {
    const result : boolean = this._reloadTaskRequiredFlag || MRBauTask.isTaskInNotifyOrDoneState(this.task.status);
    this._reloadTaskRequiredFlag = false;
    //console.log(result);
    return result;
  }

  private keyIsValid(key:string) : boolean
  {
    if (this.model[key] || this.model[key] === 0 || this.model[key] === "")
    {
      if (!key.startsWith('ignore:'))// ignore fields where the key starts with ignore: e.g. calculated values
      {
        return true;
      }
    }
    return false;
  }

  writeMetadata() : Promise<NodeEntry> {
    this.log('writeMetadata');
    let nodeBody : NodeBodyUpdate =  {
      properties: {
      }
    };
    //this.log(this.model);
    Object.keys(this.model).forEach( key =>
    {
      if (this.keyIsValid(key))
      {
        // if the data for the key is a object (e.g. AutocompleteSelectFormOptionsComponent) with a value key, then use the value data else use the data
        const value = (this.model[key].value) ? (this.model[key].value) : this.model[key];

        // only update node if some values have changed
        let nodeValue = this._taskNode.properties[key];
        // hack to fix date comparison "2021-12-21" (form) vs "2021-12-21T11:00:00.000+0000" (node)
        if (key.endsWith('DateValue') && nodeValue != null)
        {
          nodeValue = this.mrbauCommonService.getFormDateValue(new Date(nodeValue));
        }
        if (value != nodeValue)
        {
          nodeBody.properties[key] = value;
        }
      }
    })
    if (Object.keys(nodeBody.properties).length == 0)
    {
      return new Promise((resolve) => resolve(null));
    }
    //this.log(nodeBody);
    return this.nodesApiService.nodesApi.updateNode(this._taskNode.id, nodeBody, {});
  }

  updateTaskNodeMetadata() : Promise<any>
  {
    Object.keys(this.model).forEach( key =>
    {
      if (this.keyIsValid(key))
      {
        this._taskNode.properties[key] = this.model[key];
      }
    });
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
    return new Promise( (resolve, reject) =>
    {
      this.mrbauCommonService.getNode(this._task.associatedDocumentRef[0], {include: CONST.GET_NODE_DEFAULT_INCLUDE}).toPromise()
      .then((nodeEntry) => {
        this._taskNode = nodeEntry.entry;
        return resolve(null);
      })
      .catch((error) => {return reject(error);})
    });
  }

  isFormValid()
  {
    return this.form && this.form.valid;
  }

  isUploadAuditSheetButtonVisible() : boolean
  {
    return this._task?.status == EMRBauTaskStatus.STATUS_INVOICE_VERIFICATION
  }

  isProposeMatchingDocumentsVisible() : boolean
  {
    return this.task && this.task.status == EMRBauTaskStatus.STATUS_LINK_DOCUMENTS;
  }

  isTaskAdditionalToolbarButtonsVisible() : boolean{
    return this.mrbauCommonService.isAdminUser() || this.isTaskToolbarButtonsVisible();
  }

  isTaskToolbarButtonsVisible() : boolean{
    return this.task && !this.task.isTaskInDoneState();
  }

  isTaskModificationUiVisible() :boolean
  {
    return this.task && this.task.isTaskModificationUiVisible();
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

    // new FormGroup is delayed to allow additional model changes in onEnterAction. Is done in performStateChangeAction
    //this.form = new FormGroup({});
  }

  updateFormValues() {
    this.fields.forEach( (field) => this.updateFormValueRecursive(field));
  }

  updateFormValueRecursive(formlyFieldConfig: FormlyFieldConfig)
  {
    let key = formlyFieldConfig.key as string;
    if (key)
    {
      if (this._taskNode.properties[key] || this._taskNode.properties[key] === 0  || this._taskNode.properties[key] === false)
      {

        let value = this._taskNode.properties[key]
        if (formlyFieldConfig.props.type == 'date')
        {
          value = this.mrbauCommonService.getFormDateValue(new Date(value));
        }
        this.model[key] = value;
      }

      if (formlyFieldConfig.type == 'mrbauFormlyDuplicatedDocument')
      {
       //
       this.model['ignore:taskNode'] = this.taskNode;
       this.model['ignore:duplicateNode'] = this.duplicateNode;
       this.model['ignore:callback'] = this.mrbauFormlyDuplicatedDocumentCallback.bind(this);
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

  onUploadAuditSheetClicked(node: NodeEntry)
  {
    const nodeType = "mrba:invoiceReviewSheet";
    // auto assign properties
    let nodeBody : NodeBodyUpdate =  {
      nodeType: nodeType,
      properties: {
        //"mrba:mrBauId"
        "mrba:fiscalYear"        : this._taskNode.properties['mrba:fiscalYear'],
        "mrba:archivedDateValue" : this.mrbauCommonService.getFormDateValue(new Date()),
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
        'mrba:documentNumber' : this._taskNode.properties['mrba:documentNumber'],
      }
    };
    // update properties
    this.nodesApiService.nodesApi.updateNode(node.entry.id, nodeBody, {})
    .then((res) => {
      res;
      // add invoice association
      return this.addAssociationsToNode(node.entry.id, [this._taskNode]);
    })
    // add Association
    .then((res) => {
      res;
      return this.addAssociations([node.entry]);
    })
    .catch((error) => {this.setErrorMessage(error);})
  }

  onTaskNodeClicked()
  {
    this.fileSelectEvent.emit({nodeId : this._taskNode.id});
  }

  onAssociationClickedByNodeAssociationIndex(i:number)
  {
    this.fileSelectEvent.emit({nodeId : this._taskNodeAssociations[i].entry.id});
  }

  onAssociationClicked(data : IFileSelectData)
  {
    this.fileSelectEvent.emit(data);
  }

  setErrorMessage(error : string)
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

  deleteAssociation(id:string)
  {
    const index = this._taskNodeAssociations.findIndex((value) => value.entry.id == id)
    if (index < 0)
    {
      return;
    }
    this.nodesApiService.nodesApi.deleteAssociation(this._taskNode.id, id)
    .then((success) => {
        success;
        this._taskNodeAssociations.splice(index, 1);
        this._taskNodeAssociations = this._taskNodeAssociations.slice(); // create a shallow copy to trigger onChange event
        this.taskChangeEvent.emit({task : this._task, queryTasks : false});
        this.notificationService.showInfo('Änderungen erfolgreich gespeichert');
    })
    .catch((error) => {
        this.errorMessage = error;
    });
  }

  getAssocTypeByNodeType(node:Node) : string
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

    return DocumentAssociations.get(EMRBauDocumentAssociations.DOCUMENT_REFERENCE).associationName;
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
    await this.nodesApiService.nodesApi.apiClient.callApi("/nodes/{nodeId}/targets", "POST", pathParams, queryParams, headerParams, formParams, bodyParams, contentTypes, accepts).then(
      (success) => {
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
    })
    .catch((error) => {
      //this.errorMessage = error;
      return Promise.reject(error);
    });
  }

  async addProposedMatchingDocuments() : Promise<any>
  {
    const nodes = this.taskProposeMatchingDocuments.resultNodes.filter((val)=> this.taskProposeMatchingDocuments.selectedOptions.includes(val.id))
    return this.addAssociations(nodes);
  }
}
