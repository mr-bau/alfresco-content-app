import { Component, OnInit, Input } from '@angular/core';
import { SafeResourceUrl } from '@angular/platform-browser';
import { DeviceDetectorService } from 'ngx-device-detector';

@Component({
  selector: 'aca-pdfpreview',
  templateUrl: './pdfpreview.component.html',
  styleUrls: ['./pdfpreview.component.scss']
})
export class PdfpreviewComponent implements OnInit {
  @Input() document_url: SafeResourceUrl = null;

  public useIframe: boolean;

  constructor(private deviceService: DeviceDetectorService) {
    this.useIframe = this.deviceService.browser != 'Firefox';
  }

  ngOnInit(): void {
  }


}
