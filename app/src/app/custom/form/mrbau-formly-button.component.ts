import { Component } from '@angular/core';
import { FieldType, FieldTypeConfig } from '@ngx-formly/core';

@Component({
  selector: 'aca-mrbau-formly-button',
  template: `
    <div>
      <button [type]="props.type" [ngClass]="'btn btn-' + props.btnType" (click)="onClick($event)">
        {{ props.text }}
      </button>
    </div>
  `,
})
export class MrbauFormlyButtonComponent extends FieldType<FieldTypeConfig> {
  onClick($event: Event) {
    if (this.props.onClick) {
      this.props.onClick($event);
    }
  }
}
