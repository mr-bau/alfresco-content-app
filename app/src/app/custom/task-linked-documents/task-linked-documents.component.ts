import { Component, Input, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'aca-task-linked-documents',
  template: `
  <mat-expansion-panel style="margin-top:1rem;">
    <mat-expansion-panel-header>
      <mat-panel-title>
        <mat-icon>attachment</mat-icon>
        <span class="expansionTitleText">Verknüpfte Dokumente</span>
      </mat-panel-title>
    </mat-expansion-panel-header>
    <ul class="associationList">
      <li *ngFor="let d of associatedDocumentName; index as i; first as isFirst">
        <button mat-button class="addMarginRight" (click)="onRemoveAssociationClicked(i)" matTooltip="Link Entfernen" [disabled]="buttonsDisabled"><mat-icon>delete</mat-icon></button>
        <a href="javascript: void(0);" (click)="onAssociationClicked(i)" matTooltip="Dokument Anzeigen">{{d}}</a>
      </li>
    </ul>
    <button mat-raised-button type="button" class="addMarginTop" color="primary" (click)="buttonAddFilesClicked()" matTooltip="Dokumente Hinzufügen" [disabled]="buttonsDisabled">Dokumente hinzufügen</button>
  </mat-expansion-panel>
  `,
  styleUrls: []
})
export class TaskLinkedDocumentsComponent  {
  @Input() associatedDocumentRef: string[] = [];
  @Input() associatedDocumentName: string[] = [];
  @Input() buttonsDisabled : boolean = false;
  @Output() onRemoveAssociation = new EventEmitter<number>();
  @Output() onAssociation = new EventEmitter<number>();
  @Output() onAddAssociation = new EventEmitter();

  onRemoveAssociationClicked(i:number)
  {
    this.onRemoveAssociation.emit(i);
  }

  onAssociationClicked(i:number)
  {
    this.onAssociation.emit(i);
  }

  buttonAddFilesClicked()
  {
    this.onAddAssociation.emit();
  }
}
