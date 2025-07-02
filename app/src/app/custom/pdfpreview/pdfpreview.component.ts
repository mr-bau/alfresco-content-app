import { Component, OnInit, Input, SimpleChanges, ViewChild } from '@angular/core';
import { IFileSelectData } from '../tasks/tasks.component';
import { ContentApiService } from '@alfresco/aca-shared';
import { NodeEntry, VersionEntry } from '@alfresco/js-api';
import { CONST } from '../mrbau-global-declarations';
import { NotificationService } from '@alfresco/adf-core';
import { CanComponentDeactivate } from '../pdftron/pending-changes.interface';
import { Observable } from 'rxjs';
import { PdftronComponent } from '../pdftron/pdftron.component';

const PDF_TRON = 'pdfTron';
const PDF_ACA ='aca'
const PDF_BROWSER='browser'
@Component({
  selector: 'aca-pdfpreview',
  templateUrl: './pdfpreview.component.html',
  styleUrls: ['./pdfpreview.component.scss']
})
export class PdfpreviewComponent implements OnInit, CanComponentDeactivate {
  readonly PDF_TRON = PDF_TRON;
  readonly PDF_ACA = PDF_ACA;
  readonly PDF_BROWSER = PDF_BROWSER;
  @ViewChild(PDF_TRON) pdftronComponent : PdftronComponent;
  @Input() fileSelectData: IFileSelectData;
  @Input() dragging: boolean = false;
  errorMessage :string;
  isPDFFile = true;
  useViewer : string = PDF_TRON;
  fileSelectDataOut: IFileSelectData | null;
  //useViewer : string = 'browser';

  constructor(
    private contentApiService : ContentApiService,
    private notificationService : NotificationService,
  ) {
    this.notificationService;
  }
  canDeactivate() : Observable<boolean> | Promise<boolean> | boolean {
    if (this.useViewer == PDF_TRON && this.pdftronComponent) {
      return this.pdftronComponent.canDeactivate();
    }
    return true;
  }

  ngOnInit(): void {
  }

  async ngOnChanges(changes: SimpleChanges) {
    if (changes.fileSelectData) {
      if (this.useViewer == PDF_TRON && this.pdftronComponent)
      {
        await this.pdftronComponent.canDeactivate();
      }
      await this.onFileSelectedCheckIfPdf();
      //this.fileSelectDataOut = Object.assign({}, this.fileSelectData);
      this.fileSelectDataOut = this.fileSelectData;
    }
  }

  async onViewerChanged(event) {
    if (!event) {
      return;
    }
    if (this.useViewer == PDF_TRON && this.pdftronComponent)
    {
      await this.pdftronComponent.canDeactivate();
    }

    this.useViewer = event;
  }

  private async onFileSelectedCheckIfPdf() {
    this.errorMessage = null;
    if (!this.fileSelectData) {
      return;
    }

    try {
      if (this.fileSelectData.versionId)
      {
        const versionEntry : VersionEntry = await this.contentApiService._versionsApi.getVersion(this.fileSelectData.nodeId, this.fileSelectData.versionId);
        this.isPDFFile = CONST.isPdfDocument(versionEntry);
      }
      else
      {
        const nodeEntry : NodeEntry = await this.contentApiService.getNode(this.fileSelectData.nodeId).toPromise();
        this.isPDFFile = CONST.isPdfDocument(nodeEntry);
      }
    }
    catch(error)
    {
      this.errorMessage = error;
    }
  }
}
