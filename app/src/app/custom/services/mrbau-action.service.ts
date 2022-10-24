import { AlfrescoApiService, NotificationService } from '@alfresco/adf-core';
import { SelectionState } from '@alfresco/adf-extensions';
import { ActionBodyExec, ActionExecResultEntry, ActionsApi, WebscriptApi } from '@alfresco/js-api';
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
    documentNodeId; // TODO
    const item_kind = 'action';
    const item_id = MrbauActionService.MBR_USE_AS_NEW_VERSION_ID;
    const postBody = {
      targetDocument: this.mrbauCommonService.getNodeRefFromNodeId(newVersionNodeId),
      copyMetadata: false,
      ​​​​​​​​​versionType: 'MINOR', // 'MAJOR',
      versionComment: comment,
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

  mrbauUseAsNewVersionActionApi(documentNodeId : string, newVersionNodeId : string, comment : string) : Promise<ActionExecResultEntry>
  {
    this.mrbauUseAsNewVersionGetFormDefinition().then(result => console.log(result));
    const actionBody : ActionBodyExec = {
      actionDefinitionId : MrbauActionService.MBR_USE_AS_NEW_VERSION_ID,
      targetId : documentNodeId,
      params: {
        targetDocument: this.mrbauCommonService.getNodeRefFromNodeId(newVersionNodeId),
        copyMetadata: false,
        ​​​​​​​​​versionType: 'MINOR', // 'MAJOR',
        versionComment: comment,
      }
    };
    return this.actionsApi.actionExec(actionBody)
  }

  mrbauUseAsNewVersion(data : any) {
    if (!data || !data.payload)
    {
      return;
    }
    console.log(data);
    this.actionsApi.actionDetails(MrbauActionService.MBR_USE_AS_NEW_VERSION_ID)
    .then((result) => {
        console.log(result);
      })
      .catch(error => console.log(error));
    this.notificationService.showError('TODO Implement');
  }


  mrbauResetArchiveTypeGetFormDefinition() :Promise <any> {
    return this.getFormDefinitionForAction(MrbauActionService.MBR_RESET_ARCHIVE_TYPE_ID);
  }

  mrbauResetArchiveTypeWebscript(nodeId : string, newType : string) : Promise<any>
  {
    nodeId; // TODO
    const item_id = MrbauActionService.MBR_USE_AS_NEW_VERSION_ID;
    const params = {
      newType: newType,
      executeAsynchronously: false,
    }

    // Execute Formaction with formprocessor
    // https://github.com/Alfresco/alfresco-community-repo/blob/master/remote-api/src/main/resources/alfresco/templates/webscripts/org/alfresco/repository/forms/form.post.desc.xml
    return this.webscriptApi.executeWebScript('POST', `/api/action/${item_id}/formprocessor`, null, null, null, params)
  }

  mrbauResetArchiveTypeActionApi(nodeId : string, newType : string) : Promise<ActionExecResultEntry>
  {
    const actionBody : ActionBodyExec = {
      actionDefinitionId : MrbauActionService.MBR_RESET_ARCHIVE_TYPE_ID,
      targetId : nodeId,
      params: {
        newType: newType,
        executeAsynchronously: false,
      }
    };
    return this.actionsApi.actionExec(actionBody)
  }

  mrbauResetArchiveType(data : any) {
    if (!data || !data.payload)
    {
      return;
    }
    console.log(data);
    this.actionsApi.actionDetails(MrbauActionService.MBR_RESET_ARCHIVE_TYPE_ID)
    .then((result) => {
        console.log(result);
      })
      .catch(error => console.log(error));
    this.notificationService.showError('TODO Implement');
  }

}
