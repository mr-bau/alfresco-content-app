import { CommonModule } from '@angular/common';
import { Component,  } from '@angular/core';
import { FieldWrapper } from '@ngx-formly/core';

@Component({
  standalone:true,
  imports: [CommonModule],
  selector: 'mrbau-formly-label-wrapper',
  template: `
    <div style="padding-bottom:10px" class="adf-form-label-wrapper">
      <span class="adf-form-label-title">{{ to.label }}</span>
      <div class="card-body">
        <ng-container #fieldComponent></ng-container>
      </div>
    </div>
  `,
})
export class MrbauFormlyLabelWrapperComponent extends FieldWrapper {
}
