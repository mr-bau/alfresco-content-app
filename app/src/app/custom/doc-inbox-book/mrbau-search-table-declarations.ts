import { SearchConfiguration } from '@alfresco/adf-content-services';
import { QueryBody,  RequestSortDefinition, ResultSetPaging } from '@alfresco/js-api';
import { Subject } from 'rxjs';

export interface IMrbauSearchComponent {
  queryBuilder: IMrbauSearchQueryBuilder;

}

export interface IMrbauSearchQueryBuilder {
  /*  Stream that emits the query before search whenever user search  */
  updated:Subject<QueryBody>;
  /*  Stream that emits the results whenever user search  */
  executed:Subject<ResultSetPaging>;
  /*  Stream that emits the error whenever user search  */
  error:Subject<unknown>;

  queryFragments: { [id: string]: string };

  get userQuery() :string;
  set userQuery(value: string);

  sort:RequestSortDefinition;
  paging: { maxItems?: number; skipCount?: number };
  config:SearchConfiguration;

  updateConfig(config: SearchConfiguration);
  execute();
}
