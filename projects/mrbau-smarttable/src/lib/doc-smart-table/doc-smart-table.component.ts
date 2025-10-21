import { CommonModule, NgClass } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { ErrormsgpaneComponent, LoaderoverlayComponent, ShowNavbarOverlayComponent } from '@mrbau/mrbau-common';
import { AlfrescoViewerComponent, EcmUserModel } from '@alfresco/adf-content-services';
import { AlertModule, AlignDirective, BadgeModule, ButtonDirective, ButtonGroupComponent, CardModule,
  //ColDirective, FormCheckComponent, FormCheckInputDirective, FormCheckLabelDirective, TooltipDirective,
  CollapseDirective, DateRangePickerModule, FormCheckLabelDirective, FormDirective, GridModule, IColumn, IColumnFilterValue, ISorterValue, MultiSelectComponent, MultiSelectOptionComponent, SmartPaginationModule, SmartTableModule, TableActiveDirective, TableColorDirective, TemplateIdDirective,
  TooltipDirective} from '@coreui/angular-pro';
import { DocSmartTableHeader, IDocs } from './doc-smart-table-header';
import { DocSmartTableDataService, IApiParams } from './doc-smart-table-data.service';
import { BehaviorSubject, combineLatest, debounceTime, distinctUntilChanged, map, Observable, retry, Subject, takeUntil, tap } from 'rxjs';
import { NodeEntry, RequestFilterQueries, RequestFilterQueriesInner, RequestSortDefinitionInner, ResultSetRowEntry } from '@alfresco/js-api';
import { ISelectFormOptions, MrbauConventionsService, MRBauArchiveNodeTypeLabelPipe, MrbauCommonService, MrbauPreferencesService, MrbauDbService, ICostCarrier, MrbauShowDocTaskDialogAction, MrbauShowDocTaskDialogWindowAction } from '@mrbau/mrbau-extension';
import { TranslateModule } from '@ngx-translate/core';
import { endOfDay, startOfDay } from 'date-fns';
import { ContextMenu, IContextMenuListItem, IContextMenuResult } from '../util/context-menu.component';
import { AutocompleteDropdown, IAutocompleteDropdownData } from '../util/autocomplete-dropdown.component';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ITaskSmartTableComponentRadioOption } from '../util/context-menu-helper';

import { Store } from '@ngrx/store';
import { AppStore } from '@alfresco/aca-shared/store';
import { SelectionState } from '@alfresco/adf-extensions';

export interface IParams {
  activePage?: number;
  columnFilterValue?: IColumnFilterValue;
  itemsPerPage?: number;
  loadingData?: boolean;
  sorterValue?: ISorterValue;
  totalPages?: number;
}

@Component({
  standalone:true,
  providers: [DocSmartTableDataService],
  imports: [
    // Angular
    CommonModule,
    NgClass,
    ReactiveFormsModule,
    // ngx-*
    TranslateModule,
    // Mrbau
    ErrormsgpaneComponent, LoaderoverlayComponent, ShowNavbarOverlayComponent,
    ContextMenu,
    MRBauArchiveNodeTypeLabelPipe,
    AutocompleteDropdown,
    // Alfresco
    AlfrescoViewerComponent,
    // Core UI
    SmartTableModule,
    CardModule,
    AlertModule,
    SmartPaginationModule,
    DateRangePickerModule,
    ButtonGroupComponent,
    BadgeModule,
    GridModule,
    TooltipDirective,
    //FormCheckInputDirective,ColDirective, FormCheckLabelDirective, TooltipDirective,FormCheckComponent,
    TemplateIdDirective,
    MultiSelectComponent,
    MultiSelectOptionComponent,
    CollapseDirective,
    ButtonDirective,
    TableActiveDirective,
    TableColorDirective,
    AlignDirective,
    FormDirective,
    FormCheckLabelDirective

],
  selector: 'mrbau-doc-smart-table',
  templateUrl: './doc-smart-table.component.html',
  styleUrls: ['./doc-smart-table.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class DocSmartTableComponent implements OnInit, OnDestroy{
  @ViewChild('contextMenu') contextMenu! : ContextMenu;

  staticDataKT : IContextMenuListItem[] = [
    {id: '11*', name: '11* Bau Feldk.', visible:true, checked:false},
    {id: '12*', name: '12* Bau Mödling', visible:true, checked:false},
    {id: '21*', name: '21* GU Feldk.', visible:true, checked:false},
    {id: '22*', name: '22* GU Mödling', visible:true, checked:false},
    {id: '31*', name: '31* Immo Feldk.', visible:true, checked:false},
    {id: '41*', name: '41* Holzbau Mödling', visible:true, checked:false},
    {id: '71*', name: '71* Planung Feldk.', visible:true, checked:false},
    {id: '9*', name: '9* Zentralregie Alle', visible:true, checked:false},
    {id: '91*', name: '91* GF', visible:true, checked:false},
    {id: '92*', name: '92* Finanzen', visible:true, checked:false},
    {id: '93*', name: '93* IT & Digitalisierung', visible:true, checked:false},
    {id: '94*', name: '94* Personal', visible:true, checked:false},
    {id: '95*', name: '95* Marketing', visible:true, checked:false},
    {id: '99*', name: '99* Verwaltung', visible:true, checked:false},
  ];

  staticDataTags : IContextMenuListItem[] = [
    {id: "=TAG:'abfallwirtschaft'", name: 'MRBAU_EXTENSION.SEARCH.ARCHIVE_DOCUMENT_TAG_ABFALLWIRTSCHAFT', visible:true, checked:false},
    {id: "=TAG:'abfallwirtschaft' AND !TAG:'erledigt'", name: 'MRBAU_EXTENSION.SEARCH.ARCHIVE_DOCUMENT_TAG_ABFALLWIRTSCHAFT_TODO', visible:true, checked:false},
    {id: "=TAG:'abfallwirtschaft' AND =TAG:'erledigt'", name: 'MRBAU_EXTENSION.SEARCH.ARCHIVE_DOCUMENT_TAG_ABFALLWIRTSCHAFT_DONE', visible:true, checked:false},
    {id: "=TAG:'bauhof'", name: 'MRBAU_EXTENSION.SEARCH.ARCHIVE_DOCUMENT_TAG_BAUHOF', visible:true, checked:false},
    {id: "=TAG:'bauhof' AND !TAG:'erledigt'", name: 'MRBAU_EXTENSION.SEARCH.ARCHIVE_DOCUMENT_TAG_BAUHOF_TODO', visible:true, checked:false},
    {id: "=TAG:'bauhof' AND =TAG:'erledigt'", name: 'MRBAU_EXTENSION.SEARCH.ARCHIVE_DOCUMENT_TAG_BAUHOF_DONE', visible:true, checked:false},
    {id: "(mrba:costCarrierNumber:11-100 OR mrba:costCarrierNumber:12-100 OR mrba:costCarrierNumber:41-100) AND !TAG:'bauhof'", name: 'MRBAU_EXTENSION.SEARCH.ARCHIVE_DOCUMENT_TAG_BAUHOF_KT', visible:true, checked:false},
    {id: "=TAG:'weiterverrechnung'", name: 'MRBAU_EXTENSION.SEARCH.ARCHIVE_DOCUMENT_TAG_WEITERVERRECHNUNG', visible:true, checked:false},
    {id: "=TAG:'weiterverrechnung' AND !TAG:'weiterverrechnung erledigt'", name: 'MRBAU_EXTENSION.SEARCH.ARCHIVE_DOCUMENT_TAG_WEITERVERRECHNUNG_TODO', visible:true, checked:false},
    {id: "=TAG:'TAG:'weiterverrechnung erledigt''", name: 'MRBAU_EXTENSION.SEARCH.ARCHIVE_DOCUMENT_TAG_WEITERVERRECHNUNG_DONE', visible:true, checked:false},
  ];

  errorMessage : string | null = null;
  loaderVisible = false;
  viewerNodeId : string | undefined = undefined;
  showViewer = false;

  docSmartTableHeader = new DocSmartTableHeader();
  //columns = DocSmartTableHeader.allColumns;
  columns : (string | IColumn)[] = [];
  readonly activePage$ = new BehaviorSubject(0);
  readonly columnFilterValue$ = new BehaviorSubject({});
  readonly itemsPerPage$ = new BehaviorSubject(5);
  readonly loadingData$ = new BehaviorSubject<boolean>(true);
  readonly totalPages$ = new BehaviorSubject<number>(1);
  readonly sorterValue$ = new BehaviorSubject({});
  readonly totalItems$ = new BehaviorSubject(0);

  readonly apiParams$ = new BehaviorSubject<IApiParams>({ limit: this.itemsPerPage$.value, offset: 0});
  readonly errorMessage$ = new Subject<string>();
  readonly retry$ = new Subject<boolean>();

  readonly props$: Observable<IParams> = combineLatest([
    this.activePage$,
    this.columnFilterValue$,
    this.itemsPerPage$,
    this.loadingData$,
    this.sorterValue$,
    this.totalPages$
  ]).pipe(
    debounceTime(100),
    map(([activePage, columnFilterValue, itemsPerPage, loadingData, sorterValue, totalPages]) => ({
      activePage,
      columnFilterValue,
      itemsPerPage,
      loadingData,
      sorterValue,
      totalPages
    }))
  );
  docsData$!: Observable<IDocs[]>;
  readonly #destroy$ = new Subject<boolean>();

  private _apiParams: IApiParams = {};
  set apiParams(value: any) {
    const params = {
      ...this._apiParams,
      ...value
    };

    const entries = new Map(Object.entries(params));
    entries.forEach((value, key, map) => {
      if (value === '' || value === undefined || value === null || (Array.isArray(value) && value.length == 0)) {
        map.delete(key);
      }
    });

    const apiParams = Object.fromEntries(entries);
    // only if changed
    if (JSON.stringify(apiParams) !== JSON.stringify(this._apiParams)) {
      this.loadingData$.next(true);
      this._apiParams = { ...apiParams };
      this.retry$.next(true);
      this.apiParams$.next({ ...apiParams });
    }
  }

  radioOptionsKT : ITaskSmartTableComponentRadioOption[]= [
      {formControlName: 'formControlKT', key:'a', label:'Gruppe-1', tooltip:'Datenbank-Filter nach KT/KS-Gruppe.', filter_pre: "=mrba:costCarrierNumber:'", filter_suc: "' ", contextMenu: true, loadData : this.loadDataKT.bind(this)},
      {formControlName: 'formControlKT', key:'b', label:'Gruppe-2', tooltip:'Datenbank-Filter nach KT/KS-Gruppe.', filter_pre: "=mrba:costCarrierNumber:'", filter_suc: "' ", contextMenu: true, loadData : this.loadDataKT.bind(this)},
      {formControlName: 'formControlKT', key:'c', label:'Gruppe-%', tooltip:'Datenbank-Filter nach KT/KS-Gruppe.', filter_pre: "mrba:costCarrierNumber:'", filter_suc: "' ", contextMenu: true, staticData: this.staticDataKT},
      {formControlName: 'formControlKT', key:'all', label:'Alle', tooltip:'Datenbank-Filter nach KT/KS-Gruppe.'}
  ];
  radioOptionsTags: ITaskSmartTableComponentRadioOption[]= [
      {formControlName: 'formControlTags', key:'a', label:'Tags-1', tooltip:'Datenbank-Filter nach Tags.', filter_pre: "", filter_suc: "", contextMenu: true, staticData: this.staticDataTags},
      {formControlName: 'formControlTags', key:'all', label:'Alle', tooltip:'Datenbank-Filter nach Tags.'}
  ];
  formGroup = new FormGroup({
      formControlKT: new FormControl(this.radioOptionsKT[0].key),
      formControlTags: new FormControl(this.radioOptionsTags[0].key),
  });

  constructor(
    private docSmartTableDataService : DocSmartTableDataService,
    private mrbauConventionsService : MrbauConventionsService,
    private mrbauCommonService : MrbauCommonService,
    //private searchService: SearchService,
    private mrbauDbService : MrbauDbService,
    private mrbauPreferencesService : MrbauPreferencesService,
    private store: Store<AppStore>,
  ) {
    /*let result :string[]= []
    OrganisationPositionTypes.forEach( (d : any) => result.push(d.value));
    this.organisationPosition = result;*/

    this.organisationPosition = this.mrbauConventionsService.getOrganisationPositionFormOptions();
    this.nodeType = this.mrbauConventionsService.getDocumentTypeFormOptions();
    this.signingStatus = this.mrbauConventionsService.getSigningStatusFormOptions();
    this.tagsFormOptions = this.mrbauConventionsService.getTagsFormOptions();
  }

  ngOnDestroy(): void {
    this.#destroy$.next(true);
    this.storePreferences();
  }
  vendorData : IAutocompleteDropdownData = {
    title: "Firma",
    bindLabel:"mrba:companyName",
    bindValue:"mrba:companyName",
    onSearchFunction: (term: string): Observable<any> => {
      let re1 = /\*/gi;
      let newTerm = term.replace(re1, '%');
      let re2 = /\?/gi;
      newTerm = newTerm.replace(re2, '_');
      return this.mrbauDbService.searchVendors2(newTerm);
    },
    createDropDownString: (v: any): string => {
      let result = v['mrba:companyName'];
      result = (v['mrba:companyStreet']) ? result.concat(', ').concat(v['mrba:companyStreet']) : result;
      result = (v['mrba:companyCity']) ? result.concat(', ').concat(v['mrba:companyZipCode']).concat(' ').concat(v['mrba:companyCity'])  : result;
      result = (v['mrba:companyVatID']) ? result.concat(', ').concat(v['mrba:companyVatID']) : result;
      result += ' ('+v['mrba:companyId']+')';
      return result;
    }
  }
  onVendorChanged(data:null|string) {
    this.setActivePage(1);
    let vendorFilter : RequestFilterQueries = [];
    if (data) {
      vendorFilter.push({query: `=mrba:companyName:"${data}"`})
    }
    this.apiParams = { vendorFilter };
  }

  people: EcmUserModel[] | undefined;

  async loadPeople() {
    this.people = await this.mrbauCommonService.getPeopleObservable().toPromise();
    const people = this.people;
    if (!people) {
      return;
    }
    const peopleFormOptions = people.map(user => { const result : ISelectFormOptions = {value : user.id, label : (user.firstName || '')+' '+(user.lastName || '')}; return result});
    this.creator = peopleFormOptions;
  }

  async ngOnInit() {
    this.restorePreferences();
    this.loadPeople();
    this.errorMessage$.next("error.message")

    this.activePage$.pipe(takeUntil(this.#destroy$)).subscribe((page) => {
      const limit = this.itemsPerPage$.value;
      const offset = limit * page - limit;
      this.apiParams = { offset, limit };
    });

    this.itemsPerPage$.pipe(distinctUntilChanged(), takeUntil(this.#destroy$)).subscribe((limit) => {
      const totalPages = Math.ceil(this.totalItems$.value / limit) ?? 1;
      this.totalPages$.next(totalPages);
    });

    this.totalItems$.pipe(distinctUntilChanged(), takeUntil(this.#destroy$)).subscribe((totalItems) => {
      const totalPages = Math.ceil(totalItems / this.itemsPerPage$.value) ?? 1;
      this.totalPages$.next(totalPages);
    });

    this.totalPages$.pipe(takeUntil(this.#destroy$)).subscribe((totalPages) => {
      const activePage = this.activePage$.value > totalPages ? totalPages : this.activePage$.value;
      this.setActivePage(activePage);
    });

    this.docsData$ = this.docSmartTableDataService.getDocs(this.apiParams$).pipe(
      retry({
        delay: (error) => {
          console.warn('Retry: ', error);
          this.errorMessage$.next(error.message ?? `Error: ${JSON.stringify(error)}`);
          this.loadingData$.next(false);
          return this.retry$;
        }
      }),
      tap((response) => {
        this.totalItems$.next(response.list?.pagination?.totalItems!);
        if (response.list?.entries) {
          this.errorMessage$.next('');
        }
        this.retry$.next(false);
        this.loadingData$.next(false);
      }),
      map((response) => {

        let result = response.list?.entries?.map((val : ResultSetRowEntry) => {
          return {
            'id':val.entry.id,
            'dokumentName': val.entry.name,
            'nodeType': val.entry.nodeType, // <-select field / sorter
            'organisationUnit': val.entry.properties['mrba:organisationUnit'] || '',
            'companyName': val.entry.properties['mrba:companyName'] || '',
            'costCarrierNumber': val.entry.properties['mrba:costCarrierNumber'] || '',
            'project': val.entry.properties['mrba:projectName'] || '',
            'creator': val.entry.createdByUser?.displayName || '',  // <-select field / sorter
            'organisationPosition': val.entry.properties['mrba:organisationPosition'] || '',// <-select field / sorter
            'signingStatus': val.entry.properties['mrba:signingStatus'] || '', // <-select field / sorter
            'created': val.entry.createdAt || '', // <-select field / sorter
            'archivedDateValue': val.entry.properties['mrba:archivedDateValue'] || '', // <-select field / sorter
            'documentDateValue': val.entry.properties['mrba:documentDateValue'] || '', // <-select field / sorter
            'documentNumber': val.entry.properties['mrba:documentNumber'] || '', // <-select field / sorter
            'properties': val.entry.properties,
            'tags$' : this.mrbauCommonService.getTagsByNodeIdObservable(val.entry.id),
          }
        })
        return result;
      })
    );
  }

  details_visible = Object.create({});
  readonly PREFERENCES_KEY = 'mrbau_doc_smart_table';
  preferences : any = {};

  handleColumnFilterValueChange(columnFilterValueNew: IColumnFilterValue) {
    let columnFilterValue = {...columnFilterValueNew};
    this.setActivePage(1);
    const keys = Object.keys(columnFilterValue);
    let filter : RequestFilterQueries = [];
    for (let i=0; i<keys.length; i++)
    {
      const key = keys[i]
      const name = DocSmartTableHeader.getFilterName(key);
      const value = columnFilterValue[key];
      if (value !== '' && value !== null && value !== undefined)
      {
        if (typeof value === 'string' || typeof value === 'number') {
          const query : RequestFilterQueriesInner = { query: name+':"'+value+'"'};
          filter.push(query)
        }
        else if (Array.isArray(value) && value.length > 0) {
          let q : string = '('+name+':"'+value[0]+'"';
          for (let i=1; i<value.length; i++)
          {
            q += ' OR '+name+':"'+value[i]+'"';
          }
          q += ')';
          const query : RequestFilterQueriesInner = { query: q};
          filter.push(query)
        }
        else if (typeof value === 'object' && value.start && value.end) {
          const query : RequestFilterQueriesInner = { query: name+':['+value.start.toISOString()+' TO '+value.end.toISOString()+']'};
          filter.push(query)
        }
      }
      else
      {
        delete columnFilterValue[key];
      }
    }
    this.apiParams = { filter };
    this.columnFilterValue$.next(columnFilterValue);
  }

  handleSorterValueChange(sorterValue: ISorterValue) {
    this.sorterValue$.next(!!sorterValue.state ? sorterValue : {});
    let sort : RequestSortDefinitionInner | undefined = undefined;
    if (sorterValue && !!sorterValue.state) {
      sort = {
        type: 'FIELD',
        field: DocSmartTableHeader.getSorterKey(sorterValue.column!),
        ascending: (sorterValue.state == "asc")
      }
    }
    this.apiParams = { sort };
  }

  handleCleanerClick($event:any) {
    $event;
    /*this._startDateCreated = null;
    this._endDateCreated = null;
    this._startDateArchivedDateValue = null;
    this._endDateArchivedDateValue = null;
    this._startDateDocumentDateValue = null;
    this._endDateDocumentDateValue = null;
    this.handleColumnFilterValueChange({});*/
  }

  handleFilteredItemsChange(filteredItems: any[]) {
    filteredItems;
    //console.table(filteredItems);
  }

  handleActivePageChange(page: number) {
    this.setActivePage(page);
  }

  handleItemsPerPageChange(limit: number) {
    this.itemsPerPage$.next(limit);
  }

  setActivePage(page: number) {
    page = page > 0 && this.totalPages$.value + 1 > page ? page : 1;
    this.activePage$.next(page);
  }

  storePreferences() {
    this.generatePreferences();
    this.mrbauPreferencesService.setItem(this.PREFERENCES_KEY, this.preferences);
  }
  generatePreferences() {
    this.preferences = {};
    this.getFormControlValue('formControlKT');
    this.getFormControlValue('formControlTags');
    this.getRadioOptionFilter(this.radioOptionsKT, 'radioOptionsKT', 'a');
    this.getRadioOptionFilter(this.radioOptionsKT, 'radioOptionsKT', 'b');
    this.getRadioOptionFilter(this.radioOptionsKT, 'radioOptionsKT', 'c');
    this.getRadioOptionFilter(this.radioOptionsTags, 'radioOptionsTags', 'a');
    this.getTableHeader();
  }
  restorePreferences() {
    this.preferences = {};
    const preferences = this.mrbauPreferencesService.getItem(this.PREFERENCES_KEY);
    if (preferences) {
      this.preferences = preferences;
    }
    this.applyPreferences();
  }
  applyPreferences(){
    this.setRadioOptionFilter(this.radioOptionsKT, 'radioOptionsKT', 'a');
    this.setRadioOptionFilter(this.radioOptionsKT, 'radioOptionsKT', 'b');
    this.setRadioOptionFilter(this.radioOptionsKT, 'radioOptionsKT', 'c');
    this.setRadioOptionFilter(this.radioOptionsTags, 'radioOptionsTags', 'a');
    // order is important! set radio options first and form control values second
    this.setFormControlValue(this.radioOptionsKT, 'formControlKT');
    this.setFormControlValue(this.radioOptionsTags, 'formControlTags');
    this.setTableHeader();
  }
  getFormControlValue(name:string) {
    const controls : any = this.formGroup.controls;
    this.preferences[name] = controls[name].value;
  }
  getRadioOptionFilter(options:ITaskSmartTableComponentRadioOption[], name: string, key: string) {
    name;key;
    const option = options.find(item => item.key == key);
    if (option) {
      this.preferences[name+'.'+key+'.filter'] = option.filter;
      this.preferences[name+'.'+key+'.list'] = option.contextMenuResult?.list;
    }
  }
  setFormControlValue(options : ITaskSmartTableComponentRadioOption[], formControlName :string) {
    if (this.preferences[formControlName]) {
      const items = options.filter(item => item.key == this.preferences[formControlName])
      if (items.length > 0) {

        this.setRadioValue(items[0]);
        return;
      }
    }
    this.setRadioValue(options[0]);
  }
  setRadioOptionFilter(options:ITaskSmartTableComponentRadioOption[], name: string, key: string) {
    const filterName = name+'.'+key+'.filter';
    const listName = name+'.'+key+'.list';
    const option = options.find(item => item.key == key);
    if (!option) {
      return;
    }
    if (this.preferences[filterName]) {
      option.filter = this.preferences[filterName]
    }
    if (this.preferences[listName]) {
      let contextMenuResult : IContextMenuResult = {payload:option, list:this.preferences[listName]};
      option.contextMenuResult = contextMenuResult;
    }
  }

  getTableHeader() {
    this.preferences['columnSettings.list'] = this.docSmartTableHeader.currentColumns;
  }
  setTableHeader() {
    const colPref = this.preferences['columnSettings.list'];
    if (colPref && colPref.length > 0) {
      this.docSmartTableHeader.setColumns(colPref)
    }
    else {
      this.docSmartTableHeader.setDefaultColumns();
    }
    this.columns = this.docSmartTableHeader.columns;
  }

  toggleDetails(item: any) {
    this.details_visible[item] = !this.details_visible[item];
  }

  itemsPerPageChange(event:number) {
    event;
  }

  filteredItemsChange(event:any[]) {
    event;
  }

  // Filter organisationPosition
  organisationPosition: ISelectFormOptions[];
  nodeType: ISelectFormOptions[];
  tagsFormOptions: ISelectFormOptions[];
  creator: ISelectFormOptions[] = [];
  signingStatus:  ISelectFormOptions[];
  handleValueChangeOrganisationPosition($event: any) {
    this.handleValueChangeDropDown('organisationPosition', $event);
  }
  handleValueChangeNodeType($event: any) {
    this.handleValueChangeDropDown('nodeType', $event);
  }
  handleValueChangeTags($event: any) {
    this.handleValueChangeDropDown('tags', $event);
  }
  handleValueChangeCreator($event: any) {
    this.handleValueChangeDropDown('creator', $event);
  }
  handleValueChangeSigningStatus($event: any) {
    this.handleValueChangeDropDown('signingStatus', $event);
  }
  handleValueChangeDropDown(key:string, $event: any) {
    let columnFilterValue : any = this.columnFilterValue$.getValue()
    const selected = [...$event];
    if (selected.length > 0) {
      if (JSON.stringify(columnFilterValue[key]) === JSON.stringify(selected)) {
        // no change - return to avoid false loading state
        return;
      }
      columnFilterValue[key] = selected;
    } else {
      if (columnFilterValue[key] == null) {
        // no change - return to avoid false loading state
        return;
      }
      delete columnFilterValue[key];
    }

    this.handleColumnFilterValueChange(columnFilterValue);
  }

  // dropdown multiselect, date filter: createdDate
    private _startDateCreated: Date | null = null;
    set startDateCreated(value) {
      this._startDateCreated = value;
      this.testDateRangeCheck('created', this._startDateCreated, this._endDateCreated);
    }
    get startDateCreated() {
      return this._startDateCreated;
    }
    private _endDateCreated: Date | null = null;
    set endDateCreated(value) {
      this._endDateCreated = value;
      this.testDateRangeCheck('created', this._startDateCreated, this._endDateCreated);
    }
    get endDateCreated() {
      return this._endDateCreated;
    }
    private _startDateArchivedDateValue: Date | null = null;
    set startDateArchivedDateValue(value) {
      this._startDateArchivedDateValue = value;
      this.testDateRangeCheck('archivedDateValue', this._startDateArchivedDateValue, this._endDateArchivedDateValue);
    }
    get startDateArchivedDateValue() {
      return this._startDateArchivedDateValue;
    }
    private _endDateArchivedDateValue: Date | null = null;
    set endDateArchivedDateValue(value) {
      this._endDateArchivedDateValue = value;
      this.testDateRangeCheck('archivedDateValue', this._startDateArchivedDateValue, this._endDateArchivedDateValue);
    }
    get endDateArchivedDateValue() {
      return this._endDateArchivedDateValue;
    }
    private _startDateDocumentDateValue: Date | null = null;
    set startDateDocumentDateValue(value) {
      this._startDateDocumentDateValue = value;
      this.testDateRangeCheck('documentDateValue', this._startDateDocumentDateValue, this._endDateDocumentDateValue);
    }
    get startDateDocumentDateValue() {
      return this._startDateDocumentDateValue;
    }
    private _endDateDocumentDateValue: Date | null = null;
    set endDateDocumentDateValue(value) {
      this._endDateDocumentDateValue = value;
      this.testDateRangeCheck('documentDateValue', this._startDateDocumentDateValue, this._endDateDocumentDateValue);
    }
    get endDateDocumentDateValue() {
      return this._endDateDocumentDateValue;
    }
    testDateRangeCheck(key:string, start:Date | null, end:Date | null) {
      if ((start && end) || (!start && !end)) {
        this.handleDateRangeChange(key, start, end);
      }
    }
    handleDateRangeChange(key:string, start:Date | null, end:Date | null) {
      let columnFilterValue : any = this.columnFilterValue$.getValue()
      if (start && end) {
        const fromDate = startOfDay(start);
        const toDate = endOfDay(end);
        columnFilterValue[key] = {start : fromDate, end : toDate};
      }
      else
      {
        delete columnFilterValue[key];
      }
      this.handleColumnFilterValueChange(columnFilterValue);
    }

  // Alfresco Viewer
  async viewFile(id:string) {
    this.viewerNodeId = id;
    this.showViewer = true;
  }

  viewerOnClose() {
    this.showViewer = false;
    this.viewerNodeId = undefined;
  }

  onAdjustColumnsClick(event:any) {
    event.preventDefault();
    this.contextMenu.show({title:"Spalten Anpassen", event:event, payload: this.docSmartTableHeader, initial_checked: this.docSmartTableHeader.currentColumns, loadData: this.docSmartTableHeader.loadContextMenuData.bind(this.docSmartTableHeader), callback:this.contextMenuTableHeaderCallback.bind(this), sortByName:false, sortChecked:false });
  }

  contextMenuTableHeaderCallback(data:IContextMenuResult) {
    if (data.payload) {
      const header : DocSmartTableHeader = data.payload
      header.setColumns(data.list);
      this.columns = this.docSmartTableHeader.columns;
      this.storePreferences();
    }
  }

  private cachedKT: IContextMenuListItem[] | undefined;
  loadDataKT() : Promise<IContextMenuListItem[] | undefined>
  {
    if (this.cachedKT) {
      return Promise.resolve(this.cachedKT);
    }
    return new Promise<IContextMenuListItem[] | undefined>(async (resolve) =>
    {
      let list : IContextMenuListItem[] = [];
      const projects = await this.mrbauDbService.getProjects().toPromise();
      if (!projects || typeof projects === "string") {
        resolve(undefined);
        return;
      }
      for (let i = 0; i< projects.length; i++) {
        const prj = projects[i] as ICostCarrier;
        const nr = prj['mrba:costCarrierNumber'];
        list.push({id: nr, name: (nr || '')+' '+(prj['mrba:projectName'] || ''), visible:true, checked:false});
      }
      this.cachedKT = list;
      resolve(list);
      return;
    });
  }

  onRightClick(event:any, option:ITaskSmartTableComponentRadioOption) {
    event.preventDefault();
    if (option.contextMenu)
    {
      this.contextMenu.show({title:event.target.textContent, event:event, sortByName:true, sortChecked:true, payload: option, initial_checked: option.contextMenuResult?.list, staticData : option.staticData, loadData: option.loadData, callback: this.contextMenuCallback.bind(this)});
    }
  }

  changeRadioValue(radioOption: ITaskSmartTableComponentRadioOption): void {
    this.storePreferences();
    this.setRadioValue(radioOption);
  }
  setRadioValue(radioOption: ITaskSmartTableComponentRadioOption): void {
    const obj : any = {};
    obj[radioOption.formControlName] = radioOption.key;
    this.formGroup.patchValue(obj);
    this.setActivePage(1);
    let ktFilter : RequestFilterQueries = [];
    if (radioOption.filter) {
      ktFilter.push({query: radioOption.filter})
    }
    this.apiParams = { ktFilter };
  }
  contextMenuCallback(data:IContextMenuResult) {
    const option : ITaskSmartTableComponentRadioOption = data.payload;
    const list = data.list;
    let filter = '';
    const pre = option.filter_pre || '';
    const suc = option.filter_suc || '';
    if (list.length > 0) {
      for (let i=0; i<list.length; i++)
      {
        if (i > 0) {
          filter += 'OR ';
        }
        filter += pre+data.list[i]+suc;
      }
    }
    option.filter = filter;
    option.contextMenuResult = data;
    this.changeRadioValue(option);
  }

  openTaskLink(id: string, newWindow : boolean) {
    const nodeEntry = { entry: { id: id } } as NodeEntry;
    const payload : SelectionState = {
      count: 1,
      nodes: [nodeEntry],
      libraries: [],
      isEmpty: false,
    };
    if (newWindow) {
      this.store.dispatch(new MrbauShowDocTaskDialogWindowAction(payload));
    }
    else {
      this.store.dispatch(new MrbauShowDocTaskDialogAction(payload));
    }
  }
}
