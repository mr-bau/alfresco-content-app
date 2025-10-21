import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Node, NodeEntry } from '@alfresco/js-api';
import { ContentApiService, PageLayoutContentComponent, PageLayoutHeaderComponent, ToolbarActionComponent, PageLayoutComponent} from '@alfresco/aca-shared';
import { AuthenticationService, DataTableModule, EmptyContentComponent, PaginationComponent, ToolbarModule } from '@alfresco/adf-core';
import { BreadcrumbComponent, DocumentListModule, TreeViewComponent } from '@alfresco/adf-content-services';
import { ContentActionRef } from '@alfresco/adf-extensions';

import { MrbauPageLayoutComponent } from '@mrbau/mrbau-common';
import { CONST } from '../declaration/mrbau-global-declarations';
import { MrbauSplitpaneBelegsammlungComponent } from '../splitpane/splitpane-belegsammlung/splitpane-belegsammlung.component';

@Component({
  standalone:true,
  imports: [CommonModule,
    MrbauPageLayoutComponent,
    MrbauSplitpaneBelegsammlungComponent,
    TreeViewComponent,
    PageLayoutComponent,
    PageLayoutContentComponent,
    PageLayoutHeaderComponent,
    BreadcrumbComponent,
    ToolbarModule,
    ToolbarActionComponent,
    DocumentListModule,
    PaginationComponent,
    DataTableModule,
    EmptyContentComponent,

  ],
  selector: 'mrbau-belegsammlung',
  templateUrl: './belegsammlung.component.html',
  styleUrls: ['./belegsammlung.component.scss']
})
export class BelegsammlungComponent implements OnInit {

  documentListStartFolder: string = '-root-';
  selectedNode: Node | undefined = undefined;
  errorMessage: string | null = null;
  loaderVisible = false;

  //
  // USE Data Table with search results instead of document list

  constructor(
    private contentApi: ContentApiService,
    private authenticationService: AuthenticationService,
    ) {
      console.log("UserName: "+this.authenticationService.getEcmUsername());
  }

  ngOnInit(): void {
    this.contentApi.getNodeInfo('-root-', {
      includeSource: true,
      include: CONST.GET_NODE_DEFAULT_INCLUDE,
      relativePath: '/Sites/belegsammlung/documentLibrary'
    }).toPromise().then(node => {
      if (node) {
        this.documentListStartFolder = node.id;
      }
      this.setNode(node);
    });
  }

  onClick(nodeEntry : NodeEntry) {
    this.setNode(nodeEntry.entry)
  }

  setNode(node : Node | undefined)
  {
    this.selectedNode = node;
  }

  reset() {
      this.errorMessage = null;
  }

  onErrorOccurred(error: string) {
      this.errorMessage = error;
  }
  folderChange(event : any)
  {
    this.contentApi.getNodeInfo(event.value.id, {include: CONST.GET_NODE_DEFAULT_INCLUDE}).toPromise()
    .then(node => {
      this.setNode(node);
    });
  }

  actions: Array<ContentActionRef> = [];
  trackByActionId(_: number, action: ContentActionRef) {
    return action.id;
  }
}

