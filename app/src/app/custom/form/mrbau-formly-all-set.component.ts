
import { Component } from '@angular/core';
import { FieldType, FieldTypeConfig,  } from '@ngx-formly/core';

@Component({
  selector: 'aca-mrbau-formly-all-set',
  template: `
  <adf-empty-content
    [icon]="this.to.icon"
    [title]="this.to.title"
    [subtitle]="this.to.subtitle">
  </adf-empty-content>
  `,
})
export class MrbauFormlyAllSetComponent extends FieldType<FieldTypeConfig> {}
