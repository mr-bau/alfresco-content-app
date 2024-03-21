import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { IFileSelectData } from '../../tasks/tasks.component';

export interface IMrbauCompareDocumentsData {
  name: string,
  nodeId: string,
}

@Component({
  selector: 'aca-mrbau-compare-documents',
  template: `
  <div hidden="true">
    <h2 mat-dialog-title>Dokumente vergleichen</h2>
    <div class="previewDocumentName">{{left.name}} <-> {{right.name}}</div>
  </div>
  <mat-dialog-content style="max-height: 90vh">
    <div style="height: 90vh">
      <as-split
          #splitParent
          (dragStart)="dragStart($event)"
          (dragEnd)="dragEnd($event)"
          direction="horizontal"
          [disabled]="false"
          [gutterSize]="10"
          [restrictMove]="true"
          unit="percent"
        >
        <as-split-area
          #splitAreaLeft
          [minSize]="10"
          [order]="1"
          [size]="50"
          style="overflow-y: hidden;"
        >
        <div class="previewFlexContainer">
          <div class="previewFlexHeader">
            <details>
              <summary>{{left.name}}</summary>
              <ul class="node-detail-list">
                <li class="status">ID {{left.nodeId}}</li><li>
              </ul>
            </details>
          </div>
          <div class="previewFlexContent">
            <aca-pdfpreview [fileSelectData]="fileSelectDataLeft" [dragging]="dragging"></aca-pdfpreview>
          </div>
        </div>
        </as-split-area>
        <as-split-area
          #splitAreaRight
          [minSize]="10"
          [order]="2"
          [size]="50"
          style="overflow-y: hidden;"
        >
        <div class="previewFlexContainer">
          <div class="previewFlexHeader">
            <details>
            <summary>{{right.name}}</summary>
              <ul class="node-detail-list">
                <li class="status">ID {{right.nodeId}}</li><li>
              </ul>
            </details>
          </div>
          <div class="previewFlexContent">
            <aca-pdfpreview [fileSelectData]="fileSelectDataRight" [dragging]="dragging"></aca-pdfpreview>
          </div>
        </div>
        </as-split-area>
      </as-split>
    </div>

  </mat-dialog-content>
  <mat-dialog-actions hidden="true">
    <button mat-button mat-dialog-close>SCHLIESSEN</button>
  </mat-dialog-actions>
  `,
  styleUrls: ['../mrbau-dialog-global.scss', '../../form/mrbau-form-global.scss',],
  encapsulation: ViewEncapsulation.None
})
export class MrbauCompareDocumentsComponent implements OnInit {
  fileSelectDataLeft: IFileSelectData = null;
  fileSelectDataRight: IFileSelectData = null;

  dragging = false;

  left : IMrbauCompareDocumentsData;
  right : IMrbauCompareDocumentsData;

  constructor(
    private dialogRef: MatDialogRef<MrbauCompareDocumentsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {payload: any}
    ) {}

    ngOnInit(): void {
      this.left = this.data.payload.left;
      this.right = this.data.payload.right;
      this.fileSelectDataLeft = {nodeId : this.left.nodeId};
      this.fileSelectDataRight = {nodeId : this.right.nodeId};
      this.dialogRef.afterClosed().subscribe(result => {
        this.onDialogClose(result);
      });
    }

    onDialogClose(result : boolean)
    {
      if (result)
      {
        console.log(result);
      }
    }
    dragStart(event)
    {
      event;
      this.dragging = true;
    }

    dragEnd(event)
    {
      event;
      this.dragging = false;
    }
}
