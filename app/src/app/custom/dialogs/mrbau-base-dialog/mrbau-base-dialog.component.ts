import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FormlyFieldConfig, FormlyFormOptions } from '@ngx-formly/core';


@Component({
  selector: 'aca-mrbau-base-dialog',
  template: ''
})
export abstract class MrbauBaseDialogComponent implements OnInit {

    errorMessage: string;
    loaderVisible: boolean;

    form = new FormGroup({});
    model: any = {};
    options: FormlyFormOptions = {  };
    fields : FormlyFieldConfig[] = [ { } ];

    constructor() {
     }

    ngOnInit(): void {
      console.log('MrbauInboxAssignDialogComponent');
    }

    formIsInValid() : boolean {
      return this.form.invalid || !!this.errorMessage;
    }

    modelChangeEvent()
    {
    }
  }
