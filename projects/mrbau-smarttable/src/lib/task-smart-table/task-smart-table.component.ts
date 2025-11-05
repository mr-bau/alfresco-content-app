import { CommonModule, NgClass } from '@angular/common';
import { Component, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ErrormsgpaneComponent, LoaderoverlayComponent, ShowNavbarOverlayComponent } from '@mrbau/mrbau-common';
import { Node, SearchRequest } from '@alfresco/js-api';
import { SharedModule, TableActiveDirective,
  TableColorDirective,
  TemplateIdDirective,
  IColumn, IItem, AlignDirective,
  CollapseDirective,
  ButtonDirective,
  ColDirective,
  SmartTableComponent,
  DateRangePickerModule,
  ButtonGroupComponent,
  FormCheckLabelDirective,
  TooltipDirective,
  BadgeComponent,
  GridModule,
  FormCheckComponent,
  FormCheckInputDirective,
  CardModule,
  NgCssClass,
   } from '@coreui/angular-pro';
import { EMRBauTaskCategory, EMRBauTaskStatus, MRBauTask } from '@mrbau/mrbau-extension';
import { AlfrescoViewerComponent, EcmUserModel, SearchService } from '@alfresco/adf-content-services';
import { MrbauCommonService } from '@mrbau/mrbau-extension';
import { CONST } from '@mrbau/mrbau-extension';
import { endOfDay, startOfDay } from 'date-fns';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MrbauPreferencesService } from '@mrbau/mrbau-extension';
import { ContextMenu, IContextMenuListItem, IContextMenuResult } from '../util/context-menu.component';
import { MrbauDbService } from '@mrbau/mrbau-extension';
import { ICostCarrier } from '@mrbau/mrbau-extension';
import { TaskSmartTableHeader } from './task-smart-table-header';
import { Router } from '@angular/router';
import { TaskIndicatorComponent } from '@mrbau/mrbau-extension';
import { ITaskSmartTableComponentRadioOption, ITaskSmartTableComponentStats } from '../util/context-menu-helper';

@Component({
   standalone:true,
    imports:[
      CommonModule,
      ErrormsgpaneComponent, LoaderoverlayComponent, ShowNavbarOverlayComponent,
      ContextMenu,
      AlfrescoViewerComponent,
      SharedModule,
      TableActiveDirective,
      TableColorDirective,
      AlignDirective,
      ButtonDirective,
      ColDirective,
      NgClass,
      SmartTableComponent,
      TemplateIdDirective,
      CollapseDirective,
      CardModule,
      DateRangePickerModule,
      ReactiveFormsModule,
      ButtonGroupComponent,
      FormCheckLabelDirective,
      TooltipDirective,
      BadgeComponent,

      GridModule,
      FormCheckComponent, FormCheckInputDirective, FormCheckLabelDirective
  ],
  selector: 'mrbau-task-smart-table',
  templateUrl: './task-smart-table.component.html',
  styleUrls: ['./task-smart-table.component.scss'],
  //encapsulation: ViewEncapsulation.None,
})
export class TaskSmartTableComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  readonly USE_MRBAU_PREFERENCES = true;
  @ViewChild('contextMenu') contextMenu! : ContextMenu;

  staticDataKT : IContextMenuListItem[] = [
    {id: '11%', name: '11* Bau Feldk.', visible:true, checked:false},
    {id: '12%', name: '12* Bau Mödling', visible:true, checked:false},
    {id: '21%', name: '21* GU Feldk.', visible:true, checked:false},
    {id: '22%', name: '22* GU Mödling', visible:true, checked:false},
    {id: '31%', name: '31* Immo Feldk.', visible:true, checked:false},
    {id: '41%', name: '41* Holzbau Mödling', visible:true, checked:false},
    {id: '71%', name: '71* Planung Feldk.', visible:true, checked:false},
    {id: '91%', name: '91* GF', visible:true, checked:false},
    {id: '92%', name: '92* Finanzen', visible:true, checked:false},
    {id: '93%', name: '93* IT & Digitalisierung', visible:true, checked:false},
    {id: '94%', name: '94* Personal', visible:true, checked:false},
    {id: '95%', name: '95* Marketing', visible:true, checked:false},
    {id: '99%', name: '99* Verwaltung', visible:true, checked:false},
  ];

  errorMessage : string | null = null;
  loaderVisible = false;
  currentUserId = '';
  contextMenuStyles: any = {};
  paginationActivePage = 1;
  _loadAdditionalDocumentData = false;
  set loadAdditionalDocumentData(val: boolean) {
    this._loadAdditionalDocumentData = val;
    if (val) {
      let clonedData:IItem[] =[];
      for (let i=0;i<this.data.length; i++){
        clonedData.push(Object.assign({}, this.data[i]));
      }
      this.loadAdditionalData(clonedData);
    }
  }
  get loadAdditionalDocumentData() {
    return this._loadAdditionalDocumentData;
  }

  people: EcmUserModel[] | undefined;

  stats : ITaskSmartTableComponentStats = {num:0,sumGrossAmountCents:0,sumGrossAmountVerifiedCents:0};
  taskSmartTableHeader = new TaskSmartTableHeader();
  labels : (string | IColumn)[] = [];
  data : IItem[] = [];

  radioOptionsTaskCategory : ITaskSmartTableComponentRadioOption[] = [
    {formControlName: 'formControlTaskCategory', key:'docs', label:'Dokumente', tooltip:'Filter nach Aufgaben Kategorie: Nur Dokument Aufgaben', filter: `B.mrbt:category >= ${EMRBauTaskCategory.NewDocumentStart} AND B.mrbt:category <= ${EMRBauTaskCategory.NewDocumentLast}`},
    {formControlName: 'formControlTaskCategory', key:'all',label:'Alle', tooltip:'Alle Aufgaben'}];
  radioOptionsUser : ITaskSmartTableComponentRadioOption[] = [
    {formControlName: 'formControlUser', key:'my', label:'Meine', tooltip:'Filter nach zugewiesener Personengruppe.'},
    {formControlName: 'formControlUser', key:'a', label:'Team-A', tooltip:'Filter nach zugewiesener Personengruppe.', filter_pre: "B.mrbt:assignedUserName = '", filter_suc: "' ", contextMenu: true, loadData : this.loadDataUsers.bind(this)},
    {formControlName: 'formControlUser', key:'b', label:'Team-B', tooltip:'Filter nach zugewiesener Personengruppe.', filter_pre: "B.mrbt:assignedUserName = '", filter_suc: "' ", contextMenu: true, loadData : this.loadDataUsers.bind(this)},
    {formControlName: 'formControlUser', key:'all', label:'Alle', tooltip:'Filter nach zugewiesener Personengruppe.'}];
  radioOptionsKT : ITaskSmartTableComponentRadioOption[]= [
    {formControlName: 'formControlKT', key:'a', label:'Gruppe-1', tooltip:'Filter nach KT/KS-Gruppe.', filter_pre: "C.mrba:costCarrierNumber = '", filter_suc: "' ", contextMenu: true, loadData : this.loadDataKT.bind(this)},
    {formControlName: 'formControlKT', key:'b', label:'Gruppe-2', tooltip:'Filter nach KT/KS-Gruppe.', filter_pre: "C.mrba:costCarrierNumber = '", filter_suc: "' ", contextMenu: true, loadData : this.loadDataKT.bind(this)},
    {formControlName: 'formControlKT', key:'c', label:'Gruppe-%', tooltip:'Filter nach KT/KS-Gruppe.', filter_pre: "C.mrba:costCarrierNumber LIKE '", filter_suc: "' ", contextMenu: true, staticData: this.staticDataKT},
    {formControlName: 'formControlKT', key:'all', label:'Alle', tooltip:'Filter nach KT/KS-Gruppe.'}];
  formGroup = new FormGroup({
    formControlTaskCategory: new FormControl(this.radioOptionsTaskCategory[0].key),
    formControlUser: new FormControl(this.radioOptionsUser[0].key),
    formControlKT: new FormControl(this.radioOptionsKT[0].key),
  });

  constructor(
    private mrbauCommonService : MrbauCommonService,
    private searchService: SearchService,
    private mrbauDbService : MrbauDbService,
    private mrbauPreferencesService : MrbauPreferencesService,
  ) {
  }

  async ngOnInit(): Promise<void> {
    const user = await this.mrbauCommonService.getCurrentUser()
    if (user) {
      this.currentUserId = user.entry.id;
      this.radioOptionsUser.filter(item => item.key == 'my')[0]['filter'] =  `B.mrbt:assignedUserName = '${this.currentUserId}'`;
    }
    this.people = await this.mrbauCommonService.getPeopleObservable().toPromise();
    this.restorePreferences();
    this.loadData();
  }

  ngOnDestroy(): void {
    this.storePreferences();
  }

  readonly PREFERENCES_KEY = 'mrbau_task_smart_table';
  preferences : any = {};
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
    this.preferences['columnSettings.list'] = this.taskSmartTableHeader.currentColumns;
  }
  setTableHeader() {
    const colPref = this.preferences['columnSettings.list'];
    if (colPref && colPref.length > 0) {
      this.taskSmartTableHeader.setColumns(colPref)
    }
    else {
      this.taskSmartTableHeader.setDefaultColumns();
    }
    this.labels = this.taskSmartTableHeader.labels;
  }
  generatePreferences() {
    this.preferences = {};
    this.getFormControlValue('formControlTaskCategory');
    this.getFormControlValue('formControlUser');
    this.getFormControlValue('formControlKT');
    this.getRadioOptionFilter(this.radioOptionsUser, 'radioOptionsUser', 'a');
    this.getRadioOptionFilter(this.radioOptionsUser, 'radioOptionsUser', 'b');
    this.getRadioOptionFilter(this.radioOptionsKT, 'radioOptionsKT', 'a');
    this.getRadioOptionFilter(this.radioOptionsKT, 'radioOptionsKT', 'b');
    this.getRadioOptionFilter(this.radioOptionsKT, 'radioOptionsKT', 'c');
    this.getTableHeader();
  }
  applyPreferences(){
    this.setRadioOptionFilter(this.radioOptionsUser, 'radioOptionsUser', 'a');
    this.setRadioOptionFilter(this.radioOptionsUser, 'radioOptionsUser', 'b');
    this.setRadioOptionFilter(this.radioOptionsKT, 'radioOptionsKT', 'a');
    this.setRadioOptionFilter(this.radioOptionsKT, 'radioOptionsKT', 'b');
    this.setRadioOptionFilter(this.radioOptionsKT, 'radioOptionsKT', 'c');
    // order is important! set radio options first and form control values second
    this.setFormControlValue(this.radioOptionsTaskCategory, 'formControlTaskCategory');
    this.setFormControlValue(this.radioOptionsUser, 'formControlUser');
    this.setFormControlValue(this.radioOptionsKT, 'formControlKT');
    this.setTableHeader();
  }
  storePreferences() {
    this.generatePreferences();
    this.mrbauPreferencesService.setItem(this.PREFERENCES_KEY, this.preferences);
  }
  restorePreferences() {
    const preferences = this.mrbauPreferencesService.getItem(this.PREFERENCES_KEY);
    if (preferences) {
      this.preferences = preferences;
    }
    this.applyPreferences();
  }

  onRightClick(event:any, option:ITaskSmartTableComponentRadioOption) {
    event.preventDefault();
    if (option.contextMenu)
    {
      this.contextMenu.show({title:event.target.textContent, event:event, sortByName:true, sortChecked:true, payload: option, initial_checked: option.contextMenuResult?.list, staticData : option.staticData, loadData: option.loadData, callback: this.contextMenuCallback.bind(this)});
    }
  }

  onAdjustColumnsClick(event:any) {
    event.preventDefault();
    this.contextMenu.show({title:"Spalten Anpassen", event:event, payload: this.taskSmartTableHeader, initial_checked: this.taskSmartTableHeader.currentColumns, loadData: this.taskSmartTableHeader.loadContextMenuData.bind(this.taskSmartTableHeader), callback:this.contextMenuTableHeaderCallback.bind(this), sortByName:false, sortChecked:false });
  }

  private cachedUsers: IContextMenuListItem[] | undefined;
  loadDataUsers() : Promise<IContextMenuListItem[] | undefined>
  {
    if (this.cachedUsers) {
      return Promise.resolve(this.cachedUsers);
    }
    return new Promise<IContextMenuListItem[] | undefined>(async (resolve) =>
    {
      let list : IContextMenuListItem[] = [];
      const people = this.people || await this.mrbauCommonService.getPeopleObservable().toPromise();
      if (!people) {
        resolve(undefined);
        return;
      }
      for (let i=0; i<people.length;i++) {
        const user = people[i];
        list.push({id: user.id, name: (user.firstName || '')+' '+(user.lastName || ''), visible:true, checked:false});
      }
      this.cachedUsers = list;
      resolve(list);
      return;
    });
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

  contextMenuTableHeaderCallback(data:IContextMenuResult) {
    if (data.payload) {
      const header : TaskSmartTableHeader = data.payload
      header.setColumns(data.list);
      this.labels = this.taskSmartTableHeader.labels;
      this.storePreferences();
    }
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
    this.changeRadioValue( option);
  }

  changeRadioValue(radioOption: ITaskSmartTableComponentRadioOption): void {
    this.setRadioValue(radioOption);
    this.storePreferences();
    this.loadData();
  }
  setRadioValue(radioOption: ITaskSmartTableComponentRadioOption): void {
    const obj : any = {};
    obj[radioOption.formControlName] = radioOption.key;
    this.formGroup.patchValue(obj);
    if (radioOption.filter) {
      this.additionalFilter[radioOption.formControlName] = radioOption.filter;
    }
    else {
      delete this.additionalFilter[radioOption.formControlName];
    }
  }

  additionalFilter : any = {}
  // Alle Aufgaben / Dokumentaufgaben
  // Meine, Mein Team 1, Team 2, Team3, Alle
  // Gruppe 1/ Gruppe 2/ Gruppe 3 / Alle

  async loadData() {
    this.loaderVisible = true;
    this.errorMessage = null;
    const filters = Object.values(this.additionalFilter);
    //filters = ["C.mrba:costCarrierNumber LIKE '11%'"];
    let filter = '';
    for (let i=0; i< filters.length; i++) {
      filter += 'AND ('
      filter += filters[i];
      filter += ') '
    }

    const searchRequest : SearchRequest = {
      query: {
        query:`SELECT * FROM mrbt:task A JOIN mrbt:taskCoreDetails B ON A.cmis:objectId = B.cmis:objectId JOIN mrba:costCarrierDetails C ON A.cmis:objectId = C.cmis:objectId `+
        `WHERE B.mrbt:status >= 0 AND B.mrbt:status < ${EMRBauTaskStatus.STATUS_NOTIFY_DONE} AND B.mrbt:status <> ${EMRBauTaskStatus.STATUS_PAUSED} `+
        filter+
        `ORDER BY B.cmis:creationDate DESC`,
        language: 'cmis'
      },
      include: ['properties',
        //'aspectNames'
        ]
    };
    searchRequest.paging = {
      skipCount: 0,
      maxItems: 999,
    }

    try {
      const nodePaging = await this.searchService.searchByQueryBody(searchRequest).toPromise();
      const entries = nodePaging!.list!.entries;
      const data : IItem[] = [];
      for (let i=0; i< entries!.length; i++)
      {
        const nodeEntry = entries![i];
        let task = new MRBauTask();
        task.updateWithNodeData(nodeEntry.entry as Node);
        let row : any = {'id':task.id, 'desc':task.desc, 'statusId':task.status, 'status':task.getStateLabel(), 'company':task.companyName, 'kt':task.costCarrierNumber, 'assigned':task.assignedUserName,'dokumentId':task.associatedDocumentRef[0],'dokumentName':task.associatedDocumentName[0], 'createdDate':(new Date(task.createdDate!))};

        const today = new Date();
        if (task.dueDateValue) {
          row['dueDateValue'] =new Date(task.dueDateValue!);
          row['daysUntilDue'] = Math.round((endOfDay(row['dueDateValue']).getTime() - endOfDay(today).getTime()) / (1000 * 3600 * 24));
          row['daysUntilDueTotal'] = Math.round((endOfDay(row['dueDateValue']).getTime() - endOfDay(row['createdDate']).getTime()) / (1000 * 3600 * 24));
        }
        else
        {
          row['dueDateValue'] = null;
          row['daysUntilDue'] = '-';
          row['daysUntilDueTotal'] = '-';
        }
        data.push(row);
      };

      // replace user id with user display name
      const people = this.people || await this.mrbauCommonService.getPeopleObservable().toPromise();
      if (people) {
        for (let i=0; i<data.length; i++) {
          const d = data[i];
          const f = people.filter(val => val.id == d.assigned)
          if (f.length>0) {
            d.assigned = (f[0].firstName || '')+' '+(f[0].lastName || '');
          }
        }
      }

      await this.loadAdditionalData(data);

      this.data = data;
    }
    catch(error) {
      console.log(error);
    }
    this.paginationActivePage = 1;
    this.loaderVisible = false;
  }

  /*
  async loadAdditionalData(data : IItem[]) {
    if (this.loadAdditionalDocumentData === false)
    {
      return;
    }

    this.loaderVisible = true;
    this.errorMessage = null;
    try {
      let filter = ''
      for (let i=0; i<data.length;i++) {
        filter += (i==0) ? "WHERE " : "OR ";
        filter += `cmis:objectId = '${data[i].dokumentId}'`;
      }

      const searchRequest : SearchRequest = {
        query: {
          query: "SELECT * FROM cmis:document "+filter,
          language: 'cmis'
        },
        include: ['properties']
      };
      searchRequest.paging = {
        skipCount: 0,
        maxItems: 999,
      }

      const nodePaging = await this.searchService.searchByQueryBody(searchRequest).toPromise();
      const entries = nodePaging!.list!.entries;
      if (entries == undefined)
      {
        return;
      }
      for (let i=0; i< entries.length; i++)
      {
        const node = entries[i].entry;
        const row = data.find(val => val.dokumentId == node.id);
        if (row) {
          if (row.desc == 'Dokument - Rechnung') {
            const node = await this.mrbauCommonService.getNode(row.dokumentId, {include: CONST.GET_NODE_DEFAULT_INCLUDE}).toPromise();
            row['dokumentName'] = node?.entry['name'];
            row['grossAmountCents'] = ((node?.entry.properties['mrba:grossAmountCents'] || 0));
            row['grossAmountVerifiedCents'] = ((node?.entry.properties['mrba:grossAmountVerifiedCents'] || 0));
            row['dokumentArchivedDate'] = new Date(node?.entry.properties['mrba:archivedDateValue']!);
            row['dokumentDate'] = (node?.entry.properties['mrba:documentDateValue'] ? new Date(node?.entry.properties['mrba:documentDateValue']) : '');
            row['dokumentNumber'] = ((node?.entry.properties['mrba:documentNumber'] || '-'));
          }
          else {
            row['grossAmountCents'] = '-';
            row['grossAmountVerifiedCents'] = '-';
            row['dokumentArchiveDate'] = '';
            row['dokumentDate'] = '';
            row['dokumentNumber'] = '-';
          }
        }
      }
      this.data = data;
    } catch(error) {
      console.log(error);
    }
    this.loaderVisible = false;
  }*/

  async loadAdditionalData(data : IItem[]) {
    this.loaderVisible = true;
    this.errorMessage = null;
    try {
      if (this.loadAdditionalDocumentData === true)
        {
          for (let i=0; i<data.length; i++) {
            const row = data[i];
            if (row.desc == 'Dokument - Rechnung') {
              const node = await this.mrbauCommonService.getNode(row.dokumentId, {include: CONST.GET_NODE_DEFAULT_INCLUDE}).toPromise();
              row['dokumentName'] = node?.entry['name'];
              row['grossAmountCents'] = ((node?.entry.properties['mrba:grossAmountCents'] || 0));
              row['grossAmountVerifiedCents'] = ((node?.entry.properties['mrba:grossAmountVerifiedCents'] || 0));
              row['dokumentArchivedDate'] = new Date(node?.entry.properties['mrba:archivedDateValue']!);
              row['dokumentDate'] = (node?.entry.properties['mrba:documentDateValue'] ? new Date(node?.entry.properties['mrba:documentDateValue']) : '');
              row['dokumentNumber'] = ((node?.entry.properties['mrba:documentNumber'] || '-'));
            }
            else {
              row['grossAmountCents'] = '-';
              row['grossAmountVerifiedCents'] = '-';
              row['dokumentArchiveDate'] = '';
              row['dokumentDate'] = '';
              row['dokumentNumber'] = '-';
            }
          }
        }
        this.data = data;
      }
    catch(error) {
      console.log(error);
    }
    this.loaderVisible = false;
  }

  itemsPerPageChange(event:number) {
    event;
  }

  filteredItemsChange(event:any[]) {
    this.stats.num = event.length;
    let sum1 = 0;
    let sum2 = 0;
    for (let i=0; i< event.length; i++) {
      const item = event[i];
      sum1 += (isNaN(item['grossAmountCents'])) ? 0 : +item['grossAmountCents'];
      sum2 += (isNaN(item['grossAmountVerifiedCents'])) ? 0 : +item['grossAmountVerifiedCents'];
    }
    this.stats.sumGrossAmountCents = sum1;
    this.stats.sumGrossAmountVerifiedCents = sum2;
  }


  viewerNodeId : string | undefined = undefined;
  showViewer = false;
  async viewFile(id:string) {
    this.viewerNodeId = id;
    this.showViewer = true;
  }
  viewerOnClose() {
    this.showViewer = false;
    this.viewerNodeId = undefined;
  }

  openTaskLink(item: IItem, newTab = false) {
    if (newTab) {
      const path = window.location.origin+'/#/tasks/'+ item.id;
      window.open(path, '_blank', 'width=800,height=600');
    }
    else {
      this.router.navigate(['/tasks/', item.id]);
    }
  }
  getColor(prio: number | undefined) : string {
    return TaskIndicatorComponent.getColor(prio);
  }

  details_visible = Object.create({});
  toggleDetails(item: any) {
    this.details_visible[item] = !this.details_visible[item];
  }

  // dropdown multiselect, date filter: general
  private _columnFilterValue: any = {};
  set columnFilterValue(value) {
    this._columnFilterValue = { ...value };
  }
  get columnFilterValue() {
    return this._columnFilterValue;
  }
  // dropdown multiselect, date filter: createdDate
  calendarCreationDate: Date = new Date();
  private _startCreationDate: Date | null = null;
  set startCreationDate(value) {
    this._startCreationDate = value;
    if (this._endCreationDate) {
      this.handleCreationDateRangeChange();
    }
  }
  get startCreationDate() {
    return this._startCreationDate;
  }
  private _endCreationDate: Date | null = null;
  set endCreationDate(value) {
    this._endCreationDate = value;
    this.handleCreationDateRangeChange();
  }
  get endCreationDate() {
    return this._endCreationDate;
  }

  handleCreationDateRangeChange() {
    const columnFilterValue = { ...this.columnFilterValue };
    if (this._startCreationDate && this._endCreationDate) {
      const fromCreationDate = startOfDay(this._startCreationDate);
      const toCreationDate = endOfDay(this._endCreationDate);
      const creationFilterFunction = (item: any) => {
        const date = new Date(item);
        return date >= fromCreationDate && date <= toCreationDate;
      };
      this.columnFilterValue = { ...columnFilterValue, createdDate: creationFilterFunction };
      return;
    }

    delete columnFilterValue.createdDate;
    this.columnFilterValue = { ...columnFilterValue };
  }

  // dropdown multiselect, date filter: dueDateValue
  calendarDueDateValue: Date = new Date();
  private _startDueDateValue: Date | null = null;
  set startDueDateValue(value) {
    this._startDueDateValue = value;
    if (this._endDueDateValue) {
      this.handleDueDateValueRangeChange();
    }
  }
  get startDueDateValue() {
    return this._startDueDateValue;
  }
  private _endDueDateValue: Date | null = null;
  set endDueDateValue(value) {
    this._endDueDateValue = value;
    this.handleDueDateValueRangeChange();
  }
  get endDueDateValue() {
    return this._endDueDateValue;
  }

  handleDueDateValueRangeChange() {
    const columnFilterValue = { ...this.columnFilterValue };
    if (this._startDueDateValue && this._endDueDateValue) {
      const fromCreationDate = startOfDay(this._startDueDateValue);
      const toCreationDate = endOfDay(this._endDueDateValue);
      const creationFilterFunction = (item: any) => {
        const date = new Date(item);
        return date >= fromCreationDate && date <= toCreationDate;
      };
      this.columnFilterValue = { ...columnFilterValue, dueDateValue: creationFilterFunction };
      return;
    }
    delete columnFilterValue.dueDateValue;
    this.columnFilterValue = { ...columnFilterValue };
  }

  // dropdown multiselect, date filter: dokumentArchivedDate
  calendarDokumentArchivedDate: Date = new Date();
  private _startDokumentArchivedDate: Date | null = null;
  set startDokumentArchivedDate(value) {
    this._startDokumentArchivedDate = value;
    if (this._endDokumentArchivedDate) {
      this.handleDokumentArchivedDateRangeChange();
    }
  }
  get startDokumentArchivedDate() {
    return this._startDokumentArchivedDate;
  }
  private _endDokumentArchivedDate: Date | null = null;
  set endDokumentArchivedDate(value) {
    this._endDokumentArchivedDate = value;
    this.handleDokumentArchivedDateRangeChange();
  }
  get endDokumentArchivedDate() {
    return this._endDokumentArchivedDate;
  }

  handleDokumentArchivedDateRangeChange() {
    const columnFilterValue = { ...this.columnFilterValue };
    if (this._startDokumentArchivedDate && this._endDokumentArchivedDate) {
      const fromCreationDate = startOfDay(this._startDokumentArchivedDate);
      const toCreationDate = endOfDay(this._endDokumentArchivedDate);
      const creationFilterFunction = (item: any) => {
        const date = new Date(item);
        return date >= fromCreationDate && date <= toCreationDate;
      };
      this.columnFilterValue = { ...columnFilterValue, dokumentArchivedDate: creationFilterFunction };
      return;
    }
    delete columnFilterValue.dokumentArchivedDate;
    this.columnFilterValue = { ...columnFilterValue };
  }

  // dropdown multiselect, date filter: dokumentDate
  calendarDokumentDate: Date = new Date();
  private _startDokumentDate: Date | null = null;
  set startDokumentDate(value) {
    this._startDokumentDate = value;
    if (this._endDokumentDate) {
      this.handleDokumentDateRangeChange();
    }
  }
  get startDokumentDate() {
    return this._startDokumentDate;
  }
  private _endDokumentDate: Date | null = null;
  set endDokumentDate(value) {
    this._endDokumentDate = value;
    this.handleDokumentDateRangeChange();
  }
  get endDokumentDate() {
    return this._endDokumentDate;
  }

  handleDokumentDateRangeChange() {
    const columnFilterValue = { ...this.columnFilterValue };
    if (this._startDokumentDate && this._endDokumentDate) {
      const fromCreationDate = startOfDay(this._startDokumentDate);
      const toCreationDate = endOfDay(this._endDokumentDate);
      const creationFilterFunction = (item: any) => {
        const date = new Date(item);
        return date >= fromCreationDate && date <= toCreationDate;
      };
      this.columnFilterValue = { ...columnFilterValue, dokumentDate: creationFilterFunction };
      return;
    }
    delete columnFilterValue.dokumentDate;
    this.columnFilterValue = { ...columnFilterValue };
  }

  getColClass(item: string) : NgCssClass {
    return TaskSmartTableHeader.getColClass(item);
  }
}
