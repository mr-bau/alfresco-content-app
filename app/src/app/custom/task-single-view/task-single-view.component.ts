import { ContentService, NotificationService } from '@alfresco/adf-core';
import { NodeEntry, VersionEntry } from '@alfresco/js-api';
import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, Params } from '@angular/router';
import { ContentApiService } from '../../../../../projects/aca-shared/src/public-api';
import { CONST } from '../mrbau-global-declarations';
import { MRBauTask } from '../mrbau-task-declarations';
import { MrbauCommonService } from '../services/mrbau-common.service';
import { IFileSelectData, ITaskChangedData } from '../tasks/tasks.component';

@Component({
  selector: 'aca-task-single-view',
  templateUrl: './task-single-view.component.html',
  styleUrls: ['./task-single-view.component.scss']
})
export class TaskSingleViewComponent implements OnInit {

  nodeId = '';
  SHOW_TOOLBAR : string = "#toolbar=1";
  document_url: SafeResourceUrl = null;
  private _remember_document_url : SafeResourceUrl = null;
  selectedTask: MRBauTask = null;
  loaderVisible : boolean;
  errorMessage :string;

  constructor(
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer,
    private mrbauCommonService : MrbauCommonService,
    private contentService : ContentService,
    private contentApiService: ContentApiService,
    private notificationService : NotificationService,
  ){
  }

  ngOnInit(): void {
    this.route.params.subscribe(({ nodeId }: Params) => {
      this.nodeId = nodeId;
      this.queryTask();
    });
  }

  queryTask()
  {
    this.mrbauCommonService.getNode(this.nodeId).toPromise().then(result => {
      //console.log(result);
      let task = new MRBauTask();
      task.updateWithNodeData(result.entry);
      this.taskSelected(task);

    });
  }

  sanitizeUrl(url:string) : SafeResourceUrl {
      return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  dragStartEvent(){
    // workaround: hide pdf viewer during split pane resize
    this._remember_document_url = this.document_url;
    this.document_url = null;
  }

  dragEndEvent(){
    // workaround: restore pdf viewer after split pane resize
    this.document_url = this._remember_document_url;
    this._remember_document_url = null;
  }

  taskSelected(task : MRBauTask) {
    this.selectedTask = task;
    this.selectedFirstAssociatedFile();
  }

  private selectedFirstAssociatedFile()
  {
    if (!this.selectedTask || this.selectedTask.associatedDocumentRef.length == 0)
    {
      this.fileSelected(null);
      return;
    }
    this.fileSelected({nodeId : this.selectedTask.associatedDocumentRef[0], suppressNotification : true})
  }

  fileSelected(fileSelectData : IFileSelectData) {
    if (!fileSelectData) {
      this.fileSelectedByUrl(null);
      return;
    }

    if (fileSelectData.versionId)
    {
      this.contentApiService._versionsApi.getVersion(fileSelectData.nodeId, fileSelectData.versionId)
      .then(
        (versionEntry : VersionEntry) => {
          if (CONST.isPdfDocument(versionEntry))
          {
            //console.log(versionEntry);
            //versionEntry.entry.versionComment
            this.fileSelectedByUrl(this.contentApiService.getVersionContentUrl(fileSelectData.nodeId, fileSelectData.versionId));
          }
          else
          {
            this.fileSelectedByUrl(null);
            if (!fileSelectData.suppressNotification)
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
      this.contentService.getNode(fileSelectData.nodeId).subscribe(
        (nodeEntry: NodeEntry) => {
          if (CONST.isPdfDocument(nodeEntry))
          {
            this.fileSelectedByUrl(this.contentService.getContentUrl(fileSelectData.nodeId));
          }
          else
          {
            this.fileSelectedByUrl(null);
            if (!fileSelectData.suppressNotification)
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

  private fileSelectedByUrl(fileUrl : string)
  {
    if (fileUrl == null)
    {
      this.document_url = null;
      return;
    }
    this.document_url = this.sanitizeUrl(fileUrl.concat(this.SHOW_TOOLBAR));
  }

  taskChanged(taskChangedData : ITaskChangedData)
  {
    taskChangedData;
  }

}
