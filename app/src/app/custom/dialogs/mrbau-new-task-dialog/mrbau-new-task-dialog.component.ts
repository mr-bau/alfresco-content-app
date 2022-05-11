import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FormlyFormOptions, FormlyFieldConfig } from '@ngx-formly/core';
import { FormGroup } from '@angular/forms';
import { MrbauDialogFormLibrary, MrbauDialogForms } from '../../form/mrbau-dialog-form-library';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';

@Component({
  selector: 'aca-mrbau-new-task-dialog',
  templateUrl: './mrbau-new-task-dialog.component.html',
  styleUrls: ['./mrbau-new-task-dialog.component.scss'],
  template: 'passed in {{ data.payload }}',
})
export class MrbauNewTaskDialogComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<MrbauNewTaskDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: {payload: any}) {
    this.fields =  MrbauDialogFormLibrary.getDialogFormlyFieldConfig(MrbauDialogForms.NewTaskDialog);
   }

  form = new FormGroup({});
  model: any = {};
  options: FormlyFormOptions = {};
  fields : FormlyFieldConfig[];

  ngOnInit(): void {
    this.dialogRef.afterClosed().subscribe(result => {
      this.onDialogClose(result);
    });
  }

  onDialogClose(resultOk : boolean)
  {
    if (resultOk)
    {
      console.log("payload "+this.data.payload);

    }
  }
}
