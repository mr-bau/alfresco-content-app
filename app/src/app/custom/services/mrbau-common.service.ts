import { Injectable } from '@angular/core';
import { CommentContentService, CommentModel, EcmUserModel, PeopleContentService, ContentService, NotificationService, AuthenticationService, NodesApiService,  } from '@alfresco/adf-core';
import { MinimalNodeEntity, NodeBodyUpdate, NodeEntry, PersonEntry, Node, SearchRequest, ResultSetPaging, CommentEntry } from '@alfresco/js-api';
import { Observable, Subject } from 'rxjs';
import { EMRBauTaskStatus } from '../mrbau-task-declarations';
import { DatePipe } from '@angular/common';
import { CONST } from '../mrbau-global-declarations';
import { ContentNodeSelectorComponent, ContentNodeSelectorComponentData } from '@alfresco/adf-content-services';
import { MatDialog } from '@angular/material/dialog';
import { ContentApiService } from '../../../../../projects/aca-shared/src/public-api';
import { MrbauConfirmTaskDialogComponent } from '../dialogs/mrbau-confirm-task-dialog/mrbau-confirm-task-dialog.component';
import { ContentManagementService } from '../../services/content-management.service';
import { FormlyFieldConfig } from '@ngx-formly/core';

@Injectable({
  providedIn: 'root'
})
export class MrbauCommonService {
  // MR-TODO implement caching
  constructor(
    private dialog: MatDialog,
    private peopleContentService: PeopleContentService,
    private commentContentService: CommentContentService,
    private contentService: ContentService,
    private contentApiService: ContentApiService,
    private nodesApiService: NodesApiService,
    private datePipe : DatePipe,
    private notificationService : NotificationService,
    private authenticationService : AuthenticationService,
    private contentManagementService: ContentManagementService,
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
  getUserProfileImage(avatarId: string) : string
  {
    return this.contentService.getContentUrl(avatarId);
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
      this.peopleContentService.listPeople({skipCount : 0, maxItems : 999, sorting : { orderBy: "firstName", direction: "ASC"}}).subscribe(
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

  updateComment(nodeId: string, commentId: string, comment: string) : Promise<CommentEntry>
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

    return this.commentContentService.commentsApi.updateComment(nodeId, commentId, {"content": comment});
  }

  deleteComment(nodeId: string, commentId: string) : Promise<any>
  {
    return this.commentContentService.commentsApi.deleteComment(nodeId, commentId);
  }

  showInfo(message:string) {
    this.notificationService.showInfo(message);
  }

  showError(message:string) {
    this.notificationService.showError(message);
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

  updateTaskDescription(nodeId: string, description : string) :  Promise<NodeEntry>
  {
    let nodeBodyUpdate : NodeBodyUpdate = {"properties": {"mrbt:description": description}};
    return this.contentService.nodesApi.updateNode(nodeId, nodeBodyUpdate);
  }

  getFormDateValue(date: Date) : string {
    if (date == null)
    {
      return undefined;
    }
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

  addAssociatedDocumentFromTask(taskId: string, associatedDocumentIds: string[]) : Promise<any>
  {
    let bodyParams = [];
    for (let i=0; i< associatedDocumentIds.length; i++)
    {
      bodyParams.push({
        targetId : associatedDocumentIds[i],
        assocType : 'mrbt:associatedDocument'}
      );
    };

    const pathParams = {
      'nodeId': taskId
    };
    const queryParams = {};
    const headerParams= {};
    const formParams = {};
    const contentTypes = ['application/json'];
    const accepts = ['application/json'];
    return this.nodesApiService.nodesApi.apiClient.callApi("/nodes/{nodeId}/targets", "POST", pathParams, queryParams, headerParams, formParams, bodyParams, contentTypes, accepts);
  }

  deleteAssociatedDocumentFromTask(taskId: string, associatedDocumentRef: string) : Promise<any>
  {
    const pathParams = {
      nodeId: taskId,
      targetId: associatedDocumentRef,
      assocType : 'mrbt:associatedDocumentRef'
    };
    const queryParams = {};
    const headerParams= {};
    const formParams = {};
    const bodyParams = [];
    const contentTypes = ['application/json'];
    const accepts = ['application/json'];
    return this.nodesApiService.nodesApi.apiClient.callApi("/nodes/{nodeId}/targets/{targetId}", "DELETE", pathParams, queryParams, headerParams, formParams, bodyParams, contentTypes, accepts)
  }

  uploadNewVersionWithDialog(node: Node, file: File)
  {
    this.contentManagementService.versionUpdateDialog(node, file);
  }

  discardDocument(nodeId : string) : Promise<MinimalNodeEntity>
  {
    const date = new Date();
    const nodeBodyUpdate : NodeBodyUpdate = {"properties": {"mrba:discardDate": this.getFormDateValue(date)}};
    return this.contentService.nodesApi.updateNode(nodeId, nodeBodyUpdate);
  }

  progressWithNewUserConfirmDialog(assignedUserName : string) : Promise<string>
  {
    //this.model['mrbt:assignedUserName'] = task.assignedUserName;
    return new Promise((resolve, reject) =>
      {
        // dialog
        const dialogRef = this.dialog.open(MrbauConfirmTaskDialogComponent, {
          data: {
            dialogTitle: 'Weiterleiten',
            dialogMsg: 'Aufgabe an Mitarbeiter Weiterleiten',
            dialogButtonOK: 'WEITERLEITEN',
            callQueryData: false,
            fieldsMain: [
              {
                fieldGroupClassName: 'flex-container-min-width',
                fieldGroup: [
                  {
                    fieldGroupClassName: 'flex-container-min-width',
                    fieldGroup: [
                      {
                        className: 'flex-2',
                        key: 'mrbt:assignedUserName',
                        defaultValue: assignedUserName,
                        type: 'select',
                        props: {
                          label: 'Mitarbeiter',
                          options: this.getPeopleObservable(),
                          valueProp: 'id',
                          labelProp: 'displayName',
                        },
                      }
                    ]
                  }

                ]
              }
            ],
            payload: null
          }
        });

        dialogRef.afterClosed().subscribe((result) => {
          if (result)
          {
            if (result['mrbt:assignedUserName'])
            {
              resolve(result['mrbt:assignedUserName']);
            }
            else
            {
              reject("Kein Mitarbeiter ausgewählt");
            }
          }
          else {
            reject("Weiterleiten Abgebrochen");
          }
        });
      }
    )
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
                    props: {
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
              result;
              return resolve(true);
            })
            .catch((error) => reject(error));
          }
          else {
            resolve(false);
          }
        });
      }
    )
  }

  patchFormFieldConfigRequiredPropertyRecursive(formlyFieldConfig: FormlyFieldConfig, mandatoryRequiredProperties: string[])
  {
    let key = formlyFieldConfig.key as string;
    if (key)
    {
      if (mandatoryRequiredProperties.indexOf(key) >= 0)
      {
        formlyFieldConfig.props.required = true;
      }
      // else set not required
      else if (formlyFieldConfig.props && formlyFieldConfig.props.required)
      {
        formlyFieldConfig.props.required = false;
      }
    }
    if (formlyFieldConfig.fieldGroup)
    {
      formlyFieldConfig.fieldGroup.forEach( (fc) => this.patchFormFieldConfigRequiredPropertyRecursive(fc, mandatoryRequiredProperties))
    }
  }
}
