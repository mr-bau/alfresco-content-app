import { Component, Input, EventEmitter, Output } from '@angular/core';
import { Node } from '@alfresco/js-api';
import { MrbauCommonService } from '../services/mrbau-common.service';

@Component({
  selector: 'aca-task-linked-documents',
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


    <ul class="associationList">
      <li class="addMarginLeft" *ngFor="let d of associatedDocumentNodes; index as i">
        <div *ngIf="checkType(d) === 'string'; else dataOK">
          <button mat-button class="addMarginRight" (click)="onRemoveAssociationClicked(i)" matTooltip="Link Entfernen" [disabled]="buttonsDisabled"><mat-icon>delete</mat-icon></button>
          <a href="javascript: void(0);" (click)="onAssociationClicked(i)" matTooltip="Dokument Anzeigen">{{d}}</a>
        </div>
        <ng-template #dataOK>
          <aca-linked-document-detail [node]="d" [removeButtonVisible]="true" (clickDocument)="onAssociationClicked(i)" (clickRemoveButton)="onRemoveAssociationClicked(i)"></aca-linked-document-detail>
        </ng-template>
      </li>
    </ul>

    <button mat-raised-button type="button" class="addMarginTop" color="primary" (click)="buttonAddFilesClicked()" matTooltip="Dokumente Hinzufügen" [disabled]="buttonsDisabled">Dokumente hinzufügen</button>
  </mat-expansion-panel>
  `,
  styleUrls: []
})
export class TaskLinkedDocumentsComponent {
  @Input() associatedDocumentRef: string[] = [];
  @Input() associatedDocumentName: string[] = [];
  @Input() buttonsDisabled : boolean = false;
  @Input() defaultExpanded : boolean = false;
  @Output() onRemoveAssociation = new EventEmitter<number>();
  @Output() onAssociation = new EventEmitter<number>();
  @Output() onAddAssociation = new EventEmitter();

  associatedDocumentNodes: Node[] = [];
  private _associatedDocumentRefLength = 0;

  checkType(x:any){
    return typeof x;
  }

  constructor(
    private mrbauCommonService : MrbauCommonService,
  ) {
  }

  ngDoCheck() {
    if (this.associatedDocumentRef.length != this._associatedDocumentRefLength) {
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
    let nodes = [];
    for (let i=0; i<this.associatedDocumentRef.length; i++) {
      try {
        let result = await this.mrbauCommonService.getNode(this.associatedDocumentRef[i], {include : ['path']}).toPromise();
        nodes.push(result.entry);
      }
      catch(err) {
        console.log(err);
        let errText;
        if (err?.response?.text)
        {
          const errObj = JSON.parse(err?.response?.text);
          errText = errObj?.error?.briefSummary;
        }
        if (!errText) {
          errText = 'unknown';
        }
        const name = (this.associatedDocumentName.length > i) ? this.associatedDocumentName[i] + ' (ERROR: ' +errText+')' : '-unknown- (ERROR: ' + errText+')';
        nodes.push(name);
      }
    }
    this.associatedDocumentNodes = nodes;
  }

}
