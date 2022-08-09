
import { Component } from '@angular/core';
import { FieldType, FieldTypeConfig, FormlyFieldConfig,  } from '@ngx-formly/core';

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
    </style>
    <h2>Dublette gefunden</h2>
    <ul class="associationList">
      <li>Vorhandenes Dokument: <a href="javascript: void(0);" (click)="onDocumentClick()" matTooltip="Dokument Anzeigen">link 1</a></li>
      <li>Neues Dokument: <a href="javascript: void(0);" (click)="onDocumentClick()" matTooltip="Dokument Anzeigen">link 2</a></li>
    </ul>
    <div class="addMarginTop">
    <label id="duplicate-group-label"><b>Weitere Vorgehensweise:</b></label>
    <mat-radio-group
      aria-labelledby="duplicate-group-label"
      class="duplicate-radio-group"
      [(ngModel)]="selectedOption">
      <mat-radio-button class="duplicate-radio-button" *ngFor="let option of resolveOptions" [value]="option">
      {{option}}
      </mat-radio-button>
    </mat-radio-group>
    </div>
  `,

})
export class MrbauFormlyDuplicatedDocumentComponent extends FieldType<FieldTypeConfig> {
  selectedOption: string;
  resolveOptions: string[] = [
    'Dokument löschen und Workflow abbrechen',
    'Dokument als neue Version dem bestehenden hinzufügen',
    'Dokument behalten (Dublettenprüfung fehlerhaft)'];

  isValid(field: FormlyFieldConfig) {
    field;
    return true;
  }
  onDocumentClick() {

  }
}
