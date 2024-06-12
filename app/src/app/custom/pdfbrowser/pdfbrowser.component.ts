import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { DeviceDetectorService } from 'ngx-device-detector';
import { ContentApiService } from '@alfresco/aca-shared';
import { IFileSelectData } from '../tasks/tasks.component';

@Component({
  selector: 'aca-pdfbrowser',
  templateUrl: './pdfbrowser.component.html',
  styleUrls: ['./pdfbrowser.component.scss']
})
export class PdfbrowserComponent implements OnChanges {
  @Input() fileSelectData: IFileSelectData;
  SHOW_TOOLBAR : string = "#toolbar=1";
  useIframe: boolean;
  sanitized_document_url: SafeResourceUrl = null;

  constructor(
    private deviceService: DeviceDetectorService,
    private sanitizer: DomSanitizer,
    private contentApiService : ContentApiService,
  ) {
    this.useIframe = this.deviceService.browser != 'Firefox';
    console.log('constructor');
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.fileSelectData) {
      this.onFileSelected();
      console.log('on Changes');
    }
  }

  private onFileSelected() {
    if (!this.fileSelectData) {
      this.sanitized_document_url = null;
      return;
    }

    if (this.fileSelectData.versionId)
    {
      this.loadUrl(this.contentApiService.getVersionContentUrl(this.fileSelectData.nodeId, this.fileSelectData.versionId));
    }
    else
    {
      this.loadUrl(this.contentApiService.getContentUrl(this.fileSelectData.nodeId));
    }
  }

  private loadUrl(fileUrl : string)
  {
    if (fileUrl == null)
    {
      this.sanitized_document_url = null;
    }
    else {
      this.sanitized_document_url = this.sanitizeUrl(fileUrl);
    }
  }

  private sanitizeUrl(url:string) : SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}
