import { Component, OnInit, Input } from '@angular/core';
import { SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'aca-pdfpreview',
  templateUrl: './pdfpreview.component.html',
  styleUrls: ['./pdfpreview.component.scss']
})
export class PdfpreviewComponent implements OnInit {
  @Input() document_url: SafeResourceUrl = null;

  constructor() { }

  ngOnInit(): void {
  }


}
