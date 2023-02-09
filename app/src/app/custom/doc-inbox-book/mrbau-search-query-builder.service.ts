import { Injectable } from '@angular/core';
import { AlfrescoApiService, AppConfigService } from '@alfresco/adf-core';
import jsonSearch from './dock-inbox-book-search-test.json';
import { Subject } from 'rxjs';
import { QueryBody, RequestFacetFields, RequestFacetQueries, RequestFilterQueries, RequestSortDefinition, ResultSetPaging, SearchApi } from '@alfresco/js-api';
import { SearchCategory } from '@alfresco/adf-content-services';
import { IMrbauSearchQueryBuilder } from './mrbau-search-table-declarations';
//import { SearchConfiguration } from '@alfresco/adf-content-services';

@Injectable({
  providedIn: 'root'
})
export class MrbauSearchQueryBuilderService implements IMrbauSearchQueryBuilder{
  _searchApi: SearchApi;
  get searchApi(): SearchApi {
      this._searchApi = this._searchApi ?? new SearchApi(this.alfrescoApiService.getInstance());
      return this._searchApi;
  }

  /*  Stream that emits the query before search whenever user search  */
  updated = new Subject<QueryBody>();

  /*  Stream that emits the results whenever user search  */
  executed = new Subject<ResultSetPaging>();

  /*  Stream that emits the error whenever user search  */
  error = new Subject();

  title : string = jsonSearch.name;
  paging: { maxItems?: number; skipCount?: number } = null;

  private _userQuery = '';
  get userQuery(): string {
    return this._userQuery;
  }
  set userQuery(value: string) {
      value = (value || '').trim();
      this._userQuery = value ? `(${value})` : '';
  }
  sort : RequestSortDefinition;
  filterQueries: RequestFilterQueries;
  include: string[];
  facetFields: RequestFacetFields;
  facetQueries: RequestFacetQueries;
  categories: SearchCategory[] = [];

  queryFragments: { [id: string]: string } = {};

  constructor(
    private appConfig: AppConfigService,
    private alfrescoApiService: AlfrescoApiService,
  ) {
      this.appConfig;
      this.alfrescoApiService;
  }

  protected getFinalQuery(): string {
    let query = '';

    this.categories.forEach((facet) => {
        const customQuery = this.queryFragments[facet.id];
        if (customQuery) {
            if (query.length > 0) {
                query += ' AND ';
            }
            query += `(${customQuery})`;
        }
    });

    let result = [this.userQuery, query]
        .filter((entry) => entry)
        .join(' AND ');

      /*
    if (this.userFacetBuckets) {
        Object.keys(this.userFacetBuckets).forEach((key) => {
            const subQuery = (this.userFacetBuckets[key] || [])
                .filter((bucket) => bucket.filterQuery)
                .map((bucket) => bucket.filterQuery)
                .join(' OR ');
            if (subQuery) {
                if (result.length > 0) {
                    result += ' AND ';
                }
                result += `(${subQuery})`;
            }
        });
    }*/

    return result;
  }


  private buildQuery(): QueryBody {
    const query = this.getFinalQuery();
    console.log('final query: '+query);
    const result: QueryBody = {
        query: {
            query: query,
            language: 'afts'
        },
        include: this.include,
        paging: this.paging,
        /*fields: this.config.fields,*/
        filterQueries: this.filterQueries,
        facetQueries: this.facetQueries,
        /*facetIntervals: this.facetIntervals,*/
        facetFields: this.facetFields,
        sort: this.sort,

        /*highlight: this.highlight*/
    };

    result['facetFormat'] = 'V2';
    return result;
  }

  private update(): QueryBody {
    const query = this.buildQuery();
    this.updated.next(query);
    return query;
  }

  /**
   * Builds and executes the current query.
   *
   * @returns Nothing
   */
  async execute() {
    try {
        const query = this.update();
        if (query) {
            const resultSetPaging: ResultSetPaging = await this.searchApi.search(query);
            this.executed.next(resultSetPaging);
        }
    } catch (error) {
        this.error.next(error);

        this.executed.next({
            list: {
                pagination: {
                    totalItems: 0
                },
                entries: []
            }
        });
    }
  }

}
