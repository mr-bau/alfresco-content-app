import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { FieldType, FieldTypeConfig } from '@ngx-formly/core';

@Component({
  standalone:true,
  imports: [
    CommonModule,
    MatDividerModule,
    MatIconModule,
    MatButtonModule],
  selector: 'mrbau-formly-button',
  template: `
  <!--
      <button mat-stroked-button [type]="props.type" [title]="props.label" [ngClass]="'btn btn-' + props.btnType" (click)="onClick()">
  -->
    <div>
      <button mat-stroked-button [type]="props.type" [title]="props.label" [ngClass]="'btn btn-' + props.btnType" (click)="onClick()">
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
