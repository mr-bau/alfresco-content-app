import { IColumn, NgCssClass } from '@coreui/angular-pro';
import { IContextMenuListItem } from '../util/context-menu.component';

export class TaskSmartTableHeader {
  static allColumns : IColumn[] = [
    {key:'id', label:'AufgabeId', _style: { width: '5%' }, _classes: 'text-center'},
    {key:'desc', label:'Aufgabe', _style: { width: '5%' }, _classes: 'text-center'},
    {key:'statusId', label:'StatusId', _style: { width: '5%' }, _classes: 'text-center', _colClass: 'text-end'},
    {key:'status', label:'Status', _style: { width: '5%' }, _classes: 'text-center'},
    {key:'company', label:'Firma', _style: { width: '10%' }, _classes: 'text-center'},
    {key:'kt', label:'KT/KS', _style: { width: '5%' }, _classes: 'text-center', _colClass: 'text-end'},
    {key:'assigned', label:'Zugewiesen', _style: { width: '5%' }, _classes: 'text-center'},
    {key:'dokumentId', label:'DokumentId', _style: { width: '5%' }, _classes: 'text-center'},
    {key:'dokumentName', label:'DokumentName', _style: { width: '15%' }, _classes: 'text-center'},
    {key:'dokumentArchivedDate', label:'Eingangs-Datum', _style: { width: '5%' }, _classes: 'text-center', _colClass: 'text-end'},
    {key:'dokumentDate', label:'Rechnungs-Datum', _style: { width: '5%' }, _classes: 'text-center', _colClass: 'text-end'},
    {key:'dokumentNumber', label:'Rechnungs-Nummer', _style: { width: '5%' }, _classes: 'text-center', _colClass: 'text-end'},
    {key:'createdDate', label:'erzeugt', _style: { width: '5%' }, _classes: 'text-center', _colClass: 'text-end',
      sorter: (itemA, itemB) => {
        const a = itemA.createdDate.getTime()/1000;
        const b = itemB.createdDate.getTime()/1000;
        return a > b ? 1 : b > a ? -1 : 0;
      }
    },
    {key:'dueDateValue', label:'zu erledigen bis', _style: { width: '5%' }, _classes: 'text-center', _colClass: 'text-end',
      sorter: (itemA, itemB) => {
        const a = itemA.dueDateValue.getTime()/1000;
        const b = itemB.dueDateValue.getTime()/1000;
        return a > b ? 1 : b > a ? -1 : 0;
      }
    },
    {key:'grossAmountCents', label:'Brutto', _style: { width: '5%' }, _classes: 'text-center', _colClass: 'text-end',
      sorter: (itemA , itemB) => {
        const a = (typeof itemA.grossAmountCents === 'string') ? 0 : itemA.grossAmountCents
        const b = (typeof itemB.grossAmountCents === 'string') ? 0 : itemB.grossAmountCents
        return a > b ? 1 : b > a ? -1 : 0;
      }
    },
    {key:'grossAmountVerifiedCents', label:'Brutto gpr.', _style: { width: '5%' }, _classes: 'text-center', _colClass: 'text-end',
      sorter: (itemA , itemB) => {
        const a = (typeof itemA.grossAmountVerifiedCents === 'string') ? 0 : itemA.grossAmountVerifiedCents
        const b = (typeof itemB.grossAmountVerifiedCents === 'string') ? 0 : itemB.grossAmountVerifiedCents
        return a > b ? 1 : b > a ? -1 : 0;
      }
    },
    {key:'daysUntilDueTotal', label:'Frist Urspr.', _style: { width: '5%' }, _classes: 'text-center', _colClass: 'text-end'},
    {key:'daysUntilDue', label:'Frist', _style: { width: '5%' }, _classes: 'text-center', _colClass: 'text-end'},
    {key:'details', label: 'Details', _style: { width: '5%' }, filter: false, sorter: false, _classes: 'text-center', _colClass: 'text-end'},
  ];

  currentColumns : string[] = [];

  labels : IColumn[] = [];

  static getColClass(item: string) : NgCssClass
  {
    const entry = this.allColumns.find(entry => {
      return (entry.key == item)
    });

    return (entry && entry['_colClass']) ? entry['_colClass'] : '';
  }

  setDefaultColumns() {
    this.currentColumns = ['desc', 'status','company','kt','assigned','daysUntilDue','details'];
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
    this.labels = TaskSmartTableHeader.allColumns.filter(item => this.currentColumns.indexOf(item.key!) >= 0);
  }

  loadContextMenuData() : Promise<IContextMenuListItem[]>
  {
    return new Promise<IContextMenuListItem[]>(async (resolve) =>
    {
      let list : IContextMenuListItem[] = [];
      for (let i=0; i<TaskSmartTableHeader.allColumns.length; i++) {
        const item = TaskSmartTableHeader.allColumns[i];
        const checked = (this.currentColumns.indexOf(item.key!) >= 0);
        list.push({id: item.key!, name: ''+item.label, visible:true, checked:checked});
      }
      resolve(list);
      return;
    });
  }
}
