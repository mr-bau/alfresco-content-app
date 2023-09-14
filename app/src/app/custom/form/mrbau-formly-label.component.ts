import { FieldTypeConfig } from '@ngx-formly/core';
import { FieldType } from '@ngx-formly/core';
import { Component } from '@angular/core';

@Component({
  selector: 'aca-mrbau-formly-label',
  template: `
  <p>{{getValue()}}</p>
  `,
 })
 export class MrbauFormlyLabelComponent extends FieldType<FieldTypeConfig> {
  getValue() : any {
    if (this.props.disabled) {
      return '-';
    }
    return (this.formControl.value == null || this.formControl.value === "") ? this.props.placeholder : this.formControl.value;
  }

 }
