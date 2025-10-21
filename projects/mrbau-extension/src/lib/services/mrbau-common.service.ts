import { inject, Injectable } from '@angular/core';
import { NodesApiService, ContentService, AlfrescoApiService } from '@alfresco/adf-content-services';
import { PeopleContentService, EcmUserModel, SearchService } from '@alfresco/adf-content-services';
import { CommentModel, NotificationService, AuthenticationService, ADF_COMMENTS_SERVICE, } from '@alfresco/adf-core';
import { NodeBodyUpdate, NodeEntry, PersonEntry, Node, SearchRequest, ResultSetPaging, CommentEntry, CommentsApi, NodesApi, NodesIncludeQuery } from '@alfresco/js-api';
import { Observable, Subject } from 'rxjs';
import { EMRBauTaskCategory, EMRBauTaskStatus, MRBauTask } from '../declaration/mrbau-task-declarations';
import { DatePipe, DecimalPipe } from '@angular/common';
import { CONST } from '../declaration/mrbau-global-declarations';
import { ContentNodeSelectorComponent, ContentNodeSelectorComponentData, TagService } from '@alfresco/adf-content-services';
import { MatDialog } from '@angular/material/dialog';
import { ContentApiService } from '@alfresco/aca-shared';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { ICostCarrier, IVendor } from './mrbau-conventions.service';
import { MrbauExportService } from './mrbau-export.service';
import { CommentsService } from '@alfresco/adf-core';
import { MrbauConfirmTaskDialogComponent } from '../dialogs/mrbau-confirm-task-dialog/mrbau-confirm-task-dialog.component';
import { IMrbauDbService_mrba_project, MrbauDbService } from './mrbau-db.service';
import { MrbauCalcDeductionDialogComponent, ResultDetails } from '../dialogs/mrbau-calc-deduction-dialog/mrbau-calc-deduction-dialog.component';
import { AppStore, UploadFileVersionAction } from '@alfresco/aca-shared/store';
import { Store } from '@ngrx/store';

export interface IMrbauReplaceCompanyInfoData {
  key:string,
  old: any,
  new:any
}

// SERVICE
@Injectable({
  providedIn: 'root'
})
export class MrbauCommonService {
  private decimalPipe = inject(DecimalPipe);

  constructor(
    protected store: Store<AppStore>,
    private dialog: MatDialog,
    private peopleContentService: PeopleContentService,
    //private commentsService: CommentsService,
    private contentService: ContentService,
    private tagService: TagService,
    private contentApiService: ContentApiService,
    private nodesApiService: NodesApiService,
    private datePipe : DatePipe,
    //private decimalPipe : DecimalPipe,
    private notificationService : NotificationService,
    private authenticationService : AuthenticationService,
    //private contentManagementService: ContentManagementService,
    private mrbauDbService: MrbauDbService,
    private searchService : SearchService,
    private mrbauExportService : MrbauExportService,
    private alfrescoApiService: AlfrescoApiService
    ) {
      CONST;
    }

  private _commentsApi: CommentsApi | undefined;
  get commentsApi(): CommentsApi {
    if (!this._commentsApi) {
      this._commentsApi = new CommentsApi(this.alfrescoApiService.getInstance());
    }
    return this._commentsApi;
  }

  private _nodesApi: NodesApi | undefined;
  get nodesApi(): NodesApi {
    if (!this._nodesApi) {
      this._nodesApi = new NodesApi(this.alfrescoApiService.getInstance());
    }
    return this._nodesApi;
  }

  private commentsService = inject<CommentsService>(ADF_COMMENTS_SERVICE);

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

  private nodeIdBelegsammlungDocumentLibrary : string | undefined;
  private async getContentNodeSelectorComponentDataBelegsammlung() : Promise<ContentNodeSelectorComponentData> {
    if (this.nodeIdBelegsammlungDocumentLibrary == null)
    {
      // /app:company_home/st:sites/cm:belegsammlung/cm:documentLibrary
      const node = await this.contentApiService.getNodeInfo('-root-',{relativePath : '/sites/belegsammlung/documentLibrary'}).toPromise();
      this.nodeIdBelegsammlungDocumentLibrary = node?.id;
    }
    const data: ContentNodeSelectorComponentData = {
      title: "Datei auswählen",
      dropdownHideMyFiles: true,
      selectionMode: 'multiple',
      currentFolderId: this.nodeIdBelegsammlungDocumentLibrary as string,
      select: new Subject<Node[]>(),
      isSelectionValid: (entry: Node) => {return entry.isFile},
    };

    return data;
  };

  getCurrentUserAuthLowerCase() : string
  {
    return this.authenticationService.getUsername().toLowerCase();
  }

  getCurrentUser() : Promise<PersonEntry>
  {
    return this.peopleContentService.peopleApi.getPerson('-me-');
  }
  getUserProfileImage(avatarId: string) : string
  {
    return this.contentService.getContentUrl(avatarId);
  }

  isSuperUser() : boolean {
    const userName = this.authenticationService.getUsername().toLowerCase();
    //console.log(userName);
    return (userName == 'admin' || userName == 'wolfgang moser');
  }

  isMRSigningUser() : boolean {
    const user = this.authenticationService.getUsername().toLowerCase();
    if (this.isSuperUser()) {
      return true;
    }
    if (user == "koberer") {
      return true;
    }
    return false;
  }

  isOrderPostUser() : boolean {
    const user = this.authenticationService.getEcmUsername().toLowerCase();
    if (this.isSuperUser()) {
      return true;
    }
    if (user == "skofitsch" ||
        user == "koberer" ||
        user == "pichlkastner" ||
        user == "vaschauner" ||
        user == "daniel" ||
        user == "koestenbaumer"
        )
    {
      return true;
    }
    return false;
  }

  isSettingsUser() : boolean {
    const user = this.authenticationService.getEcmUsername().toLowerCase();
    if (this.isSuperUser()) {
      return true;
    }
    if (user == "skofitsch" ||
        user == "koberer" ||
        user == "pichlkastner" ||
        user == "vaschauner" ||
        user == "daniel" ||
        user == "koestenbaumer"
        )
    {
      return true;
    }
    return false;
  }

  isTagManagerUser() : boolean {
    const user = this.authenticationService.getEcmUsername().toLowerCase();
    if (this.TAG_USER[user as keyof typeof this.TAG_USER])
      return true;
    return this.isSuperUser();
  }

  isFinishNowUser() : boolean {
    const user = this.authenticationService.getEcmUsername().toLowerCase();
    if (user == "freithofer") {
      return true;
    }
    return this.isSettingsUser();
  }

  //getTaskRootPath() : Promise<NodeEntry> {
  //  return this.nodesApiService.nodesApi.getNode('-root-', { includeSource: true, include: ['path'], relativePath: MRBauTask.TASK_RELATIVE_ROOT_PATH });
  //}

  getNode(nodeId:string, opts?:any) : Observable<NodeEntry> {
    return this.contentApiService.getNode(nodeId, opts);
  }

  getElevatedAuditorsObservable() : Observable<EcmUserModel[]> {
    const elevatedAuditors = ['egger', 'mosera', 'schwabp', 'wolfgang moser', 'strohmayer', 'janesch', 'scharner', 'rauter', 'kogler', 'mosermoessler'];
    return new Observable(observer => {
      this.peopleContentService.listPeople({skipCount : 0, maxItems : 999, sorting : { orderBy: "firstName", direction: "ASC"}}).subscribe(
        data => {
          const result = data.entries.filter(p => elevatedAuditors.includes(p.id.toLocaleLowerCase()));
          observer.next(result)
        },
        err  => observer.error(err),
        ()   => observer.complete(),
      );
    });
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
    return this.commentsService.get(nodeId);
  }

  addComment(nodeId: string, comment: string) : Promise<CommentModel | undefined>
  {
    if (!comment || !nodeId)
    {
      return Promise.resolve(undefined);
    }
    comment = comment.trim();
    if (comment.length == 0)
    {
      return Promise.resolve(undefined);
    }

    return this.commentsService.add(nodeId, comment).toPromise();
  }

  updateComment(nodeId: string, commentId: string, comment: string) : Promise<CommentEntry | null>
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

    return this.commentsApi.updateComment(nodeId, commentId, {"content": comment});
  }

  deleteComment(nodeId: string, commentId: string) : Promise<void>
  {
    return this.commentsApi.deleteComment(nodeId,commentId);
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
      (nodeBodyUpdate.properties as {[key:string]:string})["mrbt:assignedUserName"] = newUserId;
    }

    return this.nodesApi.updateNode(nodeId, nodeBodyUpdate);
  }

  updateTaskAssignNewUser(nodeId: string, newUserId: string) :  Promise<NodeEntry>
  {
    let nodeBodyUpdate : NodeBodyUpdate = {"properties": {"mrbt:assignedUserName": newUserId}};
    return this.nodesApi.updateNode(nodeId, nodeBodyUpdate);
  }

  updateTaskDescriptionAndCategory(nodeId: string, description : string, taskCategory : EMRBauTaskCategory) :  Promise<NodeEntry>
  {
    let nodeBodyUpdate : NodeBodyUpdate = {"properties": {"mrbt:description": description, "mrbt:category": ''+taskCategory}};
    return this.nodesApi.updateNode(nodeId, nodeBodyUpdate);
  }

  updateTaskDescription(nodeId: string, description : string) :  Promise<NodeEntry>
  {
    let nodeBodyUpdate : NodeBodyUpdate = {"properties": {"mrbt:description": description}};
    return this.nodesApi.updateNode(nodeId, nodeBodyUpdate);
  }

  updateTaskDueDate(nodeId: string, dueDate : Date) :  Promise<NodeEntry>
  {
    let nodeBodyUpdate : NodeBodyUpdate = {"properties": {"mrbt:dueDateValue": this.getFormDateValue(dueDate) as string}};
    return this.nodesApi.updateNode(nodeId, nodeBodyUpdate);
  }

  updateNode(nodeId: string, nodeBodyUpdate : NodeBodyUpdate, opts?: NodesIncludeQuery) :  Promise<NodeEntry>
  {
    return this.nodesApi.updateNode(nodeId, nodeBodyUpdate, opts);
  }

  deleteNode(nodeId: string, opts?: {permanent?: boolean;}): Promise<void>
  {
    return this.nodesApi.deleteNode(nodeId, opts);
  }

  getFormDateValue(date: Date) : string | undefined {
    if (date == null || date == undefined)
    {
      return undefined;
    }
    const result = this.datePipe.transform(date, 'yyyy-MM-dd')
    return (result ? result : undefined) ;
  }

  getNodeRefFromNodeId(nodeId : string) : string
  {

    return 'workspace://SpacesStore/'+nodeId;
  }

  queryNodes(searchRequest: SearchRequest) : Promise<ResultSetPaging | undefined>
  {
    return this.contentApiService.search(searchRequest).toPromise();
  }

  queryNodesObservable(searchRequest: SearchRequest) : Observable<ResultSetPaging>
  {
    return this.contentApiService.search(searchRequest);
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
    const bodyParams : any[] = [];
    const contentTypes = ['application/json'];
    const accepts = ['application/json'];
    return this.nodesApiService.nodesApi.apiClient.callApi("/nodes/{nodeId}/targets/{targetId}", "DELETE", pathParams, queryParams, headerParams, formParams, bodyParams, contentTypes, accepts)
  }

  async uploadNewVersionWithDialog(node: Node, file: File)
  {
    const payload = {detail: {files: [{file:file}],data:{node:{entry:node}}}};
    this.store.dispatch(new UploadFileVersionAction(new CustomEvent('upload-files', payload)));
  }

  discardDocument(nodeId : string) : Promise<NodeEntry>
  {
    const date = new Date();
    const nodeBodyUpdate : NodeBodyUpdate = {"properties": {"mrba:discardDate": this.getFormDateValue(date) as string}};
    return this.nodesApi.updateNode(nodeId, nodeBodyUpdate);
  }

  progressWithElevatedAuditorsConfirmDialog(assignedUserName : string) : Promise<string>
  {
    return this.doProgressWithNewUserConfirmDialog(assignedUserName, this.getElevatedAuditorsObservable());
  }

  progressWithNewUserConfirmDialog(assignedUserName : string) : Promise<string> {
    return this.doProgressWithNewUserConfirmDialog(assignedUserName, this.getPeopleObservable());
  }

  doProgressWithNewUserConfirmDialog(assignedUserName : string, optionsList: Observable<any>) : Promise<string>
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
                          options: optionsList,
                          valueProp: 'id',
                          labelProp: 'displayName',
                          required: true,
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
            .then(() => {
              return this.discardDocument(nodeId)
            })
            .then((result) =>
            {
              result;
              return resolve(true);
            })
            .catch(
              (error : Error) => {
                const msg : string = error?.message;
                if (msg && msg.indexOf('Discard date may not be changed') >= 0)
                {
                  // document is already discarded, return true
                  return resolve(true);
                }
                return reject(error);
              });
          }
          else {
            return resolve(false);
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
        if (formlyFieldConfig.props) {
          formlyFieldConfig.props.required = true;
        }
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

  patchFormFieldConfigArrayPristineUntouchedRecursive(formlyFieldConfigArray: FormlyFieldConfig[]) {
    for (let i=0; i<formlyFieldConfigArray.length; i++) {
      this.patchFormFieldConfigPristineUntouchedRecursive(formlyFieldConfigArray[i]);
    }
  }

  patchFormFieldConfigPristineUntouchedRecursive(formlyFieldConfig: FormlyFieldConfig) {
    let key = formlyFieldConfig.key as string;
    if (key)
    {
      formlyFieldConfig.formControl?.markAsPristine();
      formlyFieldConfig.formControl?.markAsUntouched();
    }
    if (formlyFieldConfig.fieldGroup)
    {
      formlyFieldConfig.fieldGroup.forEach( (fc) => this.patchFormFieldConfigPristineUntouchedRecursive(fc))
    }
  }


  addVendorWithConfirmDialogCache : any = {};
  addVendorWithConfirmDialog() : Promise<IVendor | null>
  {
    return new Promise((resolve, reject) =>
    {
      // dialog
      const dialogRef = this.dialog.open(MrbauConfirmTaskDialogComponent, {
        data: {
          dialogTitle: 'Neue Firma anlegen',
          dialogMsg: 'Neue Firma anlegen',
          dialogButtonOK: 'FIRMA ANLEGEN',
          callQueryData: false,
          fieldsMain: [
            {
              fieldGroupClassName: 'flex-container-min-width',
              fieldGroup: [
                {
                    fieldGroupClassName: 'flex-container-min-width',
                    fieldGroup: [
                      {
                        className: 'flex-4',
                        key: 'mrba_companyName',
                        type: 'input',
                        defaultValue: this.addVendorWithConfirmDialogCache['mrba_companyName'],
                        props: {
                          //appearance:"fill",
                          label: 'Firmenname',
                          description: 'Firmenname',
                          maxLength: CONST.MAX_LENGTH_DEFAULT,
                          required: true,
                        },
                      },
                    ]
                }, {
                    fieldGroupClassName: 'flex-container-min-width',
                    fieldGroup: [
                      {
                        className: 'flex-2',
                        key: 'mrba_companyStreet',
                        type: 'input',
                        defaultValue: this.addVendorWithConfirmDialogCache['mrba_companyStreet'],
                        props: {
                          //appearance:"fill",
                          label: 'Straße',
                          description: 'Straße',
                          maxLength: CONST.MAX_LENGTH_DEFAULT,
                          required: true,
                        },
                      }
                    ]
                  }, {
                    fieldGroupClassName: 'flex-container-min-width',
                    fieldGroup: [
                      {
                        className: 'flex-2',
                        key: 'mrba_companyZipCode',
                        type: 'input',
                        defaultValue: this.addVendorWithConfirmDialogCache['mrba_companyZipCode'],
                        props: {
                          //appearance:"fill",
                          label: 'PLZ',
                          description: 'PLZ',
                          maxLength: CONST.MAX_LENGTH_DEFAULT,
                          required: true,
                        },
                      },
                      {
                        className: 'flex-4',
                        key: 'mrba_companyCity',
                        type: 'input',
                        defaultValue: this.addVendorWithConfirmDialogCache['mrba_companyCity'],
                        props: {
                          //appearance:"fill",
                          label: 'Stadt',
                          description: 'Stadt',
                          maxLength: CONST.MAX_LENGTH_DEFAULT,
                          required: true,
                        },
                      }
                    ]
                  }, {
                    fieldGroupClassName: 'flex-container-min-width',
                    fieldGroup: [
                      {
                        className: 'flex-2',
                        key: 'mrba_companyVatID',
                        type: 'input',
                        defaultValue: this.addVendorWithConfirmDialogCache['mrba_companyVatID'],
                        props: {
                          //appearance:"fill",
                          label: 'VAT',
                          description: 'UID',
                          maxLength: CONST.MAX_LENGTH_DEFAULT,
                        },
                      },
                      {
                        className: 'flex-2',
                        key: 'mrba_companyEmail',
                        type: 'input',
                        defaultValue: this.addVendorWithConfirmDialogCache['mrba_companyEmail'],
                        props: {
                          //appearance:"fill",
                          label: 'Email',
                          description: 'Email',
                          maxLength: CONST.MAX_LENGTH_EMAIL,
                        },
                      },
                      {
                        className: 'flex-2',
                        key: 'mrba_companyPhone',
                        type: 'input',
                        defaultValue: this.addVendorWithConfirmDialogCache['mrba_companyPhone'],
                        props: {
                          //appearance:"fill",
                          label: 'Telefon',
                          description: 'Telefon',
                          maxLength: CONST.MAX_LENGTH_PHONE,
                          required: false,
                        },
                      },
                    ]
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
          //console.log(result);
          this.addVendorWithConfirmDialogCache = result;
          this.mrbauDbService.addVendor(result).toPromise()
          .then((res) => {
            if (res.result === 'OK') {
              resolve(res);
            }
            else {
              reject(res);
            }
          })
          .catch(error => {
            reject(error);
          })
        }
        else {
          resolve(null);
        }
      });
    }
  )
  }

  editVendorWithConfirmDialog() : Promise<IVendor | null>
  {
    return new Promise((resolve, reject) =>
    {
      // dialog
      const dialogRef = this.dialog.open(MrbauConfirmTaskDialogComponent, {
        data: {
          dialogTitle: 'Firma ändern',
          dialogMsg: 'Firma ändern',
          dialogButtonOK: 'FIRMA ÄNDERN',
          callQueryData: false,
          fieldsMain: [
            {
              fieldGroupClassName: 'flex-container-min-width',
              fieldGroup: [
              {
                fieldGroupClassName: 'flex-container-min-width',
                fieldGroup: [
                {
                  className: 'flex-4',
                  key: 'mrba:companyId',
                  type: 'mrbauFormlySelectSearchVendor',
                  props: {
                    //appearance:"fill",
                    label: 'Firma auswählen',
                    placeholder: 'Firma suchen z.B. %Elbe%',
                    change: (field: FormlyFieldConfig) => {
                      const mrba_company_fields = [
                        {id:'mrba_companyName', value:'mrba:companyName'},
                        {id:'mrba_companyVatID', value: 'mrba:companyVatID'},
                        {id:'mrba_companyStreet', value: 'mrba:companyStreet'},
                        {id:'mrba_companyZipCode', value:'mrba:companyZipCode'},
                        {id:'mrba_companyCity', value:'mrba:companyCity'},
                        {id:'mrba_companyCountryCode', value:'mrba:companyCountryCode'},
                        {id:'mrba_companyPhone', value:'mrba:companyPhone'},
                        {id:'mrba_companyEmail', value:'mrba:companyEmail'},
                      ];
                      if (field)
                      {
                        const vendor = field.model[field.key as string];
                        for (const element of mrba_company_fields)
                        {
                          const control = field.form?.get(element.id);
                          if (control)
                          {
                            control.setValue((vendor) ? vendor[element.value] : undefined);
                          }
                        }
                      }
                    }
                  },
                  hooks: {},
                  validators: { },},
                  ]
                },
                {
                    fieldGroupClassName: 'flex-container-min-width',
                    fieldGroup: [
                      {
                        className: 'flex-4',
                        key: 'mrba_companyName',
                        type: 'input',
                        //defaultValue: this.addVendorWithConfirmDialogCache['mrba_companyName'],
                        props: {
                          //appearance:"fill",
                          label: 'Firmenname',
                          description: 'Firmenname',
                          maxLength: CONST.MAX_LENGTH_DEFAULT,
                          required: true,
                        },
                      },
                    ]
                }, {
                    fieldGroupClassName: 'flex-container-min-width',
                    fieldGroup: [
                      {
                        className: 'flex-2',
                        key: 'mrba_companyStreet',
                        type: 'input',
                        //defaultValue: this.addVendorWithConfirmDialogCache['mrba_companyStreet'],
                        props: {
                          //appearance:"fill",
                          label: 'Straße',
                          description: 'Straße',
                          maxLength: CONST.MAX_LENGTH_DEFAULT,
                          required: true,
                        },
                      }
                    ]
                  }, {
                    fieldGroupClassName: 'flex-container-min-width',
                    fieldGroup: [
                      {
                        className: 'flex-2',
                        key: 'mrba_companyZipCode',
                        type: 'input',
                        //defaultValue: this.addVendorWithConfirmDialogCache['mrba_companyZipCode'],
                        props: {
                          //appearance:"fill",
                          label: 'PLZ',
                          description: 'PLZ',
                          maxLength: CONST.MAX_LENGTH_DEFAULT,
                          required: true,
                        },
                      },
                      {
                        className: 'flex-4',
                        key: 'mrba_companyCity',
                        type: 'input',
                        //defaultValue: this.addVendorWithConfirmDialogCache['mrba_companyCity'],
                        props: {
                          //appearance:"fill",
                          label: 'Stadt',
                          description: 'Stadt',
                          maxLength: CONST.MAX_LENGTH_DEFAULT,
                          required: true,
                        },
                      }
                    ]
                  }, {
                    fieldGroupClassName: 'flex-container-min-width',
                    fieldGroup: [
                      {
                        className: 'flex-2',
                        key: 'mrba_companyVatID',
                        type: 'input',
                        //defaultValue: this.addVendorWithConfirmDialogCache['mrba_companyVatID'],
                        props: {
                          //appearance:"fill",
                          label: 'VAT',
                          description: 'UID',
                          maxLength: CONST.MAX_LENGTH_DEFAULT,
                        },
                      },
                      {
                        className: 'flex-2',
                        key: 'mrba_companyEmail',
                        type: 'input',
                        //defaultValue: this.addVendorWithConfirmDialogCache['mrba_companyEmail'],
                        props: {
                          //appearance:"fill",
                          label: 'Email',
                          description: 'Email',
                          maxLength: CONST.MAX_LENGTH_EMAIL,
                        },
                      },
                      {
                        className: 'flex-2',
                        key: 'mrba_companyPhone',
                        type: 'input',
                        //defaultValue: this.addVendorWithConfirmDialogCache['mrba_companyPhone'],
                        props: {
                          //appearance:"fill",
                          label: 'Telefon',
                          description: 'Telefon',
                          maxLength: CONST.MAX_LENGTH_PHONE,
                          required: false,
                        },
                      },
                    ]
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
          result['mrba_companyId'] = result['mrba:companyId']['mrba:companyId'];
          delete(result['mrba:companyId']);
          //console.log(result);
          this.mrbauDbService.updateVendor(result).toPromise()
          .then((res) => {
            if (res.result === 'OK') {
              resolve(res);
            }
            else {
              reject(res);
            }
          })
          .catch(error => {
            reject(error);
          })
        }
        else {
          resolve(null);
        }
      });
    }
  )
  }

  addProjectWithConfirmDialogCache : any = {};
  addProjectWithConfirmDialog() : Promise<ICostCarrier | null>
  {
    return new Promise((resolve, reject) =>
    {
      // dialog
      const dialogRef = this.dialog.open(MrbauConfirmTaskDialogComponent, {
        data: {
          dialogTitle: 'Neues Projekt anlegen',
          dialogMsg: 'Neues Projekt anlegen',
          dialogButtonOK: 'KT/KS ANLEGEN',
          callQueryData: false,
          fieldsMain: [
            {
              fieldGroupClassName: 'flex-container-min-width',
              fieldGroup: [
                {
                    fieldGroupClassName: 'flex-container-min-width',
                    fieldGroup: [
                      {
                        className: 'flex-4',
                        key: 'mrba_costCarrierNumber',
                        type: 'input',
                        defaultValue: this.addProjectWithConfirmDialogCache['mrba_costCarrierNumber'],
                        props: {
                          //appearance:"fill",
                          label: 'Kostenträger/Kostenstelle Nummer',
                          description: 'Kostenträger/Kostenstelle Nummer',
                          maxLength: CONST.MAX_LENGTH_DEFAULT,
                          required: true,
                        },
                      },
                    ]
                },
                {
                  fieldGroupClassName: 'flex-container-min-width',
                  fieldGroup: [
                    {
                      className: 'flex-4',
                      key: 'mrba_projectName',
                      type: 'input',
                      defaultValue: this.addVendorWithConfirmDialogCache['mrba_projectName'],
                      props: {
                        //appearance:"fill",
                        label: 'Projekt Bezeichnung',
                        description: 'Projekt Bezeichnung',
                        maxLength: CONST.MAX_LENGTH_DEFAULT,
                        required: true,
                      },
                    }
                  ]
                },
                {
                  fieldGroupClassName: 'flex-container-min-width',
                  fieldGroup: [
                    {
                      className: 'flex-4',
                      key: 'auditor1',
                      type: 'select',
                      defaultValue: this.addVendorWithConfirmDialogCache['auditor1'],
                      props: {
                        //appearance:"fill",
                        label: 'Bauleiter',
                        description: 'Bauleiter',
                        options: this.getPeopleObservable(),
                        valueProp: 'id',
                        labelProp: 'displayName',
                        //required: true,
                      },
                    }
                  ]
                },
                {
                  fieldGroupClassName: 'flex-container-min-width',
                  fieldGroup: [
                    {
                      className: 'flex-4',
                      key: 'auditor2',
                      type: 'select',
                      defaultValue: this.addVendorWithConfirmDialogCache['auditor2'],
                      props: {
                        //appearance:"fill",
                        label: 'Oberbauleiter',
                        description: 'Oberbauleiter',
                        options: this.getPeopleObservable(),
                        valueProp: 'id',
                        labelProp: 'displayName',
                        //required: true,
                      },
                    }
                  ]
                },
                {
                  fieldGroupClassName: 'flex-container-min-width',
                  fieldGroup: [
                    {
                      className: 'flex-4',
                      key: 'accountant',
                      type: 'select',
                      defaultValue: this.addVendorWithConfirmDialogCache['accountant'],
                      props: {
                        //appearance:"fill",
                        label: 'Buchhaltung',
                        description: 'Buchhaltung',
                        options: this.getPeopleObservable(),
                        valueProp: 'id',
                        labelProp: 'displayName',
                        //required: true,
                      },
                    }
                  ]
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
          //console.log(result);
          this.addProjectWithConfirmDialogCache = result;
          this.mrbauDbService.addProject(result).toPromise()
          .then((res) => {
            if (res.result === 'OK') {
              resolve(res);
            }
            else {
              reject(res);
            }
          })
          .catch(error => {
            reject(error);
          })
        }
        else {
          resolve(null);
        }
      });
    }
  )
  }

  calcDeductionWithDialog(data:FormlyFieldConfig) {
    const dialogRef = this.dialog.open(MrbauCalcDeductionDialogComponent, {
      data: {
        payload : data,
    }});

    dialogRef.afterClosed().subscribe((result) => {
      // update properties in form
      if (result && typeof result === "object") {
        data.model['ignore:taskNode'] = result;
        const ctr = data.form?.controls;
        (data.form?.controls[ResultDetails.netAmountVerified.key as keyof typeof ctr] as any).setValue(result.properties[ResultDetails.netAmountVerified.key]);
        (data.form?.controls[ResultDetails.grossAmountVerified.key as keyof typeof ctr] as any).setValue(result.properties[ResultDetails.grossAmountVerified.key]);
      }
    })
  }

  editProjectWithConfirmDialog() : Promise<ICostCarrier | null>
  {
    return new Promise((resolve, reject) =>
    {
      // dialog
      const dialogRef = this.dialog.open(MrbauConfirmTaskDialogComponent, {
        data: {
          dialogTitle: 'Projekt ändern',
          dialogMsg: 'Projekt ändern',
          dialogButtonOK: 'KT/KS ÄNDERN',
          callQueryData: false,
          fieldsMain: [
            {
              fieldGroupClassName: 'flex-container-min-width',
              fieldGroup: [
                {
                  fieldGroupClassName: 'flex-container-min-width',
                  fieldGroup: [
                    {
                      className: 'flex-4',
                      key: 'mrba:costCarrierNumber',
                      type: 'mrbauFormlySelectSearchProject',
                      props: {
                        //appearance:"fill",
                        label: 'Kostenträger/-stelle',
                        placeholder: 'KT suchen z.B. %9000%',
                        change: (field: FormlyFieldConfig) => {
                          const mrba_company_fields = [
                            {id:'mrba_costCarrierNumber', value:'mrba:costCarrierNumber'},
                            {id:'mrba_projectName', value: 'mrba:projectName'},
                            {id:'auditor1', value: 'auditor1'},
                            {id:'auditor2', value:'auditor2'},
                            {id:'accountant', value:'accountant'},
                          ];
                          if (field)
                          {
                            const vendor = field.model[field.key as string];
                            for (const element of mrba_company_fields)
                            {
                              const control = field.form?.get(element.id);
                              if (control)
                              {
                                control.setValue((vendor) ? vendor[element.value] : undefined);
                              }
                            }
                          }
                        }
                      },
                      hooks: {},
                      validators: { },
                    },
                  ]
                },
                {
                    fieldGroupClassName: 'flex-container-min-width',
                    fieldGroup: [
                      {
                        className: 'flex-4',
                        key: 'mrba_costCarrierNumber',
                        type: 'input',
                        props: {
                          //appearance:"fill",
                          label: 'Kostenträger/Kostenstelle Nummer',
                          description: 'Kostenträger/Kostenstelle Nummer',
                          maxLength: CONST.MAX_LENGTH_DEFAULT,
                          required: true,
                        },
                      },
                    ]
                },
                {
                  fieldGroupClassName: 'flex-container-min-width',
                  fieldGroup: [
                    {
                      className: 'flex-4',
                      key: 'mrba_projectName',
                      type: 'input',
                      props: {
                        //appearance:"fill",
                        label: 'Projekt Bezeichnung',
                        description: 'Projekt Bezeichnung',
                        maxLength: CONST.MAX_LENGTH_DEFAULT,
                        required: true,
                      },
                    }
                  ]
                },
                {
                  fieldGroupClassName: 'flex-container-min-width',
                  fieldGroup: [
                    {
                      className: 'flex-4',
                      key: 'auditor1',
                      type: 'select',
                      props: {
                        //appearance:"fill",
                        label: 'Bauleiter',
                        description: 'Bauleiter',
                        options: this.getPeopleObservable(),
                        valueProp: 'id',
                        labelProp: 'displayName',
                        required: false,
                      },
                    },
                    {
                      className: 'flex-1',
                      key: 'ignore:mrbauResetAuditor1',
                      type: 'mrbauFormlyButton',
                      props: {
                        text: 'Reset',
                        btnType: 'default',
                        onClick: (field : any) => {field.form.get('auditor1')?.setValue(null);},
                      },
                    },
                  ]
                },
                {
                  fieldGroupClassName: 'flex-container-min-width',
                  fieldGroup: [
                    {
                      className: 'flex-4',
                      key: 'auditor2',
                      type: 'select',
                      props: {
                        //appearance:"fill",
                        label: 'Oberbauleiter',
                        description: 'Oberbauleiter',
                        options: this.getPeopleObservable(),
                        valueProp: 'id',
                        labelProp: 'displayName',
                        required: false,
                      }
                    },
                    {
                      className: 'flex-1',
                      key: 'ignore:mrbauResetAuditor2',
                      type: 'mrbauFormlyButton',
                      props: {
                        text: 'Reset',
                        btnType: 'default',
                        onClick: (field) => {field.form.get('auditor2')?.setValue(null);},
                      },
                    },
                  ]
                },
                {
                  fieldGroupClassName: 'flex-container-min-width',
                  fieldGroup: [
                    {
                      className: 'flex-4',
                      key: 'accountant',
                      type: 'select',
                      props: {
                        //appearance:"fill",
                        label: 'Buchhaltung',
                        description: 'Buchhaltung',
                        options: this.getPeopleObservable(),
                        valueProp: 'id',
                        labelProp: 'displayName',
                        required: false,
                      },
                    },
                    {
                      className: 'flex-1',
                      key: 'ignore:mrbauResetAccountant',
                      type: 'mrbauFormlyButton',
                      props: {
                        text: 'Reset',
                        btnType: 'default',
                        onClick: (field) => {field.form.get('accountant')?.setValue(null);},
                      },
                    },
                  ]
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
          result['mrba_projectId'] = result['mrba:costCarrierNumber']['mrba:projectId'];
          delete(result['mrba:costCarrierNumber']);
          //console.log(result);
          this.mrbauDbService.updateProject(result).toPromise()
          .then((res) => {
            if (res.result === 'OK') {
              resolve(res);
            }
            else {
              reject(res);
            }
          })
          .catch(error => {
            reject(error);
          })
        }
        else {
          resolve(null);
        }
      });
    }
  )
  }

  readonly DEFAULT_TAG_ERLEDIGT = 'Erledigt';
  readonly DEFAULT_TAG_ABFALLWIRTSCHAFT = 'Abfallwirtschaft';
  readonly DEFAULT_TAG_BAUHOF = 'Bauhof';
  readonly DEFAULT_TAG_WEITERVERRECHNUNG = 'Weiterverrechnung';
  readonly DEFAULT_TAG_WEITERVERRECHNUNG_DONE = 'Weiterverrechnung Erledigt';
  readonly DEFAULT_TAGS = [this.DEFAULT_TAG_ABFALLWIRTSCHAFT, this.DEFAULT_TAG_BAUHOF, this.DEFAULT_TAG_ERLEDIGT, this.DEFAULT_TAG_WEITERVERRECHNUNG, this.DEFAULT_TAG_WEITERVERRECHNUNG_DONE];
  readonly HIDDEN_TAGS = ['Covid','Oemag','Ökofit'];
  private readonly TAG_GROUP_BAUHOF = [this.DEFAULT_TAG_ERLEDIGT, this.DEFAULT_TAG_BAUHOF, this.DEFAULT_TAG_ABFALLWIRTSCHAFT];
  private readonly TAG_GROUP_WEITERVERRECHNUNG = [this.DEFAULT_TAG_WEITERVERRECHNUNG, this.DEFAULT_TAG_WEITERVERRECHNUNG_DONE];
  private readonly TAG_USER = {
    'admin' : this.DEFAULT_TAGS,
    'wolfgang moser' : this.DEFAULT_TAGS,
    'skofitsch' : this.DEFAULT_TAGS,

    //'koberer' : this.TAG_GROUP_BAUHOF,

    'freithofer' : this.TAG_GROUP_BAUHOF,
    'pichlkastner' : this.TAG_GROUP_BAUHOF,
    'vaschauner' : this.TAG_GROUP_BAUHOF,
    'daniel' : this.TAG_GROUP_BAUHOF,
    'koestenbaumer' : this.TAG_GROUP_BAUHOF,

    'egger' : this.TAG_GROUP_WEITERVERRECHNUNG,
    'strohmayer' : this.TAG_GROUP_WEITERVERRECHNUNG,
    'janesch' : this.TAG_GROUP_WEITERVERRECHNUNG,
    'scharner' : this.TAG_GROUP_WEITERVERRECHNUNG,
    'elf' : this.TAG_GROUP_WEITERVERRECHNUNG,
    'erlacher' : this.TAG_GROUP_WEITERVERRECHNUNG,
    'grillenberger' : this.TAG_GROUP_WEITERVERRECHNUNG,
    'prokshi' : this.TAG_GROUP_WEITERVERRECHNUNG,
    'salek' : this.TAG_GROUP_WEITERVERRECHNUNG,
    'candir' : this.TAG_GROUP_WEITERVERRECHNUNG,
    'altschach' : this.TAG_GROUP_WEITERVERRECHNUNG,
    'zima' : this.TAG_GROUP_WEITERVERRECHNUNG,

  }

  getMyTags() : string[] {
    const user = this.authenticationService.getEcmUsername().toLowerCase();
    return this.TAG_USER[user as keyof typeof this.TAG_USER];
  }
  getAllTheTags() {
    return this.tagService.getAllTheTags().toPromise();
  }
  getTagsByNodeIdObservable(nodeId: string) {
    return this.tagService.getTagsByNodeId(nodeId);
  }
  addTag(nodeId: string, tag :string) {
    return this.tagService.addTag(nodeId, tag).toPromise();
  }
  removeTag(nodeId: string, tag :string) {
    return this.tagService.removeTag(nodeId, tag).toPromise();
  }

  massReplaceUserTaskDialog() : Promise<string|null>
  {
    return new Promise((resolve, reject) =>
    {
      // dialog
      const dialogRef = this.dialog.open(MrbauConfirmTaskDialogComponent, {
        data: {
          dialogTitle: 'Mitarbeiter ersetzen',
          dialogMsg: 'Mitarbeiter für alle Aufgaben ersetzen',
          dialogButtonOK: 'MA ÄNDERN',
          callQueryData: false,
          fieldsMain: [
            {
              fieldGroupClassName: 'flex-container-min-width',
              fieldGroup: [
                {
                  className: 'flex-4',
                  key: 'userOld',
                  type: 'select',
                  props: {
                    label: 'Alter Mitarbeiter',
                    description: 'Alter Mitarbeiter',
                    options: this.getPeopleObservable(),
                    valueProp: 'id',
                    labelProp: 'displayName',
                    required: true,
                  }
                }
              ]
            },
            {
              fieldGroupClassName: 'flex-container-min-width',
              fieldGroup: [
                {
                  className: 'flex-4',
                  key: 'userNew',
                  type: 'select',
                  props: {
                    label: 'Neuer Mitarbeiter',
                    description: 'Neuer Mitarbeiter',
                    options: this.getPeopleObservable(),
                    valueProp: 'id',
                    labelProp: 'displayName',
                    required: true,
                  }
                }
              ]
            },
          ],
          payload: null
        }
      });

      dialogRef.afterClosed().subscribe(async (result) => {
        if (result)
        {
          try {
            const searchRequest : SearchRequest =  {
            query: {
              query:`SELECT * FROM mrbt:task A JOIN mrbt:taskCoreDetails B ON A.cmis:objectId = B.cmis:objectId `+
              `WHERE B.mrbt:status >= 0 AND B.mrbt:status < ${EMRBauTaskStatus.STATUS_NOTIFY_DONE} AND B.mrbt:status <> ${EMRBauTaskStatus.STATUS_PAUSED} `+
              `AND B.mrbt:category >= ${EMRBauTaskCategory.NewDocumentStart} AND B.mrbt:category <= ${EMRBauTaskCategory.NewDocumentLast} `+
              (`AND B.mrbt:assignedUserName = '${result.userOld}' `),
              language: 'cmis'
              },
              include: ['properties'],
              paging : {
                skipCount: 0,
                maxItems:  999
              }
            };
            const resultSetPaging = await this.searchService.searchByQueryBody(searchRequest).toPromise();
            if (resultSetPaging?.list?.entries) {
              for (let i=0; i<resultSetPaging.list.entries.length; i++) {
                const entry = resultSetPaging.list.entries[i].entry;
                console.log(entry);
                const nodeBodyUpdate : NodeBodyUpdate = {"properties": {"mrbt:assignedUserName": result.userNew}};
                await this.nodesApi.updateNode(entry.id, nodeBodyUpdate);
              }
              resolve('Successfully Updatet '+resultSetPaging.list.entries.length+ ' tasks');
            }
            else {
              reject('resultSetPaging is undefined')
            }
          } catch(error) {
            reject(error);
          }
        }
        else {
          resolve(null);
        }
      });
    })
  }

  massReplaceUserProjectDialog() : Promise<string | null>
  {
    return new Promise((resolve, reject) =>
    {
      // dialog
      const dialogRef = this.dialog.open(MrbauConfirmTaskDialogComponent, {
        data: {
          dialogTitle: 'Mitarbeiter ersetzen',
          dialogMsg: 'Mitarbeiter für alle Projekte ersetzen',
          dialogButtonOK: 'MA ÄNDERN',
          callQueryData: false,
          fieldsMain: [
            {
              fieldGroupClassName: 'flex-container-min-width',
              fieldGroup: [
                {
                  className: 'flex-4',
                  key: 'role',
                  type: 'select',
                  props: {
                    label: 'Rolle',
                    description: 'Rolle',
                    options: [{value:'auditor1', label:'Bauleiter'}, {value:'auditor2', label:'Oberbauleiter'}, {value:'accountant', label:'Buchhaltung'}],
                    required: true,
                  }
                }
              ]
            },
            {
              fieldGroupClassName: 'flex-container-min-width',
              fieldGroup: [
                {
                  className: 'flex-4',
                  key: 'userOld',
                  type: 'select',
                  props: {
                    label: 'Alter Mitarbeiter',
                    description: 'Alter Mitarbeiter',
                    options: this.getPeopleObservable(),
                    valueProp: 'id',
                    labelProp: 'displayName',
                    required: true,
                  }
                }
              ]
            },
            {
              fieldGroupClassName: 'flex-container-min-width',
              fieldGroup: [
                {
                  className: 'flex-4',
                  key: 'userNew',
                  type: 'select',
                  props: {
                    label: 'Neuer Mitarbeiter',
                    description: 'Neuer Mitarbeiter',
                    options: this.getPeopleObservable(),
                    valueProp: 'id',
                    labelProp: 'displayName',
                    required: true,
                  }
                }
              ]
            },
          ],
          payload: null
        }
      });

      dialogRef.afterClosed().subscribe((result) => {
      if (result)
      {
        this.mrbauDbService.getProjects().toPromise()
        .then(async (projects) => {
          let counter = 0;
          if (!projects)
          {
            reject('Projects is null')
            return;
          }
          try {
            for (let i = 0; i< projects.length; i++) {
              const prj = projects[i] as ICostCarrier;
              const role = result.role as keyof ICostCarrier;
              if (prj[role] == result.userOld) {
                let val : IMrbauDbService_mrba_project= {
                  mrba_projectId : +prj['mrba:projectId' as keyof ICostCarrier],
                  mrba_costCarrierNumber: prj['mrba:costCarrierNumber'],
                  mrba_projectName: prj['mrba:projectName'],
                  auditor1: prj['auditor1'],
                  auditor2: prj['auditor2'],
                  accountant: prj['accountant'],
                }
                val[role as keyof IMrbauDbService_mrba_project] = result.userNew as never;
                await this.mrbauDbService.updateProject(val).toPromise();
                counter++;
              }
            }
            resolve('Successfully Updatet '+counter+ ' projects');
          }
          catch(error) {
            reject(error);
          }
        })
        .catch(error => {
          reject(error);
        })
      }
      else {
        resolve(null);
      }
      });
    })
  }

async exportOpenDocumentTasks(includeDocData = true) {
    const searchRequest : SearchRequest = {
      query: {
        query:`SELECT * FROM mrbt:task A JOIN mrbt:taskCoreDetails B ON A.cmis:objectId = B.cmis:objectId `+
        `WHERE B.mrbt:status >= 0 AND B.mrbt:status < ${EMRBauTaskStatus.STATUS_NOTIFY_DONE} AND B.mrbt:status <> ${EMRBauTaskStatus.STATUS_PAUSED} `+
        `AND B.mrbt:category >= ${EMRBauTaskCategory.NewDocumentStart} AND B.mrbt:category <= ${EMRBauTaskCategory.NewDocumentLast} ORDER BY B.cmis:creationDate DESC`,
        language: 'cmis'
      },
      include: ['properties']
    };
    searchRequest.paging = {
      skipCount: 0,
      maxItems: 999,
    }

    try {
      const nodePaging = await this.searchService.searchByQueryBody(searchRequest).toPromise();
      const entries = nodePaging!.list!.entries;
      const labels : string[] = ['AufgabeId','Aufgabe', 'StatusId', 'Status', 'Firma', 'KT/KS', 'Zugewiesen', 'DokumentId', 'DokumentName', 'erzeugt', 'zu erledigen bis'];
      const data : any[] = [];
      for (let i=0; i< entries!.length; i++)
      {
        const nodeEntry = entries![i];
        let task = new MRBauTask();
        task.updateWithNodeData(nodeEntry.entry as Node);
        const row = [task.id, task.desc, task.status, task.getStateLabel(), task.companyName, task.costCarrierNumber, task.assignedUserName, task.associatedDocumentRef[0], task.associatedDocumentName[0],this.datePipe.transform(new Date(task.createdDate!),'yyyy-MM-dd'), this.datePipe.transform(new Date(task.dueDateValue!),'yyyy-MM-dd')];
        data.push(row);
      };

      if (includeDocData === true)
      {
        labels.push('Brutto');
        labels.push('Brutto gpr.');
        for (let i=0; i<data.length; i++) {
          const row = data[i];
          if (row[1] == 'Dokument - Rechnung') {
            const node = await this.getNode(row[7], {include: CONST.GET_NODE_DEFAULT_INCLUDE}).toPromise();
            //console.log(node.entry.properties);
            row.push(this.decimalPipe.transform((node?.entry.properties['mrba:grossAmountCents'] || 0) / 100, '1.2-2' , 'de')!.replace('.',''));
            row.push(this.decimalPipe.transform((node?.entry.properties['mrba:grossAmountVerifiedCents'] || 0) / 100, '1.2-2' , 'de')!.replace('.',''));
          }
          else {
            row.push('-');
            row.push('-');
          }
        }
      }

      this.mrbauExportService.downloadData(labels, data, 'Offene Dokumente');
    }
    catch(error) {
      console.log(error);
    }
  }

  replaceCompanyInfoByName(data : IMrbauReplaceCompanyInfoData[])
  {
    const field = data[0].key;
    const oldName = data[0].old;
    let searchRequest : SearchRequest = {
      query: {
        query: 'TYPE:"cm:content"',
        language: 'afts'
      },
      filterQueries: [
        //{ query: '=SITE:belegsammlung'}, // NOT SUPPORTED WITH TMDQ
        { query: `=${field}:"${oldName}"`},
        // temporary ignore organisation unit { query: `=mrba:organisationUnit:"${node.properties['mrba:organisationUnit']}"`},
        { query: '!ASPECT:"mrba:discardedDocument"'}, // ignore discarded documents
      ],
      fields: [
        // ATTENTION make sure to request all mandatory fields for Node (vs ResultNode!)
        'id', 'name', 'nodeType', 'isFolder', 'isFile', 'modifiedAt', 'modifiedByUser', 'createdAt', 'createdByUser',
      ],
      include: ['properties', 'path', 'allowableOperations'],
      sort: [
        {
          type: 'FIELD',
          field: 'TYPE',
          ascending: false
        },
        {
          type: 'FIELD',
          field: 'cm:name',
          ascending: true
        }
      ]
    };

    this.searchService.searchByQueryBody(searchRequest).toPromise()
    .then(async (nodePaging) => {
      //console.log('found: '+nodePaging?.list?.entries?.length);
      let nodeBodyUpdate : NodeBodyUpdate = {};
      nodeBodyUpdate.properties = {}
      for (let i=0; i< data.length; i++) {
        nodeBodyUpdate.properties[data[i].key] = data[i].new;
      }
      //console.log(nodeBodyUpdate);
      if (nodePaging?.list?.entries) {
        for (let i=0; i<nodePaging.list.entries.length;i++) {
          let nodeEntry = nodePaging.list.entries[i];
          //console.log(nodeEntry.entry.id+' '+nodeEntry.entry.properties[field]);
          await this.nodesApi.updateNode(nodeEntry.entry.id, nodeBodyUpdate);
        }
      };
    })
    .catch((error) => {
      console.log(error);
    });
  }

}
