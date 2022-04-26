import { Component, OnInit   } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';


@Component({
  selector: 'aca-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.scss'],

})
export class TasksComponent implements OnInit {
  SHOW_TOOLBAR : string = "#toolbar=1";
  document_url: SafeResourceUrl = null;

  private urls : string[] = ["https://unec.edu.az/application/uploads/2014/12/pdf-sample.pdf", "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf", null];
  private docId = 0;

  constructor(private sanitizer: DomSanitizer) {

  }

  ngOnInit(): void {
  }

  testPdfLoad()
  {
    let fullURL = this.urls[this.docId];
    if (fullURL != null)
    {
      fullURL = fullURL.concat(this.SHOW_TOOLBAR);
      this.document_url = this.sanitizer.bypassSecurityTrustResourceUrl(fullURL);
    }
    else
    {
      this.document_url = null;
    }

    this.docId = (this.docId+1) % this.urls.length;
    console.log(this.document_url);
    //this.document_url = "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"+this.SHOW_TOOLBAR;
  }
}
