import { Injectable } from '@angular/core';
import { CommentContentService, CommentModel, EcmUserModel, PeopleContentService, ContentService, NotificationService, AuthenticationService,  } from '@alfresco/adf-core';
import { MinimalNodeEntity, NodeBodyUpdate, NodeEntry, PersonEntry, Node, SearchRequest, ResultSetPaging } from '@alfresco/js-api';
import { Observable, Subject } from 'rxjs';
import { EMRBauTaskStatus } from '../mrbau-task-declarations';
import { DatePipe } from '@angular/common';
import { CONST } from '../mrbau-global-declarations';
import { ContentNodeSelectorComponent, ContentNodeSelectorComponentData } from '@alfresco/adf-content-services';
import { MatDialog } from '@angular/material/dialog';
import { ContentApiService } from '../../../../../projects/aca-shared/src/public-api';
import { MrbauConfirmTaskDialogComponent } from '../dialogs/mrbau-confirm-task-dialog/mrbau-confirm-task-dialog.component';

@Injectable({
  providedIn: 'root'
})
export class MrbauCommonService {
  // TODO implement caching
  constructor(
    private dialog: MatDialog,
    private peopleContentService: PeopleContentService,
    private commentContentService: CommentContentService,
    private contentService: ContentService,
    private contentApiService: ContentApiService,
    private datePipe : DatePipe,
    private notificationService : NotificationService,
    private authenticationService : AuthenticationService,
    ) {
    }

  async openLinkFilesDialog(callback:(val: Node[]) => void, callbackError:(val: string) => void) {

    this.getContentNodeSelectorComponentDataBelegsammlung()
    .then(
      (data:ContentNodeSelectorComponentData) => {
        this.dialog.open(
          ContentNodeSelectorComponent,
          {
              data,
              panelClass: 'adf-content-node-selector-dialog',
              minWidth: '630px'
          },
        );

        data.select.subscribe((selections: Node[]) => {
          // Use or store selection...
          callback(selections);
        },
        (error)=>{
            //your error handling
            callbackError(error);
        },
        ()=>{
            //action called when an action or cancel is clicked on the dialog
            this.dialog.closeAll();
        });
      }
    )
    .catch((error) => callbackError(error));
  }

  private nodeIdBelegsammlungDocumentLibrary : string;
  private async getContentNodeSelectorComponentDataBelegsammlung() : Promise<ContentNodeSelectorComponentData> {
    if (this.nodeIdBelegsammlungDocumentLibrary == null)
    {
      // /app:company_home/st:sites/cm:belegsammlung/cm:documentLibrary
      const node = await this.contentApiService.getNodeInfo('-root-',{relativePath : '/sites/belegsammlung/documentLibrary'}).toPromise();
      this.nodeIdBelegsammlungDocumentLibrary = node.id;
    }
    const data: ContentNodeSelectorComponentData = {
      title: "Datei auswählen",
      dropdownHideMyFiles: true,
      selectionMode: 'multiple',
      currentFolderId: this.nodeIdBelegsammlungDocumentLibrary,
      select: new Subject<Node[]>(),
      isSelectionValid: (entry: Node) => {return entry.isFile},
    };

    return data;
  };

  getCurrentUser() : Promise<PersonEntry>
  {
    return this.peopleContentService.peopleApi.getPerson('-me-');
  }

  isAdminUser() : boolean {
    return (this.authenticationService.getEcmUsername() == 'admin')
  }

  //getTaskRootPath() : Promise<NodeEntry> {
  //  return this.nodesApiService.nodesApi.getNode('-root-', { includeSource: true, include: ['path'], relativePath: MRBauTask.TASK_RELATIVE_ROOT_PATH });
  //}

  getNode(nodeId:string, opts?:any) : Observable<MinimalNodeEntity> {
    return this.contentService.getNode(nodeId, opts);
  }

  getPeopleObservable() : Observable<EcmUserModel[]> {
    return new Observable(observer => {
      this.peopleContentService.listPeople({skipCount : 0, maxItems : 999, sorting : { orderBy: "id", direction: "ASC"}}).subscribe(
        data => observer.next(data.entries),
        err  => observer.error(err),
        ()   => observer.complete(),
      );
    });
  }

  getNodeComments(nodeId : string) : Observable<CommentModel[]>
  {
    return this.commentContentService.getNodeComments(nodeId);
  }

  addComment(nodeId: string, comment: string) : Promise<CommentModel>
  {
    if (!comment || !nodeId)
    {
      return Promise.resolve(null);
    }
    comment = comment.trim();
    if (comment.length == 0)
    {
      return Promise.resolve(null);
    }

    return this.commentContentService.addNodeComment(nodeId, comment).toPromise();
  }

  showInfo(message:string) {
    this.notificationService.showInfo(message);
  }

  updateTaskStatus(nodeId: string, status : EMRBauTaskStatus, newUserId?: string) :  Promise<NodeEntry>
  {
    let nodeBodyUpdate : NodeBodyUpdate = {"properties": {"mrbt:status": ""+status}};
    if (newUserId)
    {
      nodeBodyUpdate.properties["mrbt:assignedUserName"] = newUserId;
    }

    return this.contentService.nodesApi.updateNode(nodeId, nodeBodyUpdate);
  }

  updateTaskAssignNewUser(nodeId: string, newUserId: string) :  Promise<NodeEntry>
  {
    let nodeBodyUpdate : NodeBodyUpdate = {"properties": {"mrbt:assignedUserName": newUserId}};
    return this.contentService.nodesApi.updateNode(nodeId, nodeBodyUpdate);
  }

  getFormDateValue(date: Date) : string {
    return this.datePipe.transform(date, 'yyyy-MM-dd');
  }

  getNodeRefFromNodeId(nodeId : string) : string
  {

    return 'workspace://SpacesStore/'+nodeId;
  }

  queryNodes(searchRequest: SearchRequest) : Promise<ResultSetPaging>
  {
    return this.contentApiService.search(searchRequest).toPromise();
  }

  discardDocument(nodeId : string) : Promise<MinimalNodeEntity>
  {
    const date = new Date();
    const nodeBodyUpdate : NodeBodyUpdate = {"properties": {"mrba:discardDate": this.getFormDateValue(date)}};
    return this.contentService.nodesApi.updateNode(nodeId, nodeBodyUpdate);
  }

  discardDocumentWithConfirmDialog(nodeId : string) : Promise<boolean>
  {
    return new Promise((resolve, reject) =>
      {
        // dialog
        const dialogRef = this.dialog.open(MrbauConfirmTaskDialogComponent, {
          data: {
            dialogTitle: 'Dokument Löschen',
            dialogMsg: 'Dokument endgültig löschen?',
            dialogButtonOK: 'DOKUMENT LÖSCHEN',
            callQueryData: false,
            fieldsMain: [
              {
                fieldGroupClassName: 'flex-container-min-width',
                fieldGroup: [
                  {
                    className: 'flex-2',
                    key: 'comment',
                    type: 'textarea',
                    templateOptions: {
                      label: 'Optionaler Kommentar',
                      description: 'Kommentar',
                      maxLength: CONST.MAX_LENGTH_COMMENT,
                      required: false,
                    },
                  },
                ]
              }
            ],
            payload: null
          }
        });

        dialogRef.afterClosed().subscribe((result) => {
          if (result)
          {
            this.addComment(nodeId, result.comment)
            .then(() => {return this.discardDocument(nodeId)})
            .then((result) =>
            {
              console.log(result);
              return resolve(true);
            })
            .catch((error) => reject(error));
          }
        });
      }
    )
  }
}
