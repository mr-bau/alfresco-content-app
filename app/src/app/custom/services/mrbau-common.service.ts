import { Injectable } from '@angular/core';
import { CommentContentService, CommentModel, EcmUserModel, PeopleContentService, ContentService, NotificationService, AuthenticationService, NodesApiService, SearchService,  } from '@alfresco/adf-core';
import { MinimalNodeEntity, NodeBodyUpdate, NodeEntry, PersonEntry, Node, SearchRequest, ResultSetPaging, CommentEntry, NodePaging } from '@alfresco/js-api';
import { Observable, Subject } from 'rxjs';
import { EMRBauTaskCategory, EMRBauTaskStatus, MRBauTask } from '../mrbau-task-declarations';
import { DatePipe } from '@angular/common';
import { CONST } from '../mrbau-global-declarations';
import { ContentNodeSelectorComponent, ContentNodeSelectorComponentData } from '@alfresco/adf-content-services';
import { MatDialog } from '@angular/material/dialog';
import { ContentApiService } from '../../../../../projects/aca-shared/src/public-api';
import { MrbauConfirmTaskDialogComponent } from '../dialogs/mrbau-confirm-task-dialog/mrbau-confirm-task-dialog.component';
import { ContentManagementService } from '../../services/content-management.service';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { ICostCarrier, IVendor } from './mrbau-conventions.service';
import { MrbauDbService } from './mrbau-db.service';
import { MrbauExportService } from './mrbau-export.service';

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
    private mrbauDbService: MrbauDbService,
    private searchService : SearchService,
    private mrbauExportService : MrbauExportService,
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

  isSuperUser() : boolean {
    const userName = this.authenticationService.getEcmUsername().toLowerCase();
    return (userName == 'admin' || userName == 'wolfgang moser');
  }

  //getTaskRootPath() : Promise<NodeEntry> {
  //  return this.nodesApiService.nodesApi.getNode('-root-', { includeSource: true, include: ['path'], relativePath: MRBauTask.TASK_RELATIVE_ROOT_PATH });
  //}

  getNode(nodeId:string, opts?:any) : Observable<MinimalNodeEntity> {
    return this.contentService.getNode(nodeId, opts);
  }

  getElevatedAuditorsObservable() : Observable<EcmUserModel[]> {
    //const elevatedAuditors = ['egger', 'epluch', 'mosera', 'SchwabP', 'Wolfgang Moser'];
    const elevatedAuditors = ['egger', 'epluch', 'SchwabP', 'Wolfgang Moser'];
    return new Observable(observer => {
      this.peopleContentService.listPeople({skipCount : 0, maxItems : 999, sorting : { orderBy: "firstName", direction: "ASC"}}).subscribe(
        data => {
          const result = data.entries.filter(p => elevatedAuditors.includes(p.id));
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
    if (date == null || date == undefined)
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

  addVendorWithConfirmDialogCache= {};
  addVendorWithConfirmDialog() : Promise<IVendor>
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

  editVendorWithConfirmDialog() : Promise<IVendor>
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
                          const control = field.form.get(element.id);
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

  addProjectWithConfirmDialogCache= {};
  addProjectWithConfirmDialog() : Promise<ICostCarrier>
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

  editProjectWithConfirmDialog() : Promise<ICostCarrier>
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
                              const control = field.form.get(element.id);
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
                        onClick: (field) => {field.form.get('auditor1')?.setValue(null);},
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

  massReplaceUserProjectDialog() : Promise<string>
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
          try {
            for (let i = 0; i< projects.length; i++) {
              const prj = projects[i] as ICostCarrier;
              const role = result.role;
              if (prj[role] == result.userOld) {
                let val = {
                  mrba_projectId : prj['mrba:projectId'],
                  mrba_costCarrierNumber: prj['mrba:costCarrierNumber'],
                  mrba_projectName: prj['mrba:projectName'],
                  auditor1: prj['auditor1'],
                  auditor2: prj['auditor2'],
                  accountant: prj['accountant'],
                }
                val[role] = result.userNew;
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

  exportOpenDocumentTasks() {
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

      this.searchService.searchByQueryBody(searchRequest).toPromise()
      .then((nodePaging : NodePaging) => {
        nodePaging;
        const labels : string[] = ['AufgabeId','Aufgabe', 'StatusId', 'Status', 'Firma', 'KT/KS', 'Zugewiesen', 'DokumentId', 'DokumentName', 'erzeugt', 'zu erledigen bis'];
        const data : any[] = [];
        for (var nodeEntry of nodePaging.list.entries) {
          let task = new MRBauTask();
          task.updateWithNodeData(nodeEntry.entry);
          const row = [task.id, task.desc, task.status, task.getStateLabel(), task.companyName, task.costCarrierNumber, task.assignedUserName, task.associatedDocumentRef[0], task.associatedDocumentName[0],this.datePipe.transform(new Date(task.createdDate),'yyyy-MM-dd'), this.datePipe.transform(new Date(task.dueDateValue),'yyyy-MM-dd')];
          data.push(row);
        };
        this.mrbauExportService.downloadData(labels, data, 'Offene Dokumente');
      })
      .catch((error) => {
        console.log(error);
      });
    }
}
