import { FieldTypeConfig } from '@ngx-formly/core';
import { FieldType } from '@ngx-formly/core';
import { Component } from '@angular/core';

@Component({
  selector: 'aca-mrbau-formly-label',
  template: `
  <p>{{(formControl.value == null) ? to.placeholder : formControl.value}}</p>
  `,
 })
 export class MrbauFormlyLabelComponent extends FieldType<FieldTypeConfig> {}
