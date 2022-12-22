import { AlfrescoApiService, NotificationService } from '@alfresco/adf-core';
import { SelectionState } from '@alfresco/adf-extensions';
import { ActionsApi, WebscriptApi } from '@alfresco/js-api';
import { Injectable } from '@angular/core';
import { MrbauCommonService } from './mrbau-common.service';

@Injectable({
  providedIn: 'root'
})
export class MrbauActionService {
  public static readonly START_OCR_ACTION_ID: string = "embed-metadata";
  public static readonly MBR_USE_AS_NEW_VERSION_ID: string = "mbr-use-as-new-version";
  public static readonly MBR_RESET_ARCHIVE_TYPE_ID: string = "mbr-reset-archive-type";

  constructor(
    private alfrescoApiService : AlfrescoApiService,
    private mrbauCommonService : MrbauCommonService,
    private notificationService : NotificationService,
  ) {
  }

  private _actionsApi: ActionsApi;
  get actionsApi(): ActionsApi {
    this._actionsApi = this._actionsApi ?? new ActionsApi(this.alfrescoApiService.getInstance());
    return this._actionsApi;
  }

  private _webscriptApi: WebscriptApi;
  get webscriptApi(): WebscriptApi {
      this._webscriptApi = this._webscriptApi ?? new WebscriptApi(this.alfrescoApiService.getInstance());
      return this._webscriptApi;
  }

  startOcrTransform(data : any) {
    if (!data || !data.payload)
    {
      return;
    }
    const selection = data.payload as SelectionState;
    selection.nodes.forEach(node => {
      this.actionsApi.actionExec({actionDefinitionId: MrbauActionService.START_OCR_ACTION_ID, targetId: node.entry.id, params: {}})
      .then( () => {
        this.notificationService.showInfo('OCR wurde erfolgreich gestartet ...');
      })
      .catch(error => {
        this.notificationService.showError('OCR Fehler: '+error);
      });
    });
  }

  startOcrTransformById(id : string) {
    this.actionsApi.actionExec({actionDefinitionId: MrbauActionService.START_OCR_ACTION_ID, targetId: id, params: {}})
    .then( () => {
      this.notificationService.showInfo('OCR wurde erfolgreich gestartet ...');
    })
    .catch(error => {
      this.notificationService.showError('OCR Fehler: '+error);
    });
  }

  getFormDefinitionForAction(item_id:string) :Promise <any> {
    // Get Parameters with formprocessor
    // https://github.com/Alfresco/alfresco-community-repo/blob/master/remote-api/src/main/resources/alfresco/templates/webscripts/org/alfresco/repository/forms/formdefinition.post.desc.xml
    return this.webscriptApi.executeWebScript('POST', 'api/formdefinitions',null, null, null, {'itemKind' : 'action','itemId' : item_id });
  }

  mrbauUseAsNewVersionGetFormDefinition() :Promise <any> {
    return this.getFormDefinitionForAction(MrbauActionService.MBR_USE_AS_NEW_VERSION_ID);
  }

  mrbauUseAsNewVersionWebScript(documentNodeId : string, newVersionNodeId : string, comment : string) : Promise<any>
  {
    const item_kind = 'action';
    const item_id = MrbauActionService.MBR_USE_AS_NEW_VERSION_ID;
    const postBody = {
      prop_targetDocument: this.mrbauCommonService.getNodeRefFromNodeId(newVersionNodeId),
      prop_copyMetadata: false,
      ​​​​​​​​​prop_versionType: 'MINOR', // 'MAJOR',
      prop_versionComment: comment,
      alf_destination: this.mrbauCommonService.getNodeRefFromNodeId(documentNodeId),
    }

    // Execute Formaction with formprocessor
    // https://github.com/Alfresco/alfresco-community-repo/blob/master/remote-api/src/main/resources/alfresco/templates/webscripts/org/alfresco/repository/forms/form.post.desc.xml
    let pathParams = {};
    let headerParams = {};
    let formParams = {};
    let scriptArgs = {};
    return this.actionsApi.apiClient.callApi(`/service/api/${item_kind}/${item_id}/formprocessor`, 'POST', pathParams, scriptArgs, headerParams, formParams, postBody, ['application/json'], ['application/json'], null, 'alfresco');
    //return this.webscriptApi.executeWebScript('POST', `/api/${item_kind}/${item_id}/formprocessor`, scriptArgs, null, null, postBody);
  }

  // called from Effects Action Service
  mrbauUseAsNewVersion(data : any) {
    if (!data || !data.payload)
    {
      return;
    }
    console.log(data);
    this.notificationService.showError('TODO Implement');
  }

  mrbauResetArchiveTypeGetFormDefinition() :Promise <any> {
    return this.getFormDefinitionForAction(MrbauActionService.MBR_RESET_ARCHIVE_TYPE_ID);
  }

  mrbauResetArchiveTypeWebscript(nodeId : string, newType : string) : Promise<any>
  {
    const item_kind = 'action';
    const item_id = MrbauActionService.MBR_RESET_ARCHIVE_TYPE_ID;
    const postBody = {
      prop_newType: newType,
      alf_destination: this.mrbauCommonService.getNodeRefFromNodeId(nodeId),
    }
    // Execute Formaction with formprocessor
    // https://github.com/Alfresco/alfresco-community-repo/blob/master/remote-api/src/main/resources/alfresco/templates/webscripts/org/alfresco/repository/forms/form.post.desc.xml
    let pathParams = {};
    let headerParams = {};
    let formParams = {};
    let scriptArgs = {};
    return this.actionsApi.apiClient.callApi(`/service/api/${item_kind}/${item_id}/formprocessor`, 'POST', pathParams, scriptArgs, headerParams, formParams, postBody, ['application/json'], ['application/json'], null, 'alfresco');
    //return this.webscriptApi.executeWebScript('POST', `/api/action/${item_id}/formprocessor`, null, null, null, postBody);
  }

  // called from Effects Action Service
  mrbauResetArchiveType(data : any) {
    if (!data || !data.payload)
    {
      return;
    }
    console.log(data);
    this.notificationService.showError('TODO Implement');
  }
}
