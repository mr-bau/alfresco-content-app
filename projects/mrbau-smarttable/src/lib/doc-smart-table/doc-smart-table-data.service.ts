import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, retry, switchMap } from 'rxjs/operators';
import { MrbauCommonService } from '../../../../mrbau-extension/src/public-api';
import { RequestFilterQueries, RequestSortDefinitionInner, ResultSetPaging, SearchRequest } from '@alfresco/js-api';

export interface IApiParams {
  offset?: number;
  limit?: number;
  sort?: RequestSortDefinitionInner;
  filter?: RequestFilterQueries;
  vendorFilter?: RequestFilterQueries;
  ktFilter?: RequestFilterQueries;
}

@Injectable()
export class DocSmartTableDataService {
  constructor(
    private mrbauCommonService : MrbauCommonService,
  ) {
  }

  readonly DEFAULT_SORT : RequestSortDefinitionInner =
  {
    type: 'FIELD',
    field: 'cm:created',
    ascending: false
  }
  readonly DEFAULT_FILTER : RequestFilterQueries = [
    { query: `=TYPE:"mrba:archiveDocument"`},
    { query: '!ASPECT:"mrba:discardedDocument"'}, // ignore discarded documents
  ]

  usersUrl = 'https://apitest.coreui.io/demos/users';

  /** GET data from the server */
  getDocs(config$: BehaviorSubject<IApiParams>): Observable<any> {
    return config$.pipe(
      debounceTime(100),
      distinctUntilChanged(
        (previous, current) => {
          return JSON.stringify(previous) === JSON.stringify(current);
        }
      ),
      switchMap((config) => this.fetchData(config))
    );
  }

  private fetchData(params: IApiParams): Observable<ResultSetPaging> {
    const apiParams = {
      ...params
    };

    let query : SearchRequest = {
      query: {
        query: '*',
        language: 'afts'
      },
      paging: {
        maxItems: apiParams.limit,
        skipCount: apiParams.offset
      },
      filterQueries: [
        ...this.DEFAULT_FILTER,
        ...(apiParams.filter ? apiParams.filter : []),
        ...(apiParams.vendorFilter ? apiParams.vendorFilter : []),
        ...(apiParams.ktFilter ? apiParams.ktFilter : []),
      ],
      fields: [
        // ATTENTION make sure to request all mandatory fields for Node (vs ResultNode!)
        'id',
        'name',
        'nodeType',
        'isFolder',
        'isFile',
        'modifiedAt',
        'modifiedByUser',
        'createdAt',
        'createdByUser',
      ],
      sort: [
        (apiParams.sort ? apiParams.sort : this.DEFAULT_SORT)
      ],
      include: ['properties', 'path', 'allowableOperations']
    };
    //console.log(query);
    return this.mrbauCommonService.queryNodesObservable(query).pipe(
        retry({ count: 1, delay: 1000, resetOnSuccess: true }),
        catchError(this.handleError)
      );
  }

  private handleError(error: Error) {
    return throwError(() => error);
  }
}
