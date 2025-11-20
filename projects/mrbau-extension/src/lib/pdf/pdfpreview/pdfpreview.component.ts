import { Component, OnInit, Input, SimpleChanges, ViewChild } from '@angular/core';

import { ContentApiService } from '@alfresco/aca-shared';
import { NodeEntry, VersionEntry } from '@alfresco/js-api';
import { CONST } from '../../declaration/mrbau-global-declarations';
import { NotificationService } from '@alfresco/adf-core';
import { IFileSelectData } from '../../declaration/mrbau-task-declarations';
import { CommonModule } from '@angular/common';
import { PdftronComponent } from '../pdftron/pdftron.component';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { PdfbrowserComponent } from '../pdfbrowser/pdfbrowser.component';
import { AlfrescoViewerComponent } from '@alfresco/adf-content-services';
import { CanComponentDeactivate } from '../../guards/pending-changes.interface';
import { Observable } from 'rxjs';
import { ErrormsgpaneComponent } from '@mrbau/mrbau-common';

const PDF_TRON = 'pdfTron';
const PDF_ACA ='aca'
const PDF_BROWSER='browser';

@Component({
  standalone:true,
  imports:[
      CommonModule,
      ErrormsgpaneComponent,
      MatButtonModule,
      MatButtonToggleModule,
      PdfbrowserComponent,
      AlfrescoViewerComponent,
      PdftronComponent,
    ],
  selector: 'mrbau-pdfpreview',
  templateUrl: './pdfpreview.component.html',
  styleUrls: ['./pdfpreview.component.scss']
})
export class PdfpreviewComponent implements OnInit, CanComponentDeactivate {
  readonly PDF_TRON = PDF_TRON;
  readonly PDF_ACA = PDF_ACA;
  readonly PDF_BROWSER = PDF_BROWSER;
  @ViewChild(PdftronComponent) pdftronComponent!: PdftronComponent;
  @Input() fileSelectData: IFileSelectData | null = null;
  @Input() dragging: boolean = false;
  errorMessage : string | null = null;
  isPDFFile = true;
  //useViewer : string = 'pdfTron';
  useViewer : string = PDF_BROWSER;
  fileSelectDataOut: IFileSelectData | null = null;

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

  async onViewerChanged(event: any) {
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
        const versionEntry : VersionEntry = await this.contentApiService.versionsApi.getVersion(this.fileSelectData.nodeId, this.fileSelectData.versionId)
        this.isPDFFile = CONST.isPdfDocument(versionEntry);
      }
      else
      {
        const nodeEntry : NodeEntry | undefined = await this.contentApiService.getNode(this.fileSelectData.nodeId).toPromise();
        if (nodeEntry) {
          this.isPDFFile = CONST.isPdfDocument(nodeEntry);
        }
      }
    }
    catch(error)
    {
      this.errorMessage = ''+error;
    }
  }
}
