import { Component, Inject, OnInit } from '@angular/core';
import { FormlyFormOptions, FormlyFieldConfig } from '@ngx-formly/core';
import { FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDialogRef } from '@angular/material/dialog';
import { EcmUserModel} from '@alfresco/adf-core';

export interface MrbauBaseTaskDialogComponentProps {
  dialogTitle?: string;
  dialogMsg?: string;
  dialogButtonCancel?: string;
  dialogButtonOK?: string;
  fieldsMain?:FormlyFieldConfig[];
  callQueryData?:boolean;
  payload?:any;
}

@Component({
  selector: 'aca-mrbau-base-task-dialog',
  template: ``,
})
export abstract class MrbauBaseTaskDialogComponent implements OnInit {
  dialogTitle: string;
  dialogMsg: string;
  dialogButtonCancel: string;
  dialogButtonOK: string;

  form = new FormGroup({});
  model: any = {};
  options: FormlyFormOptions = {  };
  fields : FormlyFieldConfig[] = [ { } ];

  people: EcmUserModel[] = [];
  taskParentFolderId: string;

  constructor(public dialogRef: MatDialogRef<MrbauBaseTaskDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: MrbauBaseTaskDialogComponentProps)
  {
    data = data || {};
    this.dialogTitle = data.dialogTitle || 'Aufgabe Titel';
    this.dialogMsg = data.dialogMsg || 'Aufgabe Beschreibung.';
    this.dialogButtonCancel = data.dialogButtonCancel || 'ABBRECHEN';
    this.dialogButtonOK = data.dialogButtonOK || 'OK';
  }

  ngOnInit(): void {
    this.fields = this.data.fieldsMain;
    this.dialogRef.afterClosed().subscribe(result => {
      this.onDialogClose(result);
    });
  }

  modelChangeEvent()
  {
  }

  onDialogClose(result : boolean)
  {
    if (result) {}
  }
}
