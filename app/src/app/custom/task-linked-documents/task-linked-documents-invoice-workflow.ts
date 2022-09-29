import { NodeAssociationEntry } from '@alfresco/js-api';
import { Component, Input, EventEmitter, Output } from '@angular/core';

interface ILinkedDocumentsCategories {
  filter: string,
  name: string,
}
@Component({
  selector: 'aca-task-linked-documents-invoice-workflow',
  template: `
  <mat-expansion-panel style="margin-top:1rem;" [expanded]="defaultExpanded">
    <mat-expansion-panel-header>
      <mat-panel-title>
        <mat-icon>attachment</mat-icon>
        <span class="expansionTitleText">Verknüpfte Dokumente</span>
      </mat-panel-title>
    </mat-expansion-panel-header>
      <ng-container *ngFor="let category of linkedDocumentsCategories">
        <!--<ng-container *ngIf="(associatedDocuments | mrbauNodeAssociationEntryFilterPipe:category.filter) as filteredAssociatedDocuments">-->
        <ng-container *ngIf="associatedDocuments as filteredAssociatedDocuments">
          <ng-container *ngIf="filteredAssociatedDocuments.length > 0">
            <span class="expansionTitleText">{{category.name}}</span>
            <ul class="associationList">
              <li *ngFor="let d of associatedDocuments; index as i">
                <ng-container *ngIf="d.entry.association.assocType==category.filter">
                  <button mat-button class="addMarginRight" (click)="onRemoveAssociationClicked(i)" matTooltip="Link Entfernen" [disabled]="buttonsDisabled"><mat-icon>delete</mat-icon></button>
                  <a href="javascript: void(0);" (click)="onAssociationClicked(i)" matTooltip="Dokument Anzeigen">{{d.entry.name}}</a>
                </ng-container>
              </li>
            </ul>
          </ng-container>
        </ng-container>
      </ng-container>
    <button mat-raised-button type="button" class="addMarginTop" color="primary" (click)="buttonAddFilesClicked()" matTooltip="Dokumente Hinzufügen" [disabled]="buttonsDisabled">Dokumente hinzufügen</button>
  </mat-expansion-panel>
  `,
  styleUrls: []
})
export class TaskLinkedDocumentsInvoiceWorkflowComponent  {
  @Input() associatedDocuments : NodeAssociationEntry[] = []
  @Input() buttonsDisabled : boolean = false;
  @Input() defaultExpanded : boolean = false;
  @Output() onRemoveAssociation = new EventEmitter<number>();
  @Output() onAssociation = new EventEmitter<number>();
  @Output() onAddAssociation = new EventEmitter();

  // TODO optimize *ngFor loop. Current implementation is ugly.

  readonly linkedDocumentsCategories : ILinkedDocumentsCategories[] = [
    {filter:'mrba:order', name:'Aufträge'},
    {filter:'mrba:addonOrder', name:'Zusatzaufträge'},
    {filter:'mrba:frameworkContract', name:'Zahlungsvereinbarungen'},
    {filter:'mrba:deliveryNote', name:'Lieferscheine'},
    {filter:'mrba:inboundInvoice', name:'Eingangsrechnungen'},
    {filter:'mrba:inboundRevokedInvoice', name:'Abgelehnte Eingangsrechnungen'},
    {filter:'mrba:inboundPartialInvoice', name:'Anzahlungsrechnungen'},
    {filter:'mrba:archiveDocument', name:'Andere Belege'},
    {filter:'mrba:document', name:'Andere Dokumente'}
  ];

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
