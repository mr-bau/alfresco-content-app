import { AlfrescoApiService, NotificationService } from '@alfresco/adf-core';
import { SelectionState } from '@alfresco/adf-extensions';
import { ActionsApi } from '@alfresco/js-api';
import { Injectable } from '@angular/core';
import { CONST } from '../mrbau-global-declarations';

@Injectable({
  providedIn: 'root'
})
export class MrbauActionService {

  constructor(
    private alfrescoApiService : AlfrescoApiService,
    private notificationService : NotificationService,
  ) { }

  private _actionsApi: ActionsApi;
  get actionsApi(): ActionsApi {
    this._actionsApi = this._actionsApi ?? new ActionsApi(this.alfrescoApiService.getInstance());
    return this._actionsApi;
  }

  startOcrTransform(data : any) {
    if (!data || !data.payload)
    {
      return;
    }
    const selection = data.payload as SelectionState;
    selection.nodes.forEach(node => {
      this.actionsApi.actionExec({actionDefinitionId: CONST.START_OCR_ACTION_Id, targetId: node.entry.id, params: {}})
      .then( () => {
        this.notificationService.showInfo('OCR wurde erfolgreich gestartet ...');
      })
      .catch(error => {
        this.notificationService.showError('OCR Fehler: '+error);
      });
    });
  }

  startOcrTransformById(id : string) {
    this.actionsApi.actionExec({actionDefinitionId: CONST.START_OCR_ACTION_Id, targetId: id, params: {}})
    .then( () => {
      this.notificationService.showInfo('OCR wurde erfolgreich gestartet ...');
    })
    .catch(error => {
      this.notificationService.showError('OCR Fehler: '+error);
    });
  }
}
