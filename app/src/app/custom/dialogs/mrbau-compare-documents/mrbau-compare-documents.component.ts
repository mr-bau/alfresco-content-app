import { ContentService } from '@alfresco/adf-core';
import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

export interface IMrbauCompareDocumentsData {
  name: string,
  nodeId: string,
}

@Component({
  selector: 'aca-mrbau-compare-documents',
  template: `
  <div hidden="true">
    <h2 mat-dialog-title>Dokumente vergleichen</h2>
    <div class="previewDocumentName">{{name_left}} <-> {{name_right}}</div>
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
          <aca-pdfpreview [document_url]="document_url_right"></aca-pdfpreview>
        </as-split-area>
        <as-split-area
          #splitAreaRight
          [minSize]="10"
          [order]="2"
          [size]="50"
          style="overflow-y: hidden;"
        >
          <aca-pdfpreview [document_url]="document_url_left"></aca-pdfpreview>
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
  readonly SHOW_TOOLBAR : string = "#toolbar=1";

  document_url_right: SafeResourceUrl = null;
  document_url_left : SafeResourceUrl = null;

  private remember_document_url_right: SafeResourceUrl = null;
  private remember_document_url_left : SafeResourceUrl = null;

  name_left : string;
  name_right: string;

  constructor(
    private dialogRef: MatDialogRef<MrbauCompareDocumentsComponent>,
    private contentService: ContentService,
    private sanitizer: DomSanitizer,
    @Inject(MAT_DIALOG_DATA) public data: {payload: any}
    ) {}

    ngOnInit(): void {
      const left : IMrbauCompareDocumentsData = this.data.payload.left;
      const right : IMrbauCompareDocumentsData = this.data.payload.right;
      this.name_left = left.name;
      this.name_right = right.name;
      this.document_url_left = this.sanitizeUrl(this.contentService.getContentUrl(left.nodeId).concat(this.SHOW_TOOLBAR));
      this.document_url_right = this.sanitizeUrl(this.contentService.getContentUrl(right.nodeId).concat(this.SHOW_TOOLBAR));
      this.dialogRef.afterClosed().subscribe(result => {
        this.onDialogClose(result);
      });
    }

    sanitizeUrl(url:string) : SafeResourceUrl {
      return this.sanitizer.bypassSecurityTrustResourceUrl(url);
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
      // workaround: hide pdf viewer during split pane resize
      this.remember_document_url_right = this.document_url_right;
      this.remember_document_url_left = this.document_url_left;
      this.document_url_right = null;
      this.document_url_left = null;
    }

    dragEnd(event)
    {
      event;
      // workaround: restore pdf viewer after split pane resize
      this.document_url_right = this.remember_document_url_right;
      this.document_url_left = this.remember_document_url_left;
      this.remember_document_url_left = null;
      this.remember_document_url_right = null;
    }
}
