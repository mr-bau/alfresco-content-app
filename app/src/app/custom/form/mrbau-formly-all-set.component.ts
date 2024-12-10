
import { Component } from '@angular/core';
import { FieldType, FieldTypeConfig,  } from '@ngx-formly/core';

@Component({
  selector: 'aca-mrbau-formly-all-set',
  template: `
  <adf-empty-content class="addMarginBottom"
    [icon]="this.to.icon"
    [title]="this.to.title"
    [subtitle]="this.to.subtitle">
    <p *ngIf="this.to.additionalText" class="adf-empty-content__text">
      <span *ngFor="let line of this.to.additionalText">{{line}}<br></span>
    </p>
  </adf-empty-content>
  `,
})
export class MrbauFormlyAllSetComponent extends FieldType<FieldTypeConfig> {}
