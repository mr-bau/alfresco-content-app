import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';

import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { FormlyModule } from '@ngx-formly/core';
import { AngularSplitModule } from 'angular-split';
import { IFileSelectData } from '../../declaration/mrbau-task-declarations';
import { PdfpreviewComponent } from '../../pdf/pdfpreview/pdfpreview.component';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { FormlyMaterialModule } from '@ngx-formly/material';

export interface IMrbauCompareDocumentsData {
  name: string,
  nodeId: string,
}

@Component({
  standalone:true,
  imports:[
    CommonModule,
    AngularSplitModule,
    PdfpreviewComponent,

    MatDialogModule,
    MatButtonModule, MatIconModule,
    MatSelectModule,
    MatInputModule, MatFormFieldModule,
    ReactiveFormsModule,
    FormlyModule,
    FormlyMaterialModule,
  ],
  selector: 'mrbau-compare-documents',
  template: `
  <div hidden="true">
    <h2 mat-dialog-title>Dokumente vergleichen</h2>
    <div class="previewDocumentName">{{left?.name}} <-> {{right?.name}}</div>
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

          [size]="50"
          style="overflow-y: hidden;"
        >
        <div class="previewFlexContainer">
          <div class="previewFlexHeader">
            <details>
              <summary>{{left?.name}}</summary>
              <ul class="node-detail-list">
                <li class="status">ID {{left?.nodeId}}</li><li>
              </ul>
            </details>
          </div>
          <div class="previewFlexContent">
            <mrbau-pdfpreview [fileSelectData]="fileSelectDataLeft" [dragging]="dragging"></mrbau-pdfpreview>
          </div>
        </div>
        </as-split-area>
        <as-split-area
          #splitAreaRight
          [minSize]="10"

          [size]="50"
          style="overflow-y: hidden;"
        >
        <div class="previewFlexContainer">
          <div class="previewFlexHeader">
            <details>
            <summary>{{right?.name}}</summary>
              <ul class="node-detail-list">
                <li class="status">ID {{right?.nodeId}}</li><li>
              </ul>
            </details>
          </div>
          <div class="previewFlexContent">
            <mrbau-pdfpreview [fileSelectData]="fileSelectDataRight" [dragging]="dragging"></mrbau-pdfpreview>
          </div>
        </div>
        </as-split-area>
      </as-split>
    </div>

  </mat-dialog-content>
  <mat-dialog-actions align="end">
    <button mat-button mat-dialog-close>SCHLIESSEN</button>
  </mat-dialog-actions>
  `,
  styleUrls: ['../mrbau-dialog-global.scss', '../../form/mrbau-form-global.scss',],
  encapsulation: ViewEncapsulation.None
})
export class MrbauCompareDocumentsComponent implements OnInit {
  fileSelectDataLeft: IFileSelectData | null = null;
  fileSelectDataRight: IFileSelectData | null = null;

  dragging = false;

  left : IMrbauCompareDocumentsData | undefined;
  right : IMrbauCompareDocumentsData | undefined;

  constructor(
    private dialogRef: MatDialogRef<MrbauCompareDocumentsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {payload: any}
    ) {}

    ngOnInit(): void {
      this.left = this.data.payload?.left;
      this.right = this.data.payload?.right;
      if (this.left?.nodeId) {
        this.fileSelectDataLeft = {nodeId : this.left.nodeId};
      }
      if (this.right?.nodeId) {
        this.fileSelectDataRight = {nodeId : this.right.nodeId};
      }
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
    dragStart(event:any)
    {
      event;
      this.dragging = true;
    }

    dragEnd(event:any)
    {
      event;
      this.dragging = false;
    }
}
