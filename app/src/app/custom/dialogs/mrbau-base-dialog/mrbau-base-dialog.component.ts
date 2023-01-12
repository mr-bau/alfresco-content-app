import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FormlyFieldConfig, FormlyFormOptions } from '@ngx-formly/core';


@Component({
  selector: 'aca-mrbau-base-dialog',
  template: ''
})
export abstract class MrbauBaseDialogComponent implements OnInit {
    form = new FormGroup({});
    model: any = {};
    options: FormlyFormOptions = {  };
    fields : FormlyFieldConfig[];

    constructor() {
    }

    ngOnInit(): void {
    }

    formIsInValid() : boolean {
      return this.form.invalid;
    }

    modelChangeEvent()
    {
    }
  }
