import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { MRBauTask } from '../../mrbau-task-declarations';
import { MrbauTaskFormLibrary } from '../mrbau-task-form-library';
import { FormlyFormOptions, FormlyFieldConfig } from '@ngx-formly/core';
import { FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '@alfresco/adf-content-services';

@Component({
  selector: 'aca-mrbau-form',
  templateUrl: './mrbau-form.component.html',
  styleUrls: ['../mrbau-form-global.scss', './mrbau-form.component.scss'],
  encapsulation: ViewEncapsulation.None
})

export class MrbauFormComponent implements OnInit {
  @Input() task: MRBauTask = null;

  form = new FormGroup({});
  model: any = {};
  options: FormlyFormOptions = { } ;
  fields : FormlyFieldConfig[] = MrbauTaskFormLibrary.getForm(this.task);

  isTaskComplete : boolean =false;
  constructor(private dialog: MatDialog) {
  }

  ngOnInit(): void {
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
