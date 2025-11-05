import { IColumn, NgCssClass } from '@coreui/angular-pro';
import { IContextMenuListItem } from '../util/context-menu.component';

export interface IDocs {
  id: string;
  dokumentName: string;
}

export type IDocColumn = IColumn & {
  sorterKey? : string,
  filterName? : string,
}

export class DocSmartTableHeader {
  static allColumns : IDocColumn[] = [
    {key:'id', label:'Id', _style: { width: '5%' }, sorter: false, filterName : 'sys:node-uuid', _classes: 'text-center'},
    {key:'dokumentName', label:'Name', _style: { width: '10%' }, sorterKey: 'name', filterName : 'name', _classes: 'text-center'},
    {key:'nodeType', label:'Art', _style: { width: '5%' }, sorter: false, filterName : '=TYPE', _classes: 'text-center'},
    {key:'organisationUnit', label:'Mandant', _style: { width: '5%' }, sorterKey: 'mrba:organisationUnit', filterName : 'mrba:organisationUnit', _classes: 'text-center'},
    {key:'companyName', label:'Firma', _style: { width: '10%' }, sorterKey: 'mrba:companyName', filterName : 'mrba:companyName', _classes: 'text-center'},
    {key:'costCarrierNumber', label:'KT/KS', _style: { width: '5%' }, sorterKey: 'mrba:costCarrierNumber', filterName : 'mrba:costCarrierNumber', _classes: 'text-center', _colClass: 'text-end'},
    {key:'project', label:'Projekt', _style: { width: '5%' }, sorterKey: 'mrba:projectName', filterName : 'mrba:projectName', _classes: 'text-center'},
    {key:'documentNumber', label:'Beleg-Nummer', _style: { width: '5%' }, sorterKey: 'mrba:documentNumber', filterName : 'mrba:documentNumber', _classes: 'text-center', _colClass: 'text-end'},
    {key:'tags', label:'Tags', _style: { width: '5%' }, sorter: false, filterName : 'TAG', _classes: 'text-center', _colClass: 'text-end'},
    {key:'creator', label:'Ersteller', _style: { width: '5%' }, sorter: false, filterName : 'creator', _classes: 'text-center'},
    {key:'organisationPosition', label:'AG/AN', _style: { width: '5%' }, sorterKey: 'mrba:organisationPosition', filterName : 'mrba:organisationPosition', _classes: 'text-center'},
    {key:'signingStatus', label:'Signatur-Status', _style: { width: '5%' }, sorterKey: 'mrba:signingStatus', filterName : 'mrba:signingStatus', _classes: 'text-center'},
    {key:'created', label:'Erzeugt', _style: { width: '5%' }, sorterKey: 'created', filterName : 'created', _classes: 'text-center', _colClass: 'text-end'},
    {key:'archivedDateValue', label:'Eingangs-Datum', _style: { width: '5%' }, sorterKey: 'mrba:archivedDateValue', filterName : 'mrba:archivedDateValue', _classes: 'text-center', _colClass: 'text-end'},
    {key:'documentDateValue', label:'Beleg-Datum', _style: { width: '5%' }, sorterKey: 'mrba:documentDateValue', filterName : 'mrba:documentDateValue', _classes: 'text-center', _colClass: 'text-end'},
    {key:'details', label: 'Details', _style: { width: '5%' }, filter: false, sorter: false, _classes: 'text-center', _colClass: 'text-end'},
  ];

  static getColClass(item: string) : NgCssClass
  {
    const entry = this.allColumns.find(entry => {
      return (entry.key == item)
    });

    return (entry && entry['_colClass']) ? entry['_colClass'] : '';
  }

  static getSorterKey(key : string) {
    const item = DocSmartTableHeader.allColumns.find(item => item.key == key);
    return (item && item.sorterKey) ? item.sorterKey : key;
  }

  static getFilterName(key : string) {
    const item = DocSmartTableHeader.allColumns.find(item => item.key == key);
    return (item && item.filterName) ? item.filterName : key;
  }

  currentColumns : string[] = [];

  columns : IColumn[] = [];

  setDefaultColumns() {
    this.currentColumns = ['dokumentName', 'nodeType', 'companyName', 'costCarrierNumber', 'project','tags', 'details'];
    this.setLabelsFromCurrentColumns();
  }
  setColumns(newColumns: string[]) {
    if (newColumns.length == 0) {
      this.setDefaultColumns();
    }
    else {
      this.currentColumns = newColumns;
      this.setLabelsFromCurrentColumns();
    }
  }
  setLabelsFromCurrentColumns() {
    this.columns = DocSmartTableHeader.allColumns.filter(item => this.currentColumns.indexOf(item.key!) >= 0);
  }

  loadContextMenuData() : Promise<IContextMenuListItem[]>
  {
    return new Promise<IContextMenuListItem[]>(async (resolve) =>
    {
      let list : IContextMenuListItem[] = [];
      for (let i=0; i<DocSmartTableHeader.allColumns.length; i++) {
        const item = DocSmartTableHeader.allColumns[i];
        const checked = (this.currentColumns.indexOf(item.key!) >= 0);
        list.push({id: item.key!, name: ''+item.label, visible:true, checked:checked});
      }
      resolve(list);
      return;
    });
  }
}
