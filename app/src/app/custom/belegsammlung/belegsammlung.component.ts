import { AfterContentInit, Component, OnInit } from '@angular/core';
import { AlfrescoApiService } from '@alfresco/adf-core';
import { ContentApiService } from '@alfresco/aca-shared'
import { ChangeDetectorRef } from '@angular/core';

//NodesApi
@Component({
  selector: 'mrbau-belegsammlung',
  templateUrl: './belegsammlung.component.html',
  styleUrls: ['./belegsammlung.component.scss']
})
export class BelegsammlungComponent implements OnInit, AfterContentInit {

  documentListStartFolder: string = '-sites-';

  static SHOW_TOOLBAR : string = "#toolbar=0";
  pdf_url : string = "";
  pdf_url1 : string="assets/pdf/test1.pdf";
  pdf_url2: string="assets/pdf/test2.pdf";
  t : boolean = true;
  site : string;

  constructor(private apiService: AlfrescoApiService, private contentApi: ContentApiService, private changeDetector: ChangeDetectorRef) {
    console.log("UserName: "+this.apiService.getInstance().getEcmUsername());

  }

  ngAfterContentInit(): void {

  }

  ngOnInit(): void {
    this.contentApi.getNodeInfo('-root-', {
      includeSource: true,
      include: ['path', 'properties'],
      relativePath: '/Sites/belegsammlung/documentLibrary'
    }).toPromise().then(node => {
      console.log(node);
      this.documentListStartFolder = node.id;
      this.changeDetector.detectChanges();
    });
  }

  testPdfLoad()
  {
    console.log("test");
    this.t = !this.t;
    this.pdf_url = (this.t ? this.pdf_url1 : this.pdf_url2);
    (<HTMLIFrameElement>document.getElementById('my-iframe')).src = this.pdf_url +BelegsammlungComponent.SHOW_TOOLBAR;
  }
}

