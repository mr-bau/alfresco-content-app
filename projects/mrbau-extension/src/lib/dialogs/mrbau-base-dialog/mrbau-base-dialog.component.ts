import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { FormlyFieldConfig, FormlyFormOptions } from '@ngx-formly/core';

@Component({
  standalone:true,
  imports:[
    MatDialogModule, MatButtonModule
  ],
  selector: 'mrbau-base-dialog',
  template: ''
})
export abstract class MrbauBaseDialogComponent implements OnInit {
    form = new FormGroup({});
    model: any = {};
    options: FormlyFormOptions = {  };
    fields : FormlyFieldConfig[] = [];

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
