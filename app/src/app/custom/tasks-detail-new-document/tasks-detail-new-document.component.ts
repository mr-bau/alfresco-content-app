import { ConfirmDialogComponent } from '@alfresco/adf-content-services';
import { NodesApiService, NotificationService } from '@alfresco/adf-core';
import { Node, NodeAssociationEntry, NodeBodyUpdate, NodeEntry } from '@alfresco/js-api';
import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { FormlyFieldConfig, FormlyFormOptions } from '@ngx-formly/core';
import { DocumentAssociations, DocumentInvoiceTypes, DocumentOrderTypes, EMRBauDocumentAssociations, EMRBauInvoiceTypes, EMRBauOrderTypes, MRBauWorkflowStateCallback, MRBauWorkflowStateCallbackData } from '../mrbau-doc-declarations';
import { EMRBauTaskStatus, MRBauTask } from '../mrbau-task-declarations';
import { MrbauArchiveModelService } from '../services/mrbau-archive-model.service';
import { MrbauCommonService } from '../services/mrbau-common.service';
import { MrbauFormLibraryService } from '../services/mrbau-form-library.service';
import { TaskProposeMatchingDocuments } from '../task-linked-documents/task-propose-matching-documents';
import { IFileSelectData, ITaskChangedData } from '../tasks/tasks.component';
import { TaskBarButton } from '../tasksdetail/tasksdetail.component';

@Component({
  selector: 'aca-tasks-detail-new-document',
  templateUrl: './tasks-detail-new-document.component.html',
  styleUrls: ['./tasks-detail-new-document.component.scss']
})
export class TasksDetailNewDocumentComponent implements OnInit {
  @ViewChild('taskProposeMatchingDocuments') taskProposeMatchingDocuments : TaskProposeMatchingDocuments;

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
  get taskNode() : Node {
    return this._taskNode;
  }
  private _taskNodeAssociations : NodeAssociationEntry[];
  get taskNodeAssociations() : NodeAssociationEntry[] {
    return this._taskNodeAssociations;
  }


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
  isLoading: boolean = false;
  form = new FormGroup({});
  model: any = {};
  options: FormlyFormOptions = { } ;
  fields : FormlyFieldConfig[] = [];
  taskTitle : string;
  taskDescription : string;

  submitButtonText : string;

  constructor(
    private dialog: MatDialog,
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
    this.model = {};
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
    this.mrbauCommonService.getNode(this._task.associatedDocumentRef[0]).toPromise()
    .then((nodeEntry) => {
        nodeEntry;
        this._taskNode = nodeEntry.entry;
        return this.nodesApiService.nodesApi.listTargetAssociations(nodeEntry.entry.id, {skipCount:0, maxItems: 999});
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
            this.form = new FormGroup({});
            this.isLoading = false;
          });
        }
        else {
          this.form = new FormGroup({}); // create new form to reflect data from model
          this.isLoading = false;
        }
      }
    )
    .catch((error) => {
      this.errorEvent.emit(error);
      this.isLoading = false;
    });

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
    this.performStateChangeAction(this.mrbauArchiveModelService.mrbauArchiveModel.getNextTaskStateFromNodeType.bind(this.mrbauArchiveModelService.mrbauArchiveModel), {taskDetailNewDocument: this});
  }

  onPrevClicked(event?:any)
  {
    event;
    this.performStateChangeAction(this.mrbauArchiveModelService.mrbauArchiveModel.getPrevTaskStateFromNodeType.bind(this.mrbauArchiveModelService.mrbauArchiveModel), {taskDetailNewDocument: this});
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
    .then( () => {
      this.emitTaskChangeEvent();
      this.form = new FormGroup({}); // create new form to reflect data from model
      this.isLoading = false;})
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

  emitTaskChangeEvent(taskChangedData?:ITaskChangedData)
  {
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
    return MRBauTask.isTaskInNotifyOrDoneState(this.task.status);
  }

  writeMetadata() : Promise<NodeEntry> {
    let nodeBody : NodeBodyUpdate =  {
      properties: {
      }
    };
    Object.keys(this.model).forEach( key =>
    {
      if (this.model[key] || this.model[key] === 0)
      {
        if (!key.startsWith('ignore:'))// ignore fields where the key starts with ignore: e.g. calculated values
        {
            // if the data for the key is a object (e.g. AutocompleteSelectFormOptionsComponent) with a value key, then use the value data else use the data
            nodeBody.properties[key] =  (this.model[key].value) ? (this.model[key].value) : this.model[key];
        }
      }
    })
    //console.log(nodeBody);
    return this.nodesApiService.nodesApi.updateNode(this._taskNode.id, nodeBody, {});
  }

  isFormValid()
  {
    return this.form && !this.form.invalid;
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

  onModelChangeEvent(model :any) {
    model;
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

  setErrorMessage(error:string)
  {
    this.errorMessage = error;
  }
  onButtonAddFilesClicked()
  {
    this.mrbauCommonService.openLinkFilesDialog(this.addAssociations.bind(this), this.setErrorMessage.bind(this));
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
    if (node.nodeType == 'mrba:order')
    {
      if (node.properties['mrba:orderType'] == DocumentOrderTypes.get(EMRBauOrderTypes.AUFTRAG).value)
      {
        return DocumentAssociations.get(EMRBauDocumentAssociations.ORDER_REFERENCE).associationName;
      }
      if (node.properties['mrba:orderType'] == DocumentOrderTypes.get(EMRBauOrderTypes.ZUSATZAUFTRAG).value)
      {
        return DocumentAssociations.get(EMRBauDocumentAssociations.ADDON_ORDER_REFERENCE).associationName;
      }
    }
    if (node.nodeType == 'mrba:inboundInvoice')
    {
      if (node.properties['mrba:orderType'] == DocumentInvoiceTypes.get(EMRBauInvoiceTypes.ANZAHLUNG).value)
      {
        return DocumentAssociations.get(EMRBauDocumentAssociations.INBOUND_PARTIAL_INVOICE_REFERENCE).associationName;
      }
      return DocumentAssociations.get(EMRBauDocumentAssociations.INBOUND_INVOICE_REFERENCE).associationName;
      // return DocumentAssociations.get(EMRBauDocumentAssociations.INBOUND_REVOKED_INVOICE_REFERENCE).associationName;
    }

    // standard cases
    const associations = Array.from(DocumentAssociations.values()).filter((item) => item.category != EMRBauDocumentAssociations.DOCUMENT_REFERENCE && item.targetClass == node.nodeType);
    if (associations.length == 1)
    {
      return associations[0].associationName;
    }

    return DocumentAssociations.get(EMRBauDocumentAssociations.DOCUMENT_REFERENCE).associationName;
  }

  async addAssociations(selectedNodes: Node[])
  {
    // remove folders
    const nodes = selectedNodes.filter((value:Node) => value.isFile)
    if (nodes.length == 0)
    {
      return;
    }

    let bodyParams = [];
    for (let i=0; i< nodes.length; i++)
    {
      const nodeAssocType = this.getAssocTypeByNodeType(nodes[i]);
      bodyParams.push({
        targetId : nodes[i].id,
        assocType : nodeAssocType}
      );
    };

    const pathParams = {
      'nodeId': this._taskNode.id
    };
    const queryParams = {include:'association'};
    const headerParams= {};
    const formParams = {};
    const contentTypes = ['application/json'];
    const accepts = ['application/json'];
    this.nodesApiService.nodesApi.apiClient.callApi("/nodes/{nodeId}/targets", "POST", pathParams, queryParams, headerParams, formParams, bodyParams, contentTypes, accepts).then(
      (success) => {
        success;
        for (let i=0; i< nodes.length; i++)
        {
          const node = nodes[i];
          const bodyParam = bodyParams[i];
          this._taskNodeAssociations.push({entry: {association: {assocType : bodyParam.assocType}, id:node.id, isFolder:node.isFolder, isFile:node.isFile, name: node.name,
            nodeType: node.nodeType, modifiedAt: node.modifiedAt, modifiedByUser: node.modifiedByUser, createdAt:node.createdAt, createdByUser:node.createdByUser}});
        }
        this._taskNodeAssociations = this._taskNodeAssociations.slice(); // create a shallow copy to trigger onChange event
        this.taskChangeEvent.emit({task : this._task, queryTasks : false});
        this.notificationService.showInfo('Änderungen erfolgreich gespeichert');
    })
    .catch((error) => {
      this.errorMessage = error;
    });
  }

  async addProposedMatchingDocuments() : Promise<any>
  {
    const nodes = this.taskProposeMatchingDocuments.resultNodes.filter((val)=> this.taskProposeMatchingDocuments.selectedOptions.includes(val.id))
    await this.addAssociations(nodes);
   // console.log(this.taskProposeMatchingDocuments.selectedOptions);
   // return new Promise((resolve) =>  resolve(null));
  }
}
