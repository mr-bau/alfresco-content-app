import { Component,  } from '@angular/core';
import { FieldWrapper } from '@ngx-formly/core';

@Component({
  selector: 'aca-mrbau-formly-label-wrapper',
  template: `
    <div class="adf-form-label-wrapper">
      <span class="adf-form-label-title">{{ to.label }}</span>
      <div class="card-body">
        <ng-container #fieldComponent></ng-container>
      </div>
    </div>
  `,
})
export class MrbauFormlyLabelWrapperComponent extends FieldWrapper {
}
