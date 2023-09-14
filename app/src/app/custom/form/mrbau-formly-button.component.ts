import { Component } from '@angular/core';
import { FieldType, FieldTypeConfig } from '@ngx-formly/core';

@Component({
  selector: 'aca-mrbau-formly-button',
  template: `
    <div>
      <button class="mat-flat-button mat-button-base mat-stroked-button" [type]="props.type" [ngClass]="'btn btn-' + props.btnType" (click)="onClick()">
        {{ props.text }}
      </button>
    </div>
  `,
})
export class MrbauFormlyButtonComponent extends FieldType<FieldTypeConfig> {
  onClick() {
    if (this.props.onClick) {
      this.props.onClick(this.field);
    }
  }
}
