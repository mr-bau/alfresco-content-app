import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormlyFormOptions, FormlyFieldConfig } from '@ngx-formly/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'aca-mrbau-form',
  templateUrl: './mrbau-form.component.html',
  styleUrls: ['../mrbau-form-global.scss', './mrbau-form.component.scss'],
  encapsulation: ViewEncapsulation.None
})

export class MrbauFormComponent implements OnInit {
  form = new FormGroup({});
  model: any = {};
  options: FormlyFormOptions = { } ;
  fields : FormlyFieldConfig[] = [];

  ngOnInit(): void {
  }

}
