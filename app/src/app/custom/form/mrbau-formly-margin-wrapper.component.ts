import { Component,  } from '@angular/core';
import { FieldWrapper } from '@ngx-formly/core';

@Component({
  selector: 'aca-mrbau-formly-margin-wrapper',
  template: `
    <div class="addMarginBottom">
        <ng-container #fieldComponent></ng-container>
    </div>
  `,
})
export class MrbauFormlyMarginWrapperComponent extends FieldWrapper {
}
