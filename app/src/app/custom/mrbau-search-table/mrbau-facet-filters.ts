import { SearchFilterList } from '@alfresco/adf-content-services/lib/search/models/search-filter-list.model';
import { FacetField, FacetFieldBucket, SelectedBucket } from '@alfresco/adf-content-services/public-api';
import { TranslationService } from '@alfresco/adf-core';
import { GenericBucket, GenericFacetResponse, ResultSetContext, ResultSetPaging } from '@alfresco/js-api';
import { IMrbauSearchQueryBuilder } from './mrbau-search-table-declarations';

const DEFAULT_PAGE_SIZE: number = 5;

export class MrbauFacetFilters {

  /** All facet field items to be displayed in the component. These are updated according to the response.
   *  When a new search is performed, the already existing items are updated with the new bucket count values and
   *  the newly received items are added to the responseFacets.
   */
  responseFacets: FacetField[] = null;

  selectedBuckets: SelectedBucket[] = [];

  /** shows the facet chips */
  private readonly facetQueriesPageSize = DEFAULT_PAGE_SIZE;


  constructor(private queryBuilder: IMrbauSearchQueryBuilder,private translationService: TranslationService, ) {
    this.translationService;
      this.facetQueriesPageSize;
  }

  onSearchResultLoaded(data: ResultSetPaging) {
      const context = data.list.context;

      if (context) {
          this.parseFacets(context);
      } else {
          this.responseFacets = null;
      }
  }

  private parseFacets(context: ResultSetContext) {
    this.parseFacetFields(context);
    this.parseFacetIntervals(context);
    this.parseFacetQueries(context);
  }

  private parseFacetFields(context: ResultSetContext) {
    const configFacetFields = this.queryBuilder.config.facetFields && this.queryBuilder.config.facetFields.fields || [];
    this.parseFacetItems(context, configFacetFields, 'field');
  }

  private parseFacetQueries(context: ResultSetContext) {
    const facetQuerySetting = this.queryBuilder.config.facetQueries?.settings || {};
    const configFacetQueries = this.queryBuilder.config.facetQueries && this.queryBuilder.config.facetQueries.queries || [];
    const configGroups = configFacetQueries.reduce((acc, query) => {
        const group = this.queryBuilder.getQueryGroup(query);
        if (acc[group]) {
            acc[group].push(query);
        } else {
            acc[group] = [query];
        }
        return acc;
    }, []);

    const mincount = this.queryBuilder.config.facetQueries && this.queryBuilder.config.facetQueries.mincount;
    const mincountFilter = this.getFilterByMinCount(mincount);

    Object.keys(configGroups).forEach((group) => {
        const responseField = this.findFacet(context, 'query', group);
        const responseBuckets = this.getResponseQueryBuckets(responseField, configGroups[group])
            .filter(mincountFilter);
        const alreadyExistingField = this.findResponseFacet('query', group);

        if (alreadyExistingField) {
            const alreadyExistingBuckets = alreadyExistingField.buckets && alreadyExistingField.buckets.items || [];

            this.updateExistingBuckets(responseField, responseBuckets, alreadyExistingField, alreadyExistingBuckets);
        } else if (responseField) {
            if (responseBuckets.length > 0) {
                const bucketList = new MrbauSearchFilterList<FacetFieldBucket>(responseBuckets, this.facetQueriesPageSize);
                bucketList.filter = this.getBucketFilterFunction(bucketList);

                if (!this.responseFacets) {
                    this.responseFacets = [];
                }
                this.responseFacets.push({
                    field: group,
                    type: responseField.type || 'query',
                    label: group,
                    pageSize: DEFAULT_PAGE_SIZE,
                    currentPageSize: DEFAULT_PAGE_SIZE,
                    buckets:  bucketList as unknown as SearchFilterList<FacetFieldBucket>,
                    settings: facetQuerySetting
                });
            }
        }
    });
  }

  private parseFacetIntervals(context: ResultSetContext) {
    const configFacetIntervals = this.queryBuilder.config.facetIntervals && this.queryBuilder.config.facetIntervals.intervals || [];
    this.parseFacetItems(context, configFacetIntervals, 'interval');
  }

  private getResponseQueryBuckets(responseField: GenericFacetResponse, configGroup: any): FacetFieldBucket[] {
    return (configGroup || []).map((query) => {
        const respBucket = ((responseField && responseField.buckets) || [])
            .find((bucket) => bucket.label === query.label) || {};

        respBucket['count'] = this.getCountValue(respBucket);
        return {
            ...respBucket,
            checked: false,
            display: respBucket.display,
            label: respBucket.label
        };
    });
  }

  private parseFacetItems(context: ResultSetContext, configFacetFields: FacetField[], itemType: string) {
    configFacetFields.forEach((field) => {
        const responseField = this.findFacet(context, itemType, field.label);
        const responseBuckets = this.getResponseBuckets(responseField, field)
            .filter(this.getFilterByMinCount(field.mincount));
        const alreadyExistingField = this.findResponseFacet(itemType, field.label);

        if (alreadyExistingField) {
            const alreadyExistingBuckets = alreadyExistingField.buckets && alreadyExistingField.buckets.items || [];

            this.updateExistingBuckets(responseField, responseBuckets, alreadyExistingField, alreadyExistingBuckets);
        } else if (responseField) {
            if (responseBuckets.length > 0) {

                const bucketList = new MrbauSearchFilterList<FacetFieldBucket>(responseBuckets, field.pageSize);
                bucketList.filter = this.getBucketFilterFunction(bucketList);

                if (!this.responseFacets) {
                    this.responseFacets = [];
                }
                this.responseFacets.push({
                    ...field,
                    type: responseField.type || itemType,
                    label: field.label,
                    pageSize: field.pageSize | DEFAULT_PAGE_SIZE,
                    currentPageSize: field.pageSize | DEFAULT_PAGE_SIZE,
                    buckets: bucketList as unknown as SearchFilterList<FacetFieldBucket>,
                });

            }
        }
    });
  }

  private getFilterByMinCount(mincountInput: number) {
    return (bucket) => {
        let mincount = mincountInput;
        if (mincount === undefined) {
            mincount = 1;
        }
        return bucket.count >= mincount;
    };
  }

  private getBucketFilterFunction(bucketList) {
    return (bucket: FacetFieldBucket): boolean => {
        if (bucket && bucketList.filterText) {
            const pattern = (bucketList.filterText || '').toLowerCase();
            const label = (this.translationService.instant(bucket.display) || this.translationService.instant(bucket.label)).toLowerCase();
            return this.queryBuilder.config.filterWithContains ? label.indexOf(pattern) !== -1 : label.startsWith(pattern);
        }
        return true;
    };
  }

  private updateExistingBuckets(responseField, responseBuckets, alreadyExistingField, alreadyExistingBuckets) {
    const bucketsToDelete = [];

    alreadyExistingBuckets
        .map((bucket) => {
            const responseBucket = ((responseField && responseField.buckets) || []).find((respBucket) => respBucket.label === bucket.label);

            if (!responseBucket) {
                bucketsToDelete.push(bucket);
            }
            bucket.count = this.getCountValue(responseBucket);
            return bucket;
        });

    const hasSelection = this.selectedBuckets
        .find((selBuckets) => alreadyExistingField.label === selBuckets.field.label && alreadyExistingField.type === selBuckets.field.type);

    if (!hasSelection && bucketsToDelete.length) {
        bucketsToDelete.forEach((bucket) => {
            alreadyExistingField.buckets.deleteItem(bucket);
        });
    }

    responseBuckets.forEach((respBucket) => {
        const existingBucket = alreadyExistingBuckets.find((oldBucket) => oldBucket.label === respBucket.label);

        if (!existingBucket) {
            alreadyExistingField.buckets.addItem(respBucket);
        }
    });
  }

  private findResponseFacet(itemType: string, fieldLabel: string): FacetField {
    return (this.responseFacets || []).find((response) => response.type === itemType && response.label === fieldLabel);
  }

  private findFacet(context: ResultSetContext, itemType: string, fieldLabel: string): GenericFacetResponse {
    return (context.facets || []).find((response) => response.type === itemType && response.label === fieldLabel) || {};
  }

  private getResponseBuckets(responseField: GenericFacetResponse, configField: FacetField): FacetFieldBucket[] {
    return ((responseField && responseField.buckets) || []).map((respBucket) => {

        respBucket['count'] = this.getCountValue(respBucket);
        respBucket.filterQuery = respBucket.filterQuery || this.getCorrespondingFilterQuery(configField, respBucket.label);
        return {
            ...respBucket,
            checked: false,
            display: respBucket.display,
            label: respBucket.label
        } as FacetFieldBucket;
    });
  }

  private getCountValue(bucket: GenericBucket): number {
    return (!!bucket && !!bucket.metrics && bucket.metrics[0]?.value?.count) || 0;
  }

  private getCorrespondingFilterQuery(configFacetItem: FacetField, bucketLabel: string): string {
    let filterQuery = null;

    if (configFacetItem.field && bucketLabel) {

        if (configFacetItem.sets) {
            const configSet = configFacetItem.sets.find((set) => bucketLabel === set.label);

            if (configSet) {
                filterQuery = this.buildIntervalQuery(configFacetItem.field, configSet);
            }

        } else {
            filterQuery = `${configFacetItem.field}:"${bucketLabel}"`;
        }
    }

    return filterQuery;
  }

  private buildIntervalQuery(fieldName: string, interval: any): string {
    const start = interval.start;
    const end = interval.end;
    const startLimit = (interval.startInclusive === undefined || interval.startInclusive === true) ? '[' : '<';
    const endLimit = (interval.endInclusive === undefined || interval.endInclusive === true) ? ']' : '>';

    return `${fieldName}:${startLimit}"${start}" TO "${end}"${endLimit}`;
  }
}

// Redefinition of SearchFilterList because search-filter-list.model is not exported
class MrbauSearchFilterList<T> implements Iterable<T> {

  private filteredItems: T[] = [];
  private _filterText: string = '';

  items: T[] = [];
  pageSize: number = DEFAULT_PAGE_SIZE;
  currentPageSize: number = DEFAULT_PAGE_SIZE;

  get filterText(): string {
      return this._filterText;
  }

  set filterText(value: string) {
      this._filterText = value;
      this.applyFilter();
  }

  private _filter: (item: T) => boolean = () => true;

  get filter(): (item: T) => boolean {
      return this._filter;
  }

  set filter(value: (item: T) => boolean ) {
      this._filter = value;
      this.applyFilter();
  }

  private applyFilter() {
      if (this.filter) {
          this.filteredItems = this.items.filter(this.filter);
      } else {
          this.filteredItems = this.items;
      }
      this.currentPageSize = this.pageSize;
  }

  /** Returns visible portion of the items.  */
  get visibleItems(): T[] {
      return this.filteredItems.slice(0, this.currentPageSize);
  }

  /** Returns entire collection length including items not displayed on the page. */
  get length(): number {
      return this.items.length;
  }

  /** Detects whether more items can be displayed. */
  get canShowMoreItems(): boolean {
      return this.filteredItems.length > this.currentPageSize;
  }

  /** Detects whether less items can be displayed. */
  get canShowLessItems(): boolean {
      return this.currentPageSize > this.pageSize;
  }

  /** Detects whether content fits single page. */
  get fitsPage(): boolean {
      return this.pageSize >= this.filteredItems.length;
  }

  constructor(items: T[] = [], pageSize?: number) {
      this.items = items;
      this.filteredItems = items;
      this.pageSize = pageSize || DEFAULT_PAGE_SIZE;
      this.currentPageSize = pageSize || DEFAULT_PAGE_SIZE;
  }

  /** Display more items. */
  showMoreItems() {
      if (this.canShowMoreItems) {
          this.currentPageSize += this.pageSize;
      }
  }

  /** Display less items. */
  showLessItems() {
      if (this.canShowLessItems) {
          this.currentPageSize -= this.pageSize;
      }
  }

  /** Reset entire collection and page settings. */
  clear() {
      this.currentPageSize = this.pageSize;
      this.items = [];
      this.filteredItems = [];
      this.filterText = '';
  }

  addItem(item: T) {
      if (!item) {
          return;
      }
      this.items.push(item);
      this.applyFilter();
  }

  deleteItem(item: T) {
      const removeIndex = this.items.indexOf(item);
      if (removeIndex > -1) {
          this.items.splice(removeIndex, 1);
          this.filteredItems.splice(removeIndex, 1);
      }
  }

  [Symbol.iterator](): Iterator<T> {
      let pointer = 0;
      const items = this.visibleItems;

      return {
          next: (): IteratorResult<T> => {
              if (pointer < items.length) {
                  return {
                      done: false,
                      value: items[pointer++]
                  };
              } else {
                  return {
                      done: true,
                      value: null
                  };
              }
          }
      };
  }
}
