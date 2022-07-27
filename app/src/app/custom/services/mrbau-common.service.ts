import { Injectable } from '@angular/core';
import { CommentContentService, CommentModel, EcmUserModel, PeopleContentService } from '@alfresco/adf-core';
import {  PersonEntry } from '@alfresco/js-api';
import { Observable } from 'rxjs';
import {  MRBauTask } from '../mrbau-task-declarations';

@Injectable({
  providedIn: 'root'
})
export class MrbauCommonService {
  // TODO implement caching

  constructor(
    private peopleContentService: PeopleContentService,
    private commentContentService: CommentContentService,
    ) { }

  getCurrentUser() : Promise<PersonEntry>
  {
    return this.peopleContentService.peopleApi.getPerson('-me-');
  }

  //getTaskRootPath() : Promise<NodeEntry> {
  //  return this.nodesApiService.nodesApi.getNode('-root-', { includeSource: true, include: ['path'], relativePath: MRBauTask.TASK_RELATIVE_ROOT_PATH });
  //}

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

}
