import { Node, NodeAssociationEntry } from '@alfresco/js-api';
import { Component, Input, EventEmitter, Output } from '@angular/core';
import { IFileSelectData } from '../tasks/tasks.component';
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
    <div *ngIf="taskNode">
      <details open>
        <summary class="expansionTitleText">Haupt-Dokument:</summary>
        <ul class="associationList">
          <li class="addMarginLeft">
            <aca-linked-document-detail [taskNode]="taskNode" (click)="onTaskNodeClicked()"></aca-linked-document-detail>
          </li>
        </ul>
      </details>
    </div>
    <ng-container *ngFor="let category of linkedDocumentsCategories">
        <ng-container *ngIf="(associatedDocuments | mrbauNodeAssociationEntryFilterPipeImpure:category.filter) as filteredAssociatedDocuments">
            <details open [hidden]="filteredAssociatedDocuments.length == 0">
              <summary class="expansionTitleText">{{category.name}}</summary>
              <ul class="associationList">
                <li *ngFor="let d of filteredAssociatedDocuments; index as i">
                  <button mat-button class="addMarginRight" (click)="onRemoveAssociationClicked(d.entry.id)" matTooltip="Link Entfernen" [disabled]="buttonsDisabled"><mat-icon>delete</mat-icon></button>
                  <a href="javascript: void(0);" (click)="onAssociationClicked(d.entry.id)" matTooltip="Dokument Anzeigen">{{d.entry.name}}</a>
                </li>
              </ul>
            </details>
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
  @Input() taskNode : Node = new Node();
  @Output() onRemoveAssociation = new EventEmitter<string>();
  @Output() onAddAssociation = new EventEmitter();
  @Output() onAssociation = new EventEmitter<IFileSelectData>();
  @Output() onTaskNode = new EventEmitter();

  readonly linkedDocumentsCategories : ILinkedDocumentsCategories[] = [
    {filter:'mrba:offer', name:'Angebote'},
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

  onRemoveAssociationClicked(id:string)
  {
    this.onRemoveAssociation.emit(id);
  }

  onAssociationClicked(id:string)
  {
    this.onAssociation.emit({nodeId:id});
  }

  onTaskNodeClicked()
  {
    this.onTaskNode.emit();
  }

  buttonAddFilesClicked()
  {
    this.onAddAssociation.emit();
  }
}
