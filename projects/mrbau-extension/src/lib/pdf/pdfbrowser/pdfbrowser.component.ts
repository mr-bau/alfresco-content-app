import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { DeviceDetectorService } from 'ngx-device-detector';
import { ContentApiService } from '@alfresco/aca-shared';
import { CommonModule } from '@angular/common';
import { IFileSelectData } from '../../declaration/mrbau-task-declarations';

@Component({
  standalone:true,
  imports:[
    CommonModule,
  ],
  selector: 'mrbau-pdfbrowser',
  templateUrl: './pdfbrowser.component.html',
  styleUrls: []
})
export class PdfbrowserComponent implements OnChanges {
  @Input() fileSelectData: IFileSelectData | null = null;
  SHOW_TOOLBAR : string = "#toolbar=1";
  useIframe: boolean;
  sanitized_document_url: SafeResourceUrl | null = null;

  constructor(
    private deviceService: DeviceDetectorService,
    private sanitizer: DomSanitizer,
    private contentApiService : ContentApiService,
  ) {
    this.useIframe = this.deviceService.browser != 'Firefox';
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.fileSelectData) {
      this.onFileSelected();
      //console.log('on Changes');
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
