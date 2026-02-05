import { Component, OnInit, Input, SimpleChanges, ViewChild } from '@angular/core';
import { Node } from '@alfresco/js-api';
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
import { Observable, Subject, takeUntil } from 'rxjs';
import { ErrormsgpaneComponent } from '@mrbau/mrbau-common';
import { EPDFEventCommands, IEventData, MrbauDataService } from '../../services/mrbau-data.service';
import { MrbauCommonService } from '../../services/mrbau-common.service';
import { MrbauPdfLibService } from '../pdf-lib/mrbau-pdf-lib.service';

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
  private destroy$ = new Subject<void>();
  readonly PDF_TRON = PDF_TRON;
  readonly PDF_ACA = PDF_ACA;
  readonly PDF_BROWSER = PDF_BROWSER;
  @ViewChild(PdftronComponent) pdftronComponent!: PdftronComponent;
  @Input() fileSelectData: IFileSelectData | null = null;
  @Input() dragging: boolean = false;
  errorMessage : string | null = null;
  isPDFFile = true;
  browserReloadToken: number = 0;
  acaViewerReloadFlag = true;
  //useViewer : string = 'pdfTron';
  useViewer : string = PDF_TRON;
  fileSelectDataOut: IFileSelectData | null = null;

  constructor(
    private contentApiService : ContentApiService,
    private notificationService : NotificationService,
    private mrbauDataService: MrbauDataService,
    private mrbauCommonService : MrbauCommonService,
    private mrbauPdfLibService : MrbauPdfLibService,
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
    this.mrbauDataService.pdfViewerEvents$
    .pipe(takeUntil(this.destroy$)) // Automatically unsubscribes when destroy$ emits
    .subscribe(result => {
      this.onPdfViewerEvent(result);
    });
  }

  ngOnDestroy() {
    this.destroy$.next(); // Kills the subscription
    this.destroy$.complete();
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

  async onPdfViewerEvent(data : IEventData) : Promise<Observable<boolean> | Promise<boolean> | boolean>
  {
    if (this.useViewer == PDF_TRON && this.pdftronComponent)
    {
      const result = this.pdftronComponent.executePDFViewerEvent(data);
      return result;
    }
    else {
      if (data.eventCommand === EPDFEventCommands.ADD_PAGE_FIRST) {
        // use pdf-lib to merge documents
        const node : Node  = data.node;
        const nodePdfData = await this.mrbauCommonService.loadNodeContent(node.id);
        const merged = await this.mrbauPdfLibService.mergePDFs(data.eventData, nodePdfData);
        //this.mrbauPdfLibService.downloadPdf(merged, node.name+'.pdf');
        try {
          await this.mrbauCommonService.uploadNewVersion(node.id, merged, "Prüfblatt hinzugefügt");
          this.browserReloadToken++;
          this.reloadAcaViewer();
          return true;
        } catch (error) {
          console.log(error);
          this.mrbauCommonService.showError('Fehler beim Upload: '+error);
        }
      }
      else {
        this.mrbauCommonService.showError('Fehler: PDF Event '+data.eventCommand+' nicht unterstützt!')
      }
    }
    return false;
  }

  private reloadAcaViewer() {
    this.acaViewerReloadFlag = false;
    // Ein kurzer Timeout ist nötig, damit Angular den DOM-Change wahrnimmt
    setTimeout(() => {
      this.acaViewerReloadFlag = true;
    }, 100);
  }
}
