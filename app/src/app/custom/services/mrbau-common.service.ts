import { Injectable } from '@angular/core';
import { PeopleContentQueryResponse, PeopleContentService } from '@alfresco/adf-core';
import { NodesApiService } from '@alfresco/adf-core';
import { MRBauTask } from '../mrbau-task-declarations';
import { NodeEntry, PersonEntry } from '@alfresco/js-api';

@Injectable({
  providedIn: 'root'
})
export class MrbauCommonService {
  // TODO implement caching

  constructor(    private nodesApiService : NodesApiService,
    private peopleContentService: PeopleContentService,) { }

  getCurrentUser() : Promise<PersonEntry>
  {
    return this.peopleContentService.peopleApi.getPerson('-me-');
  }

  getTaskRootPath() : Promise<NodeEntry> {
    return this.nodesApiService.nodesApi.getNode('-root-', { includeSource: true, include: ['path'], relativePath: MRBauTask.TASK_RELATIVE_ROOT_PATH });
  }

  getPeople() : Promise<PeopleContentQueryResponse> {
    return this.peopleContentService.listPeople({skipCount : 0, maxItems : 999, sorting : { orderBy: "id", direction: "ASC"}}).toPromise()
  }
}
