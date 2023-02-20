import { AlfrescoApiService, AppConfigService } from '@alfresco/adf-core';
import { Subject } from 'rxjs';
import { QueryBody, RequestFacetFields, RequestHighlight, RequestSortDefinition, ResultSetPaging, SearchApi } from '@alfresco/js-api';
import { FacetQuery, SearchConfiguration } from '@alfresco/adf-content-services';
import { IMrbauSearchQueryBuilder } from './mrbau-search-table-declarations';
//import { SearchConfiguration } from '@alfresco/adf-content-services';

export class MrbauSearchQueryBuilder implements IMrbauSearchQueryBuilder{
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
  config: SearchConfiguration = {
    categories: []
  };


  queryFragments: { [id: string]: string } = {};

  constructor(
    private appConfig: AppConfigService,
    private alfrescoApiService: AlfrescoApiService,
  ) {
      this.appConfig;
      this.alfrescoApiService;
  }

  updateConfig(config : SearchConfiguration) {
    this.config = config;
  }

  protected get facetFields(): RequestFacetFields {
    const facetFields = this.config.facetFields && this.config.facetFields.fields;

    if (facetFields && facetFields.length > 0) {
        return {
            facets: facetFields.map((facet) => ({
                field: facet.field,
                mincount: facet.mincount,
                label: this.getSupportedLabel(facet.label),
                limit: facet.limit,
                offset: facet.offset,
                prefix: facet.prefix
            } as any))
        };
    }

    return null;
  }

  getSupportedLabel(configLabel: string): string {
    const spaceInsideLabelIndex = configLabel.search(/\s/g);
    if (spaceInsideLabelIndex > -1) {
        return `"${configLabel}"`;
    }
    return configLabel;
  }

  protected get facetQueries(): FacetQuery[] {
    if (this.hasFacetQueries) {
        return this.config.facetQueries.queries.map((query) => {
            query.group = this.getQueryGroup(query);
            return { ...query };
        });
    }

    return null;
  }

  getQueryGroup(query) {
    return query.group || this.config.facetQueries.label || 'Facet Queries';
  }

  get hasFacetQueries(): boolean {
    if (this.config
        && this.config.facetQueries
        && this.config.facetQueries.queries
        && this.config.facetQueries.queries.length > 0) {
        return true;
    }
    return false;
  }

  protected get facetIntervals(): any {
    if (this.hasFacetIntervals) {
        const configIntervals = this.config.facetIntervals;

        return {
            intervals: configIntervals.intervals.map((interval) => ({
                label: this.getSupportedLabel(interval.label),
                field: interval.field,
                sets: interval.sets.map((set) => ({
                        label: this.getSupportedLabel(set.label),
                        start: set.start,
                        end: set.end,
                        startInclusive: set.startInclusive,
                        endInclusive: set.endInclusive
                    } as any))
            } as any))
        };
    }

    return null;
  }

  get hasFacetIntervals(): boolean {
    return this.config
        && this.config.facetIntervals
        && this.config.facetIntervals.intervals
        && this.config.facetIntervals.intervals.length > 0;
  }

  protected get highlight(): RequestHighlight {
    return this.hasFacetHighlight ? this.config.highlight : null;
  }

  get hasFacetHighlight(): boolean {
    return !!(this.config && this.config.highlight);
  }

  protected getFinalQuery(): string {
    let query = '';

    this.config.categories.forEach((facet) => {
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
        include: this.config.include,
        paging: this.paging,
        fields: this.config.fields,
        filterQueries: this.config.filterQueries,
        facetQueries: this.facetQueries,
        facetIntervals: this.facetIntervals,
        facetFields: this.facetFields,
        sort: this.sort,
        highlight: this.highlight
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
