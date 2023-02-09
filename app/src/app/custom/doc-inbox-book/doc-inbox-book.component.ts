
import { ContentActionRef } from '@alfresco/adf-extensions';
import { Pagination, ResultSetPaging } from '@alfresco/js-api';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { PageComponent } from '../../components/page.component';
import { AppStore, SnackbarErrorAction } from '@alfresco/aca-shared/store';
import { AppExtensionService } from '@alfresco/aca-shared';
import { ContentManagementService } from '../../services/content-management.service';
import { Store } from '@ngrx/store';
import { AlfrescoApiService, AppConfigService, TranslationService } from '@alfresco/adf-core';
import { MrbauSearchQueryBuilderService } from './mrbau-search-query-builder.service';
import { SearchCategory } from '@alfresco/adf-content-services';
import { IMrbauSearchComponent, IMrbauSearchQueryBuilder } from './mrbau-search-table-declarations';

interface SortingDefinition {
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
export class DocInboxBookComponent extends PageComponent implements OnInit, IMrbauSearchComponent {

  isLoading: boolean = false;
  errorMessage: string;
  isSmallScreen = false;
  actions: Array<ContentActionRef> = [];
  data: ResultSetPaging;
  sorting = ['name', 'asc'];
  queryParams;
  queryBuilder: IMrbauSearchQueryBuilder;


  constructor(
    store: Store<AppStore>,
    extensions: AppExtensionService,
    content: ContentManagementService,
    alfrescoApiService: AlfrescoApiService,
    appConfig: AppConfigService,
    private translationService: TranslationService,
  ) {
    super(store, extensions, content);
    this.queryBuilder = new MrbauSearchQueryBuilderService(appConfig, alfrescoApiService);
    this.title = this.queryBuilder.title;
    this.queryBuilder.paging = {
      skipCount: 0,
      maxItems: 25
    };
  }

  ngOnInit(): void {
    super.ngOnInit();

    this.queryBuilder.userQuery = decodeURIComponent("TYPE:'mrba:archiveDocument'");
    this.setSorting({ key: "createdAt", sortingKey: "cm:created", direction: "asc" });
    this.queryBuilder.filterQueries = [
      //{query:"+TYPE:'cm:content'"},
      //{query:"-TYPE:'cm:thumbnail' AND -TYPE:'cm:failedThumbnail' AND -TYPE:'cm:rating'"},
      //{query:"-cm:creator:System AND -QNAME:comment"},
      //{query:"-TYPE:'st:site' AND -ASPECT:'st:siteContainer' AND -ASPECT:'sys:hidden'"},
      //{query:"-TYPE:'dl:dataList' AND -TYPE:'dl:todoList' AND -TYPE:'dl:issue'"},
      //{query:"-TYPE:'fm:topic' AND -TYPE:'fm:post'"},
      //{query:"-TYPE:'lnk:link"},
      //{query:"-PNAME:'0/wiki'"},
    ];
    this.queryBuilder.include = ['path', 'allowableOperations', 'properties'];
    this.queryBuilder.facetFields = {facets:[
      {field:"mrba:organisationUnit", label:"Mandant", mincount:1},
      {field:"mrba:companyName", label:"Firma", mincount:1},
      {field:"creator", label:"SEARCH.FACET_FIELDS.CREATOR", mincount:1},
      {field:"type", label:"Beleg-Art"},
    ]};
    const facetQueries =
      [
        { "query": "TYPE:'mrba:offer'", "label": "MRBAU_EXTENSION.MRBA_ARCHIVE_MODEL.OFFER", "group":"MRBAU_EXTENSION.SEARCH.ARCHIVE_DOCUMENT_TITLE"},
        { "query": "TYPE:'mrba:order'", "label": "MRBAU_EXTENSION.MRBA_ARCHIVE_MODEL.ORDER", "group":"MRBAU_EXTENSION.SEARCH.ARCHIVE_DOCUMENT_TITLE"},
        { "query": "TYPE:'mrba:frameworkContract'", "label": "MRBAU_EXTENSION.MRBA_ARCHIVE_MODEL.FRAMEWORK_CONTRACT", "group":"MRBAU_EXTENSION.SEARCH.ARCHIVE_DOCUMENT_TITLE"},
        { "query": "TYPE:'mrba:deliveryNote'", "label": "MRBAU_EXTENSION.MRBA_ARCHIVE_MODEL.DELIVERY_NOTE", "group":"MRBAU_EXTENSION.SEARCH.ARCHIVE_DOCUMENT_TITLE"},
        { "query": "TYPE:'mrba:inboundInvoice'", "label": "MRBAU_EXTENSION.MRBA_ARCHIVE_MODEL.INBOUND_INVOICE", "group":"MRBAU_EXTENSION.SEARCH.ARCHIVE_DOCUMENT_TITLE"},
        { "query": "TYPE:'mrba:outboundInvoice'", "label": "MRBAU_EXTENSION.MRBA_ARCHIVE_MODEL.OUTBOUND_INVOICE", "group":"MRBAU_EXTENSION.SEARCH.ARCHIVE_DOCUMENT_TITLE"},
        { "query": "TYPE:'mrba:invoiceReviewSheet'", "label": "MRBAU_EXTENSION.MRBA_ARCHIVE_MODEL.INVOICE_REVIEW_SHEET", "group":"MRBAU_EXTENSION.SEARCH.ARCHIVE_DOCUMENT_TITLE"},
        { "query": "TYPE:'mrba:orderNegotiationProtocol'", "label": "MRBAU_EXTENSION.MRBA_ARCHIVE_MODEL.MISCELLANEOUS_DOCUMENT", "group":"MRBAU_EXTENSION.SEARCH.ARCHIVE_DOCUMENT_TITLE"},
        { "query": "TYPE:'mrba:miscellaneousDocument'", "label": "MRBAU_EXTENSION.MRBA_ARCHIVE_MODEL.MISCELLANEOUS_DOCUMENT", "group":"MRBAU_EXTENSION.SEARCH.ARCHIVE_DOCUMENT_TITLE"},
        { "query": "TYPE:'mrba:rentContract'", "label": "MRBAU_EXTENSION.MRBA_ARCHIVE_MODEL.RENT_CONTRACT", "group":"MRBAU_EXTENSION.SEARCH.ARCHIVE_DOCUMENT_TITLE"},
        { "query": "TYPE:'mrba:contractCancellationWaiver'", "label": "MRBAU_EXTENSION.MRBA_ARCHIVE_MODEL.CONTRACT_CANCELLATION_WAIVER", "group":"MRBAU_EXTENSION.SEARCH.ARCHIVE_DOCUMENT_TITLE"},
        { "query": "TYPE:'mrba:maintenanceContract'", "label": "MRBAU_EXTENSION.MRBA_ARCHIVE_MODEL.MAINTENANCE_CONTRACT", "group":"MRBAU_EXTENSION.SEARCH.ARCHIVE_DOCUMENT_TITLE"},
        { "query": "TYPE:'mrba:allInContract'", "label": "MRBAU_EXTENSION.MRBA_ARCHIVE_MODEL.ALL_IN_CONTRACT", "group":"MRBAU_EXTENSION.SEARCH.ARCHIVE_DOCUMENT_TITLE"},
        { "query": "TYPE:'mrba:licenseContract'", "label": "MRBAU_EXTENSION.MRBA_ARCHIVE_MODEL.LICENSE_CONTRACT", "group":"MRBAU_EXTENSION.SEARCH.ARCHIVE_DOCUMENT_TITLE"},
        { "query": "TYPE:'mrba:financingContract'", "label": "MRBAU_EXTENSION.MRBA_ARCHIVE_MODEL.FINANCING_CONTRACT", "group":"MRBAU_EXTENSION.SEARCH.ARCHIVE_DOCUMENT_TITLE"},
        { "query": "TYPE:'mrba:workContract'", "label": "MRBAU_EXTENSION.MRBA_ARCHIVE_MODEL.WORK_CONTRACT", "group":"MRBAU_EXTENSION.SEARCH.ARCHIVE_DOCUMENT_TITLE"},
        { "query": "TYPE:'mrba:contractCancellation'", "label": "MRBAU_EXTENSION.MRBA_ARCHIVE_MODEL.CONTRACT_CANCELLATION", "group":"MRBAU_EXTENSION.SEARCH.ARCHIVE_DOCUMENT_TITLE"},
        { "query": "TYPE:'mrba:miscellaneousContractDocument'", "label": "MRBAU_EXTENSION.MRBA_ARCHIVE_MODEL.MISCELLANEOUS_CONTRACT_DOCUMENT", "group":"MRBAU_EXTENSION.SEARCH.ARCHIVE_DOCUMENT_TITLE"},
      ];
    this.queryBuilder.facetQueries = facetQueries;
    const categories : SearchCategory[] = [
      {
        "id": "mrbau.extension.docinbox.categories.mrbabase", "name": "Kategorie","enabled": true, "expanded":false,
        "component": {
            "selector": "check-list",
            "settings": {
              "allowUpdateOnChange": false,
              "hideDefaultAction": true,
              "field" : "",
              "options": [
                { "value": "TYPE:'mrba:archiveDocument' AND -TYPE:'mrba:contractDocument'", "name": "MRBAU_EXTENSION.SEARCH.ARCHIVE_DOCUMENTS"},
                { "value": "TYPE:'mrba:contractDocument'", "name": "MRBAU_EXTENSION.SEARCH.ARCHIVE_CONTRACTS"}
              ]
            }
          }
      },
      {
        "id": "mrbau.extension.docinbox.categories.createdDateRange", "name": "Ablagedatum", "enabled": true, "expanded":false,
        "component": {
          "selector": "date-range",
          "settings": {
            "allowUpdateOnChange": false,
            "hideDefaultAction": true,
            "field": "cm:created",
            "dateFormat": "DD-MMM-YY",
            "maxDate": "today"
          }
        }
      },
      {
        "id": "mrbau.extension.docinbox.categories.archievedDateRange", "name": "Eingangsdatum", "enabled": true, "expanded":false,
        "component": {
          "selector": "date-range",
          "settings": {
            "allowUpdateOnChange": false,
            "hideDefaultAction": true,
            "field": "mrba:archivedDateValue",
            "dateFormat": "DD-MMM-YY",
            "maxDate": "today"
          }
        }
      }
    ];
    this.queryBuilder.categories = categories;
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

    this.queryBuilder.execute();
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
    console.log(nodePaging);
    this.data = nodePaging;
  }

  private setSorting(sortDef : SortingDefinition)
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
    console.log('onPaginationChanged');
    console.log(event);
    this.queryBuilder.paging = {
      maxItems: pagination.maxItems,
      skipCount: pagination.skipCount
    };
    this.queryBuilder.execute();
  }

  onHandleNodeClick(event) {
    console.log('handleNodeClick');
    console.log(event);
  }

  onSortingChanged(event) {
    //console.log(event);
    this.setSorting(event.detail);
    this.queryBuilder.execute();
  }

  onFilterSelected(event) {
    console.log("onFilterSelected");
    console.log(event);
  }

}
