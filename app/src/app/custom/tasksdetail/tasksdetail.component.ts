import { Component, Input, Output, OnInit, EventEmitter, ViewEncapsulation } from '@angular/core';
import { MRBauTask } from '../mrbau-task-declarations';
import { MrbauTaskFormLibrary } from '../form/mrbau-task-form-library';
import { FormlyFormOptions, FormlyFieldConfig } from '@ngx-formly/core';
import { FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '@alfresco/adf-content-services';

@Component({
  selector: 'aca-tasksdetail',
  templateUrl: './tasksdetail.component.html',
  styleUrls: ['./tasksdetail.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class TasksdetailComponent implements OnInit {
  @Output() fileSelectEvent = new EventEmitter<string>();
  @Input()
  set task(val: MRBauTask) {
    this._task = val;
    this.queryNewData();
  }

  private _task : MRBauTask = null;
  errorMessage: string = null;
  isLoading: boolean = false;

  form = new FormGroup({});
  model: any = {};
  options: FormlyFormOptions = { } ;
  fields : FormlyFieldConfig[] = [];

  isTaskComplete : boolean =false;

  constructor(private dialog: MatDialog) {
  }

  ngOnInit(): void {
  }

  queryNewData()
  {
    if (this._task == null)
    {
      this.fileSelectEvent.emit(null);
      return;
    }
    this.fields = MrbauTaskFormLibrary.getForm(this.task);
    // TODO check associations and emit fileselect event
    /*
    this.isLoading = true;
    this.errorMessage = null;

    this.contentService.getNode(this.taskId).subscribe(
      (node: NodeEntry) => {
        let newTask = new MRBauTask();
        newTask.updateWithNodeData(node);
        this.task = newTask;
        if (false && CONST.isPdfDocument(node) )
        {
          this.fileSelectEvent.emit(this.contentService.getContentUrl(this.taskId));
        }
        else
        {
          this.fileSelectEvent.emit(null);
        }
      },
      error => {
        console.log(error);
      }
    );*/
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

  onSubmitClicked(model) {
    console.log(model);
    this.openDialog();

    this.task.createdUser.displayName
    this.task.createdUser.id
    this.task.createdDate
  }

  onDelegateClicked(model)
  {
    console.log(model);
  }

  openDialog()
  {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
          title: 'Aufgabe deligieren',
          message: 'Sind sie sicher?',
          yesLabel: 'Deligieren',
          noLabel: 'Abbrechen',      },
      minWidth: '250px'
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === true)
      {
        console.log("OK")
      }
      else
      {
        console.log("false")
      }
    });
  }

}
