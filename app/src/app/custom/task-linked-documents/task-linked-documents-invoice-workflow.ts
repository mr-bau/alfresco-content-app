import { Node, NodeAssociationEntry, NodeEntry } from '@alfresco/js-api';
import { Component, Input, EventEmitter, Output } from '@angular/core';
import { MrbauCommonService } from '../services/mrbau-common.service';
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
            <aca-linked-document-detail [node]="taskNode" [uploadNewVersionButtonVisible]="true" (click)="onTaskNodeClicked()"></aca-linked-document-detail>
          </li>
        </ul>
      </details>
    </div>
    <ng-container *ngFor="let category of linkedDocumentsCategories">
        <ng-container *ngIf="(associatedDocuments | mrbauNodeAssociationEntryFilterPipeImpure:category.filter) as filteredAssociatedDocuments">
          <details open [hidden]="filteredAssociatedDocuments.length == 0">
          <summary class="expansionTitleText">{{category.name}}</summary>
            <ul class="associationList">
                <li class="addMarginLeft" *ngFor="let d of filteredAssociatedDocuments; index as i">
                  <aca-linked-document-detail [node]="d.entry" [removeButtonVisible]="true" [uploadNewVersionButtonVisible]="true" (clickDocument)="onAssociationClicked(d.entry.id)" (clickRemoveButton)="onRemoveAssociationClicked(d.entry.id)"></aca-linked-document-detail>
                  <!--
                    <button mat-button class="addMarginRight" (click)="onRemoveAssociationClicked(d.entry.id)" matTooltip="Link Entfernen" [disabled]="buttonsDisabled"><mat-icon>delete</mat-icon></button>
                    <a href="javascript: void(0);" (click)="onAssociationClicked(d.entry.id)" matTooltip="Dokument Anzeigen">{{d.entry.name}}</a>
                  -->
                </li>
              </ul>
            </details>
        </ng-container>
      </ng-container>
    <button mat-raised-button type="button" class="addMarginTop" color="primary" (click)="buttonAddFilesClicked()" matTooltip="Dokumente hinzufügen" [disabled]="buttonsDisabled">Dokumente Hinzufügen</button>
    <aca-mrbau-upload-button
      *ngIf="buttonAuditSheetVisible"
      class="addMarginTop addMarginLeft"
      [disabled]="buttonAuditSheetDisabled()"
      [rootFolderId]="'-my-'"
      [acceptedFilesType]="'.pdf'"
      [versioning]="false"
      [staticTitle]="'Prüfblatt Hochladen'"
      [tooltip]="'Rechnungs-Prüfblatt hochladen'"
      (success)="uploadAuditSheetSuccess($event)"
      (permissionEvent)="onUploadPermissionFailed($event)">
    >
    </aca-mrbau-upload-button>
<!--
    <adf-upload-button
      *ngIf="buttonsAuditSheetVisible"
      style="display: inline-block;"
      class="addMarginTop addMarginLeft"
      [disabled]="buttonsDisabled"
      [rootFolderId]="'-my-'"
      [uploadFolders]="false"
      [multipleFiles]="false"
      [acceptedFilesType]="'.pdf'"
      [versioning]="false"
      [staticTitle]="'Prüfblatt Hochladen'"
      [tooltip]="'Rechnungs-Prüfblatt hochladen'"
      (success)="uploadAuditSheetSuccess($event)"
      (permissionEvent)="onUploadPermissionFailed($event)">
      >
    </adf-upload-button>
-->
  </mat-expansion-panel>
  `,
  styles: []
})
export class TaskLinkedDocumentsInvoiceWorkflowComponent  {
  @Input() associatedDocuments : NodeAssociationEntry[] = []
  @Input() buttonsDisabled : boolean = false;
  @Input() defaultExpanded : boolean = false;
  @Input() taskNode : Node = new Node();
  @Input() buttonAuditSheetVisible : boolean = false;

  @Output() onRemoveAssociation = new EventEmitter<string>();
  @Output() onAddAssociation = new EventEmitter();
  @Output() onUploadAuditSheet = new EventEmitter<NodeEntry>();
  @Output() onAssociation = new EventEmitter<IFileSelectData>();
  @Output() onTaskNode = new EventEmitter();

  readonly linkedDocumentsCategories : ILinkedDocumentsCategories[] = [
    {filter:'mrba:offer', name:'Angebote'},
    {filter:'mrba:order', name:'Aufträge'},
    {filter:'mrba:addonOrder', name:'Zusatzaufträge'},
    {filter:'mrba:frameworkContract', name:'Zahlungsvereinbarungen'},
    {filter:'mrba:deliveryNote', name:'Lieferscheine'},
    {filter:'mrba:invoice', name:'Rechnungen'},
    {filter:'mrba:partialInvoice', name:'Teilrechnungen'},
    {filter:'mrba:invoiceReviewSheet', name:'Rechnungs-Prüfblatt'},
    {filter:'mrba:archiveDocument', name:'Andere Belege'},
    {filter:'mrba:document', name:'Andere Dokumente'}
  ];

  constructor(
    private mrbauCommonService : MrbauCommonService
  ){}

  onUploadPermissionFailed(event: any) {
    this.mrbauCommonService.showError(`Fehlende Berechtigung: ${event.permission} permission to ${event.action} the ${event.type} `);

  }

  uploadAuditSheetSuccess(event: any) {
    if (typeof event.value == 'string')
    {
      this.mrbauCommonService.showError(`Fehler: ${event.value}`);
      return;
    }
    this.onUploadAuditSheet.emit(event.value);
  }

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

  buttonAuditSheetDisabled() : boolean
  {
    return this.buttonsDisabled || this.associatedDocuments?.filter(v => v.entry.nodeType == 'mrba:invoiceReviewSheet').length > 0;
  }
}
