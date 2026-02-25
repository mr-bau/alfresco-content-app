import { Node, NodeAssociationEntry, NodeEntry } from '@alfresco/js-api';
import { Component, Input, EventEmitter, Output } from '@angular/core';
import { MrbauCommonService } from '../../../services/mrbau-common.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { FormlyModule } from '@ngx-formly/core';
import { IFileSelectData } from '../../../declaration/mrbau-task-declarations';
import { MrbauUploadButtonComponent } from './mrbau-upload-button/mrbau-upload-button.component';
import { LinkedDocumentDetailComponent } from '../linked-document-detail/linked-document-detail.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { MRBauNodeAssociationEntryFilterPipeImpure } from '../../../declaration/mrbau-doc-declarations';
import { FormlyMatDatepickerModule } from '@ngx-formly/material/datepicker';
interface ILinkedDocumentsCategories {
  filter: string,
  name: string,
}
@Component({
  standalone:true,
  imports:[
    CommonModule,
    MatListModule,
    MatExpansionModule,
    MatButtonModule,
    MatIconModule,
    ReactiveFormsModule,
    FormsModule,
    FormlyModule,
    MrbauUploadButtonComponent,
    LinkedDocumentDetailComponent,
    MRBauNodeAssociationEntryFilterPipeImpure,
    FormlyMatDatepickerModule
  ],
  selector: 'mrbau-task-linked-documents-invoice-workflow',
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
            <mrbau-linked-document-detail [node]="taskNode" [uploadNewVersionButtonVisible]="true" (click)="onTaskNodeClicked()"/>
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
                  <mrbau-linked-document-detail [node]="d.entry" [removeButtonVisible]="true" [uploadNewVersionButtonVisible]="true" (clickDocument)="onAssociationClicked(d.entry.id)" (clickRemoveButton)="onRemoveAssociationClicked(d.entry.id)"/>
                  <!--
                    <button mat-button class="addMarginRight" (click)="onRemoveAssociationClicked(d.entry.id)" matTooltip="Link Entfernen" [disabled]="buttonsDisabled"><mat-icon>delete</mat-icon></button>
                    <a href="javascript: void(0);" (click)="onAssociationClicked(d.entry.id)" matTooltip="Dokument Anzeigen">{{d.entry.name}}</a>
                  -->
                </li>
              </ul>
            </details>
        </ng-container>
      </ng-container>
    <div style="display:flex">
      <button mat-raised-button type="button" class="addMarginTop" color="primary" (click)="buttonAddFilesClicked()" matTooltip="Dokumente hinzufügen" [disabled]="buttonsDisabled">Dokumente Hinzufügen</button>
      <mrbau-upload-button
        *ngIf="buttonAuditSheetVisible"
        class="addMarginTop addMarginLeft"
        [disabled]="buttonUploadDisabled()"
        [auditSheetDisabled]="buttonAuditSheetDisabled()"
        [rootFolderId]="'-my-'"
        acceptedFilesType=".pdf,.xls,.xlsx,.doc,.docx,.png,.jpg,.jpeg"
        [versioning]="false"
        (success)="uploadAuditSheetSuccess($event)"
        (permissionEvent)="onUploadPermissionFailed($event)"
        (uploadNodeTypeEvent)="onUploadNodeTypeEvent($event)"
        >
      >
      </mrbau-upload-button>
    </div>
  </mat-expansion-panel>
  `,
  styles: []
})
export class TaskLinkedDocumentsInvoiceWorkflowComponent  {
  @Input() associatedDocuments : NodeAssociationEntry[] = [];
  @Input() buttonsDisabled : boolean = false;
  @Input() defaultExpanded : boolean = false;
  @Input() taskNode : Node | null = null;
  @Input() buttonAuditSheetVisible : boolean = false;

  @Output() onRemoveAssociation = new EventEmitter<string>();
  @Output() onAddAssociation = new EventEmitter();
  @Output() onUploadDocument = new EventEmitter<NodeEntry>();
  @Output() onUploadNodeType = new EventEmitter<string>();
  @Output() onAssociation = new EventEmitter<IFileSelectData>();
  @Output() onTaskNode = new EventEmitter();

  readonly linkedDocumentsCategories : ILinkedDocumentsCategories[] = [
    {filter:'mrba:offer', name:'Angebote'},
    {filter:'mrba:addonOffer', name:'Nachtragsangebote'},
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

  onUploadNodeTypeEvent(event : string) {
    this.onUploadNodeType.emit(event);
  }

  uploadAuditSheetSuccess(event: any) {
    if (typeof event.value == 'string')
    {
      this.mrbauCommonService.showError(`Fehler: ${event.value}`);
      return;
    }
    this.onUploadDocument.emit(event.value);
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

  buttonUploadDisabled() : boolean
  {
    return this.buttonsDisabled ;
  }

  buttonAuditSheetDisabled() : boolean
  {
    return this.buttonsDisabled || this.associatedDocuments?.filter(v => v.entry.nodeType == 'mrba:invoiceReviewSheet').length > 0;
  }
}
