import { Injectable } from '@angular/core';
import { CommentContentService, CommentModel, EcmUserModel, PeopleContentService, ContentService, NotificationService, AlfrescoApiService } from '@alfresco/adf-core';
import { ActionsApi, MinimalNodeEntity, PersonEntry } from '@alfresco/js-api';
import { Observable } from 'rxjs';
import { MRBauTask } from '../mrbau-task-declarations';
import { DatePipe } from '@angular/common';
import { SelectionState } from '@alfresco/adf-extensions/public-api';
import { CONST } from '../mrbau-global-declarations';

@Injectable({
  providedIn: 'root'
})
export class MrbauCommonService {
  // TODO implement caching
  constructor(
    private peopleContentService: PeopleContentService,
    private commentContentService: CommentContentService,
    private contentService: ContentService,
    private datePipe : DatePipe,
    private notificationService : NotificationService,
    private alfrescoApiService : AlfrescoApiService,
    ) {
    }

  private _actionsApi: ActionsApi;
  get actionsApi(): ActionsApi {
    this._actionsApi = this._actionsApi ?? new ActionsApi(this.alfrescoApiService.getInstance());
    return this._actionsApi;
  }

  getCurrentUser() : Promise<PersonEntry>
  {
    return this.peopleContentService.peopleApi.getPerson('-me-');
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

  addComment(task: MRBauTask, comment: string) : Observable<CommentModel>
  {
    if (!comment)
    {
      return null;
    }
    comment = comment.trim();
    if (comment.length == 0)
    {
      return null;
    }
    return this.commentContentService.addNodeComment(task.id, comment);
  }

  getFormDateValue(date: Date) : string {
    return this.datePipe.transform(date, 'yyyy-MM-dd');
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


}
