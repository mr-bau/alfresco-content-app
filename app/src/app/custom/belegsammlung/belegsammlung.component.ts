import { AfterContentInit, Component, OnInit } from '@angular/core';
import { AlfrescoApiService } from '@alfresco/adf-core';
import { Node } from '@alfresco/js-api';
import { ContentApiService } from '../../../../../projects/aca-shared/src/public-api';
import { CONST } from '../mrbau-global-declarations';

@Component({
  selector: 'mrbau-belegsammlung',
  templateUrl: './belegsammlung.component.html',
  styleUrls: ['./belegsammlung.component.scss']
})
export class BelegsammlungComponent implements OnInit, AfterContentInit {

  documentListStartFolder: string = '-root-';
  selectedNode: Node;
  errorMessage: string = null;

  constructor(
    private apiService: AlfrescoApiService,
    private contentApi: ContentApiService,
    ) {
    console.log("UserName: "+this.apiService.getInstance().getEcmUsername());
  }

  ngAfterContentInit(): void {

  }

  ngOnInit(): void {
    this.contentApi.getNodeInfo('-root-', {
      includeSource: true,
      include: CONST.GET_NODE_DEFAULT_INCLUDE,
      relativePath: '/Sites/belegsammlung/documentLibrary'
    }).toPromise().then(node => {
      this.documentListStartFolder = node.id;
      this.setNode(node);
    });
  }

  onClick(nodeEntry) {
    this.setNode(nodeEntry.entry)
  }

  setNode(node : Node)
  {
    this.selectedNode = node;
  }

  reset() {
      this.errorMessage = null;
  }

  onErrorOccurred(error: string) {
      this.errorMessage = error;
  }
  folderChange(event)
  {
    this.contentApi.getNodeInfo(event.value.id, {include: CONST.GET_NODE_DEFAULT_INCLUDE}).toPromise()
    .then(node => {
      this.setNode(node);
    });
  }
}

