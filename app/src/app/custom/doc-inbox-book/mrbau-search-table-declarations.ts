import { SearchCategory } from '@alfresco/adf-content-services';
import { QueryBody, RequestFacetFields, RequestFacetQueries, RequestFilterQueries, RequestSortDefinition, ResultSetPaging } from '@alfresco/js-api';
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

  title : string;
  categories: SearchCategory[];
  queryFragments: { [id: string]: string };

  get userQuery() :string;
  set userQuery(value: string);

  include:string[];
  sort:RequestSortDefinition;
  paging: { maxItems?: number; skipCount?: number };

  filterQueries:RequestFilterQueries;
  facetFields:RequestFacetFields;
  facetQueries:RequestFacetQueries;
  execute();
}
