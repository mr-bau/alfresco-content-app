import { Component, Input, EventEmitter, Output, DoCheck, ChangeDetectorRef } from '@angular/core';
import { Node } from '@alfresco/js-api';
import { MrbauCommonService } from '../../../services/mrbau-common.service';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatExpansionModule } from '@angular/material/expansion';
import { LinkedDocumentDetailComponent } from '../linked-document-detail/linked-document-detail.component';

@Component({
  standalone:true,
  imports:[
    CommonModule,
    MatListModule,
    MatButtonModule,
    MatIconModule,
    MatExpansionModule,
    LinkedDocumentDetailComponent,
  ],
  selector: 'mrbau-task-linked-documents',
  template: `
  <mat-expansion-panel style="margin-top:1rem;" [expanded]="defaultExpanded">
    <mat-expansion-panel-header>
      <mat-panel-title>
        <mat-icon>attachment</mat-icon>
        <span class="expansionTitleText">Verknüpfte Dokumente</span>
      </mat-panel-title>
    </mat-expansion-panel-header>
    <!--
    <ul class="associationList">
      <li class="addMarginLeft" *ngFor="let d of associatedDocumentName; index as i; first as isFirst">
        <button mat-button class="addMarginRight" (click)="onRemoveAssociationClicked(i)" matTooltip="Link Entfernen" [disabled]="buttonsDisabled"><mat-icon>delete</mat-icon></button>
        <a href="javascript: void(0);" (click)="onAssociationClicked(i)" matTooltip="Dokument Anzeigen">{{d}}</a>
      </li>
    </ul>-->

    <div *ngIf="errorMessage; then thenBlock else elseBlock"></div>
    <ng-template #thenBlock>
      {{errorMessage}}
    </ng-template>
    <ng-template #elseBlock>
      <ul class="associationList">
        <li class="addMarginLeft" *ngFor="let d of associatedDocumentNodes; index as i">
          <mrbau-linked-document-detail [node]="d" [removeButtonVisible]="true" (clickDocument)="onAssociationClicked(i)" (clickRemoveButton)="onRemoveAssociationClicked(i)"></mrbau-linked-document-detail>
        </li>
      </ul>
      <button mat-raised-button type="button" class="addMarginTop" color="primary" (click)="buttonAddFilesClicked()" matTooltip="Dokumente Hinzufügen" [disabled]="buttonsDisabled">Dokumente hinzufügen</button>
    </ng-template>
  </mat-expansion-panel>
  `,
  styleUrls: [ '../../task-detail/task-detail-common/task-detail-common.component.scss'],
})
export class TaskLinkedDocumentsComponent implements DoCheck {
  @Input() associatedDocumentRef: string[] = [];
  @Input() associatedDocumentName: string[] = [];
  @Input() buttonsDisabled : boolean = false;
  @Input() defaultExpanded : boolean = false;
  @Output() onRemoveAssociation = new EventEmitter<number>();
  @Output() onAssociation = new EventEmitter<number>();
  @Output() onAddAssociation = new EventEmitter();

  associatedDocumentNodes: Node[] = [];
  private _associatedDocumentRefLength = 0;
  private _associatedDocumentRefOld:string[] = [];
  errorMessage : string = '';

  checkType(x:any){
    return typeof x;
  }

  constructor(
    private mrbauCommonService : MrbauCommonService,
    private changeDetectorRef : ChangeDetectorRef,
  ) {
  }

  ngDoCheck() {
    if (this.associatedDocumentRef != this._associatedDocumentRefOld
        || this.associatedDocumentRef.length != this._associatedDocumentRefLength)
    {
      this._associatedDocumentRefOld = this.associatedDocumentRef;
      this._associatedDocumentRefLength = this.associatedDocumentRef.length;
      this.queryNewData();
    }
  }

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

  async queryNewData()
  {
    let nodes : Node[] = [];
    try {
      this.errorMessage='Loading...';
      for (let i=0; i<this.associatedDocumentRef.length; i++) {
        let result = await this.mrbauCommonService.getNode(this.associatedDocumentRef[i], {include : ['path']}).toPromise();
        if (result) {
          nodes.push(result.entry);
        }
      }
      this.associatedDocumentNodes = nodes;
      this.errorMessage = '';
      this.changeDetectorRef.detectChanges();
    }
    catch(err : any) {
      console.log(err);
      this.errorMessage = err;
    }
  }
}
