import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FieldType, FieldTypeConfig  } from '@ngx-formly/core';
import { IMrbauCompareDocumentsData, MrbauCompareDocumentsComponent } from '../dialogs/mrbau-compare-documents/mrbau-compare-documents.component';

export const enum EMRBauDuplicateResolveOptions {
  DELETE,
  NEW_VERSION,
  IGNORE,
}
interface MRBauDuplicateResolveOptions {
  value:EMRBauDuplicateResolveOptions,
  label: string,
}
@Component({
  selector: 'aca-mrbau-duplicated-document',
  template: `
    <style>
      .duplicate-radio-group {
        display: flex;
        flex-direction: column;
        margin: 15px 0;
        align-items: flex-start;
      }
      .duplicate-radio-button {
        margin: 5px;
      }
      .duplicate-detail-list {
        list-style-type: none;
      }
    </style>
    <h2>Dublette gefunden</h2>
    <ul class="associationList">
      <li>
        <details>
          <summary>
          Existierendes Dokument: <a href="javascript: void(0);" (click)="onDocumentClick(this.model['ignore:duplicateNode']?.id)" matTooltip="Dokument Anzeigen">{{this.model['ignore:duplicateNode']?.name}}</a>
          </summary>
            <ul class="duplicate-detail-list">
              <li class="status">Pfad {{this.model['ignore:duplicateNode']?.path?.name || 'unbekannt'}}</li>
              <li class="status">ID {{this.model['ignore:duplicateNode']?.id || 'unbekannt'}} -
                erzeugt am {{this.model['ignore:duplicateNode']?.createdAt | date:'medium' || 'unbekannt'}}
                von {{this.model['ignore:duplicateNode']?.createdByUser?.displayName || 'unbekannt'}}
                - {{this.model['ignore:duplicateNode']?.content?.sizeInBytes || '?'}} Bytes
              </li>
            </ul>
        </details>
      </li>
      <li>
        <details>
          <summary>
        Neues Dokument: <a href="javascript: void(0);" (click)="onDocumentClick(this.model['ignore:taskNode']?.id)" matTooltip="Dokument Anzeigen">{{this.model['ignore:taskNode']?.name}}</a>
        </summary>
          <ul class="duplicate-detail-list">
            <li class="status">Pfad {{this.model['ignore:taskNode']?.path?.name || 'unbekannt'}}</li>
            <li class="status">ID {{this.model['ignore:taskNode']?.id || 'unbekannt'}} -
              erzeugt am {{this.model['ignore:taskNode']?.createdAt | date:'medium' || 'unbekannt'}}
              von {{this.model['ignore:taskNode']?.createdByUser?.displayName || 'unbekannt'}}
              - {{this.model['ignore:taskNode']?.content?.sizeInBytes || 'unbekannt'}} Bytes
            </li>
          </ul>
        </details>
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
    console.log(this.model);
    this.model['ignore:callback'](id);
  }

  onCompareClick()
  {
    const left : IMrbauCompareDocumentsData = {nodeId: this.model['ignore:duplicateNode'].id, name: this.model['ignore:duplicateNode'].name};
    const right : IMrbauCompareDocumentsData = {nodeId: this.model['ignore:taskNode'].id, name: this.model['ignore:taskNode'].name};
    this.dialog.open(MrbauCompareDocumentsComponent, {
      data: {payload : {left:left,right:right}},
        width: '95vw',
        height : 'auto'
    });
  }
}
