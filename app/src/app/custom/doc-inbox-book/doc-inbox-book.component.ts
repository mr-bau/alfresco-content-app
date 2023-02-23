
import { ContentActionRef } from '@alfresco/adf-extensions';
import { MinimalNodeEntity, Pagination, ResultSetPaging } from '@alfresco/js-api';
import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { PageComponent } from '../../components/page.component';
import { AppStore, isAdmin, SnackbarErrorAction } from '@alfresco/aca-shared/store';
import { AppExtensionService } from '@alfresco/aca-shared';
import { ContentManagementService } from '../../services/content-management.service';
import { Store } from '@ngrx/store';
import { AlfrescoApiService, AppConfigService, TranslationService } from '@alfresco/adf-core';
import { MrbauSearchQueryBuilder } from '../mrbau-search-table/mrbau-search-query-builder';
import { IMrbauSearchComponent, IMrbauSearchQueryBuilder } from '../mrbau-search-table/mrbau-search-table-declarations';
import { SearchConfiguration } from '@alfresco/adf-content-services';

import jsonSearch from './dock-inbox-book-search.json';
import { MrbauFacetFilters } from '../mrbau-search-table/mrbau-facet-filters';
import { Router } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
interface MrbauSortingDefinition {
  key: string;
  sortingKey: string;
  direction: string;
}

@Component({
  selector: 'aca-doc-inbox-book',
  templateUrl: './doc-inbox-book.component.html',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./doc-inbox-book.component.scss']
})
export class DocInboxBookComponent extends PageComponent implements OnInit, OnDestroy, IMrbauSearchComponent {

  isAdmin = false;
  isLoading: boolean = false;
  errorMessage: string;
  isSmallScreen = false;
  actions: Array<ContentActionRef> = [];
  data: ResultSetPaging;
  sorting = ['name', 'asc'];
  queryParams;
  config : SearchConfiguration;
  queryBuilder: IMrbauSearchQueryBuilder;
  facetFilters: MrbauFacetFilters;

  constructor(
    store: Store<AppStore>,
    extensions: AppExtensionService,
    content: ContentManagementService,
    alfrescoApiService: AlfrescoApiService,
    appConfig: AppConfigService,
    private translationService: TranslationService,
    private router: Router,
  ) {
    super(store, extensions, content);
    this.config = JSON.parse(JSON.stringify(jsonSearch));
    this.title = this.config.name;
    this.queryBuilder = new MrbauSearchQueryBuilder(appConfig, alfrescoApiService);
    this.queryBuilder.paging = {
      skipCount: 0,
      maxItems: 25
    };

    this.facetFilters = new MrbauFacetFilters(this.queryBuilder, this.translationService);
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.queryBuilder.updateConfig(this.config);

    this.queryBuilder.userQuery = decodeURIComponent("TYPE:'mrba:archiveDocument'");
    this.setSorting({ key: "createdAt", sortingKey: "cm:created", direction: "desc" });
    this.subscriptions.push(
      this.queryBuilder.updated.subscribe((query) => {
        if (query) {
          this.isLoading = true;
          this.errorMessage = null;
        }
      }),

      this.queryBuilder.executed.subscribe((data) => {
        this.queryBuilder.paging.skipCount = 0;

        this.onSearchResultLoaded(data);
        this.isLoading = false;
      }),

      this.queryBuilder.error.subscribe((err: any) => {
        this.onSearchError(err);
      })
    );

    this.store
    .select(isAdmin)
    .pipe(takeUntil(this.onDestroy$))
    .subscribe((value) => {
      this.isAdmin = value;
    });

    this.queryBuilder.execute();
  }

  ngOnDestroy() {
    super.ngOnDestroy();
  }

  onSearchError(error: { message: any }) {
    const { statusCode } = JSON.parse(error.message).error;

    const messageKey = `APP.BROWSE.SEARCH.ERRORS.${statusCode}`;
    let translated = this.translationService.instant(messageKey);

    if (translated === messageKey) {
      translated = this.translationService.instant(`APP.BROWSE.SEARCH.ERRORS.GENERIC`);
    }

    this.store.dispatch(new SnackbarErrorAction(translated));
    this.errorMessage = translated;
  }

  onSearchResultLoaded(nodePaging: ResultSetPaging) {
    this.data = nodePaging;
    this.facetFilters.onSearchResultLoaded(this.data);
  }

  private setSorting(sortDef : MrbauSortingDefinition)
  {
    this.queryBuilder.sort = [{
      "type": "FIELD",
      "field": (sortDef.sortingKey) ? sortDef.sortingKey : sortDef.key,
      "ascending": (sortDef.direction == 'asc')
    }];
    this.sorting = [sortDef.key, sortDef.direction];
  }

  onPaginationChanged(event) {
    const pagination = event as Pagination;
    this.queryBuilder.paging = {
      maxItems: pagination.maxItems,
      skipCount: pagination.skipCount
    };
    this.queryBuilder.execute();
  }

  navigateTo(node: MinimalNodeEntity) {
    if (node && node.entry) {
      if (node.entry.isFolder) {
        // ignored
        return;
      }
      this.showPreview(node, { location: this.router.url });
    }
  }

  onHandleNodeClick(event) {
    this.navigateTo((event as CustomEvent).detail?.node);
  }

  onSortingChanged(event) {
    this.setSorting(event.detail);
    this.queryBuilder.execute();
  }
}
