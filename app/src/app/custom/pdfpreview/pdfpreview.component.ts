import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import { IFileSelectData } from '../tasks/tasks.component';
import { ContentApiService } from '@alfresco/aca-shared';
import { NodeEntry, VersionEntry } from '@alfresco/js-api';
import { CONST } from '../mrbau-global-declarations';
import { NotificationService } from '@alfresco/adf-core';

@Component({
  selector: 'aca-pdfpreview',
  templateUrl: './pdfpreview.component.html',
  styleUrls: ['./pdfpreview.component.scss']
})
export class PdfpreviewComponent implements OnInit {
  @Input() fileSelectData: IFileSelectData;
  @Input() dragging: boolean = false;
  errorMessage :string;
  isPDFFile = true;
  useViewer : string = 'pdfTron';

  constructor(
    private contentApiService : ContentApiService,
    private notificationService : NotificationService,
  ) {
    this.notificationService;
  }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.fileSelectData) {
      this.onFileSelected();
    }
  }

  onViewerChanged(event) {
    //console.log(event);
    if (!event) {
      return;
    }
    this.useViewer = event;
  }

  private onFileSelected() {
    this.errorMessage = null;
    if (!this.fileSelectData) {
      return;
    }

    if (this.fileSelectData.versionId)
    {
      this.contentApiService._versionsApi.getVersion(this.fileSelectData.nodeId, this.fileSelectData.versionId)
      .then(
        (versionEntry : VersionEntry) => {
          this.isPDFFile = CONST.isPdfDocument(versionEntry);
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
      this.contentApiService.getNode(this.fileSelectData.nodeId).subscribe(
        (nodeEntry: NodeEntry) => {
          this.isPDFFile = CONST.isPdfDocument(nodeEntry);
        },
        error => {
          this.errorMessage = error;
        }
      );
    }
  }
}
