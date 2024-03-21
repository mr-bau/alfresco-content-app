import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { DeviceDetectorService } from 'ngx-device-detector';
import { IFileSelectData } from '../tasks/tasks.component';
import { ContentApiService } from '@alfresco/aca-shared';
import { NodeEntry, VersionEntry } from '@alfresco/js-api';
import { CONST } from '../mrbau-global-declarations';
import { ContentService, NotificationService } from '@alfresco/adf-core';

@Component({
  selector: 'aca-pdfpreview',
  templateUrl: './pdfpreview.component.html',
  styleUrls: ['./pdfpreview.component.scss']
})
export class PdfpreviewComponent implements OnInit {
  @Input() fileSelectData: IFileSelectData;
  @Input() dragging: boolean = false;

  SHOW_TOOLBAR : string = "#toolbar=1";
  sanitized_document_url: SafeResourceUrl = null;
  errorMessage :string;
  useIframe: boolean;

  constructor(
    private deviceService: DeviceDetectorService,
    private sanitizer: DomSanitizer,
    private contentApiService : ContentApiService,
    private contentService : ContentService,
    private notificationService : NotificationService,
  ) {
    this.notificationService;
    this.useIframe = this.deviceService.browser != 'Firefox';
  }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.fileSelectData) {
      this.onFileSelected();
    }
  }

  isPDFFile = true;

  private onFileSelected() {
    if (!this.fileSelectData) {
      this.sanitized_document_url = null;
      return;
    }

    if (this.fileSelectData.versionId)
    {
      this.contentApiService._versionsApi.getVersion(this.fileSelectData.nodeId, this.fileSelectData.versionId)
      .then(
        (versionEntry : VersionEntry) => {
          this.isPDFFile = CONST.isPdfDocument(versionEntry);
          this.fileSelectedByUrl(this.contentApiService.getVersionContentUrl(this.fileSelectData.nodeId, this.fileSelectData.versionId));
        }
      )
      .catch(
        error => {
          this.errorMessage = error;
        }
      );
    }
    else
    {
      this.contentService.getNode(this.fileSelectData.nodeId).subscribe(
        (nodeEntry: NodeEntry) => {
          this.isPDFFile = CONST.isPdfDocument(nodeEntry);
          this.fileSelectedByUrl(this.contentService.getContentUrl(this.fileSelectData.nodeId));
        },
        error => {
          this.errorMessage = error;
        }
      );
    }
  }

  showViewerChange(event) {
    console.log(event);
  }
  /*
  private onFileSelected() {
    if (!this.fileSelectData) {
      this.sanitized_document_url = null;
      return;
    }

    if (this.fileSelectData.versionId)
    {
      this.contentApiService._versionsApi.getVersion(this.fileSelectData.nodeId, this.fileSelectData.versionId)
      .then(
        (versionEntry : VersionEntry) => {
          if (CONST.isPdfDocument(versionEntry))
          {
            //console.log(versionEntry);
            //versionEntry.entry.versionComment
            this.fileSelectedByUrl(this.contentApiService.getVersionContentUrl(this.fileSelectData.nodeId, this.fileSelectData.versionId));
          }
          else
          {
            this.fileSelectedByUrl(null);
            if (!this.fileSelectData.suppressNotification)
            {
              this.notificationService.showInfo('Nur PDF-Dokumente werden angezeigt!');
            }
          }
        }
      )
      .catch(
        error => {
          this.errorMessage = error;
        }
      );
    }
    else
    {
      this.contentService.getNode(this.fileSelectData.nodeId).subscribe(
        (nodeEntry: NodeEntry) => {
          if (CONST.isPdfDocument(nodeEntry))
          {
            this.fileSelectedByUrl(this.contentService.getContentUrl(this.fileSelectData.nodeId));
          }
          else
          {
            this.fileSelectedByUrl(null);
            if (!this.fileSelectData.suppressNotification)
            {
              this.notificationService.showInfo('Nur PDF-Dokumente werden angezeigt!');
            }
          }
        },
        error => {
          this.errorMessage = error;
        }
      );
    }
  }
  */

  private fileSelectedByUrl(fileUrl : string)
  {
    if (fileUrl == null)
    {
      this.sanitized_document_url = null;
      return;
    }
    this.sanitized_document_url = this.sanitizeUrl(fileUrl.concat(this.SHOW_TOOLBAR));
  }

  private sanitizeUrl(url:string) : SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}
