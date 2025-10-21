import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FieldType, FieldTypeConfig, FormlyModule  } from '@ngx-formly/core';
import { IMrbauCompareDocumentsData, MrbauCompareDocumentsComponent } from '../dialogs/mrbau-compare-documents/mrbau-compare-documents.component';
import { LinkedDocumentDetailComponent } from "../tasks/task-util/linked-document-detail/linked-document-detail.component";
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { MatRadioModule } from '@angular/material/radio';
import { ReactiveFormsModule } from '@angular/forms';

export const enum EMRBauDuplicateResolveOptions {
  DELETE,
  NEW_VERSION,
  IGNORE,
}
export const enum EMRBauDuplicateResolveResult {
  DELETE_SUCCESS,
  DELETE_CANCEL,
  NEW_VERSION,
  IGNORE,
}
interface MRBauDuplicateResolveOptions {
  value:EMRBauDuplicateResolveOptions,
  label: string,
}
@Component({
  standalone:true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatRadioModule,
    ReactiveFormsModule,
    FormlyModule,
    LinkedDocumentDetailComponent
  ],
  selector: 'mrbau-duplicated-document',
  template: `
    <h2>Dublette gefunden</h2>
    <ul class="associationList">
      <li>
        <mrbau-linked-document-detail prefix="Existierendes Dokument: " [node]="this.model['ignore:duplicateNode']" (click)="onDocumentClick(this.model['ignore:duplicateNode']?.id)"></mrbau-linked-document-detail>
      </li>
      <li>
        <mrbau-linked-document-detail prefix="Neues Dokument: " [node]="this.model['ignore:taskNode']" (click)="onDocumentClick(this.model['ignore:taskNode']?.id)"></mrbau-linked-document-detail>
      </li>
    </ul>
    <button mat-raised-button type="button" class="mat-flat-button mat-button-base addMarginTop " color="accent" (click)="onCompareClick()" [disabled]="!(this.model['ignore:duplicateNode'] && this.model['ignore:taskNode'])" matTooltip="Dokumente Vergleichen">Vergleichen</button>
    <div class="addMarginTop">
    <label id="duplicate-group-label"><b>Weitere Vorgehensweise:</b></label>

    <mat-radio-group
      required
      class="duplicate-radio-group"
      [formControl]="formControl"
      [formlyAttributes]="field"
      >
      <mat-radio-button required class="duplicate-radio-button" *ngFor="let option of resolveOptions" [value]="option.value">
      {{option.label}}
      </mat-radio-button>
    </mat-radio-group>
  `,

})
export class MrbauFormlyDuplicatedDocumentComponent extends FieldType<FieldTypeConfig> implements OnInit {
  resolveOptions: MRBauDuplicateResolveOptions[] = [
    {value: EMRBauDuplicateResolveOptions.DELETE, label:'Dokument löschen und Workflow abbrechen'},
    {value: EMRBauDuplicateResolveOptions.NEW_VERSION, label:'Dokument als neue Version dem bestehenden hinzufügen'},
    {value: EMRBauDuplicateResolveOptions.IGNORE, label:'Dokument behalten (False Positive)'}];

  constructor(private dialog: MatDialog) {
    super();
  }
// color="primary" mat-secondary form-secondary-button-color
  ngOnInit(): void {
    if (!this.model['ignore:duplicateNode'])
    {
      // if duplicateNode is undefined, call performDuplicateCheck and update duplicateNode
      this.model['ignore:callback']();
    }
  }

  onDocumentClick(id : string) {
    //console.log(this.model);
    this.model['ignore:callback'](id);
  }

  onCompareClick()
  {
    const left : IMrbauCompareDocumentsData = {nodeId: this.model['ignore:duplicateNode'].id, name: 'Existierendes Dokument: '+this.model['ignore:duplicateNode'].name};
    const right : IMrbauCompareDocumentsData = {nodeId: this.model['ignore:taskNode'].id, name: 'Neues Dokument: '+this.model['ignore:taskNode'].name};
    this.dialog.open(MrbauCompareDocumentsComponent, {
      data: {payload : {left:left,right:right}},
        width: '95vw',
        height : 'auto'
    });
  }
}
