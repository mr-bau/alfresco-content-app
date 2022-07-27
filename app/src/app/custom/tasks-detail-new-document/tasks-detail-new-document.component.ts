import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FormlyFieldConfig, FormlyFormOptions } from '@ngx-formly/core';
import { EMRBauTaskStatus, MRBauTask } from '../mrbau-task-declarations';
import { MrbauCommonService } from '../services/mrbau-common.service';
import { MrbauFormLibraryService } from '../services/mrbau-form-library.service';
import { TaskBarButton } from '../tasksdetail/tasksdetail.component';

@Component({
  selector: 'aca-tasks-detail-new-document',
  templateUrl: './tasks-detail-new-document.component.html',
  styleUrls: ['./tasks-detail-new-document.component.scss']
})
export class TasksDetailNewDocumentComponent implements OnInit {

  @Output() fileSelectEvent = new EventEmitter<string>();
  @Output() taskChangeEvent = new EventEmitter<MRBauTask>();
  @Output() errorEvent = new EventEmitter<string>();

  private _task : MRBauTask;
  @Input() set task(val : MRBauTask) {
    this._task = val;
    this.updateTask();
  }
  get task() : MRBauTask {
    return this._task;
  }

  //private _taskNode : MinimalNodeEntity;

  readonly taskBarButtonsNormal : TaskBarButton[]=[
    { icon:"navigate_before", class:"mat-primary", tooltip:"Zurück", text:"Zurück", disabled: () => {return !this.isPrevButtonEnabled();}, onClick: (event?:any) => { this.onPrevClicked(event); } },
    { icon:"navigate_next", class:"mat-primary", tooltip:"Weiter zum nächsten Schritt", text:"Weiter", disabled: () => {return !this.isFormValid();}, onClick: (event?:any) => { this.onNextClicked(event); } },
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
  taskDescription : string =null;

  constructor(
    private mrbauCommonService:MrbauCommonService,
    private mrbauFormLibraryService:MrbauFormLibraryService,
    private changeDetectorRef: ChangeDetectorRef,

  ) {}

  ngOnInit(): void {
  }

  updateTask() {
    this.update();
    this.queryData();
  }

  queryData()
  {
    //this._taskNode = undefined;
    if (!(this._task && this._task.associatedDocumentRef.length > 0))
    {
      return;
    }

    this.isLoading = true;
    this.changeDetectorRef.detectChanges();
    this.mrbauCommonService.getNode(this._task.associatedDocumentRef[0]).subscribe(
      (nodeEntry) => {
        nodeEntry;
      //  this._taskNode = nodeEntry;
        this.isLoading = false;
      },
      (error) => {
        this.errorEvent.emit(error);
        this.isLoading = false;
      }
    );
  }

  update() {
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
    switch (this.task.status)
    {
      case (EMRBauTaskStatus.STATUS_NEW):
      case (EMRBauTaskStatus.STATUS_METADATA_EXTRACT_1):
        this.task.status = EMRBauTaskStatus.STATUS_METADATA_EXTRACT_2;
        break;
      case EMRBauTaskStatus.STATUS_METADATA_EXTRACT_2:
        break;
    }
    this.update();
  }

  onPrevClicked(event?:any)
  {
    event;
    this.task.status--;
    this.update();
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

  updateForm()
  {
    this.taskDescription = this.task.getStatusLabel();

    switch (this.task.status)
    {
      case (EMRBauTaskStatus.STATUS_NEW):
      case (EMRBauTaskStatus.STATUS_METADATA_EXTRACT_1):
        this.fields = this.FIELDS_METADATA_EXTRACT_1;
        break;
      case (EMRBauTaskStatus.STATUS_METADATA_EXTRACT_2):
        this.fields = this.FIELDS_METADATA_EXTRACT_2;
        break;
      default:
        this.fields = [];
    }
    // TODO reset model until the back forward issue has been solved
    this.form.reset();
    //console.log(this.model);
  }

  readonly FIELDS_METADATA_EXTRACT_1 : FormlyFieldConfig[] = [
    {
      fieldGroupClassName: 'flex-container',
      fieldGroup: [this.mrbauFormLibraryService.mrba_companyIdentifier],
    }
  ];

  readonly FIELDS_METADATA_EXTRACT_2 : FormlyFieldConfig[] = [
    {
      template: '<i>Dokument Eigenschaften</i>',
    },
    this.mrbauFormLibraryService.aspect_mrba_documentIdentityDetails,
    {
      template: '<i>Betrag und Steuersatz</i>',
    },
    this.mrbauFormLibraryService.aspect_mrba_amountDetails_mrba_taxRate,
    {
      template: '<i>Kostenträger</i>',
    },
    this.mrbauFormLibraryService.aspect_mrba_costCarrierDetails,
  ];

}
