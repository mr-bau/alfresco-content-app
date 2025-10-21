import { IColumn } from '@coreui/angular-pro';
import { IContextMenuListItem } from '../util/context-menu.component';

export class TaskSmartTableHeader {
  static allColumns : IColumn[] = [
    {key:'id', label:'AufgabeId', _style: { width: '5%' }},
    {key:'desc', label:'Aufgabe', _style: { width: '5%' }},
    {key:'statusId', label:'StatusId', _style: { width: '5%' }},
    {key:'status', label:'Status', _style: { width: '5%' }},
    {key:'company', label:'Firma', _style: { width: '10%' }},
    {key:'kt', label:'KT/KS', _classes: 'text-end', _style: { width: '5%' }},
    {key:'assigned', label:'Zugewiesen', _style: { width: '5%' }},
    {key:'dokumentId', label:'DokumentId', _style: { width: '5%' }},
    {key:'dokumentName', label:'DokumentName', _style: { width: '15%' }},
    {key:'dokumentArchivedDate', label:'Eingangs-Datum', _style: { width: '5%' }},
    {key:'dokumentDate', label:'Rechnungs-Datum', _style: { width: '5%' }},
    {key:'dokumentNumber', label:'Rechnungs-Nummer', _style: { width: '5%' }},
    {key:'createdDate', label:'erzeugt', _classes: 'text-end', _style: { width: '5%' },
      sorter: (itemA, itemB) => {
        const a = itemA.createdDate.getTime()/1000;
        const b = itemB.createdDate.getTime()/1000;
        return a > b ? 1 : b > a ? -1 : 0;
      }
    },
    {key:'dueDateValue', label:'zu erledigen bis', _classes: 'text-end', _style: { width: '5%' },
      sorter: (itemA, itemB) => {
        const a = itemA.dueDateValue.getTime()/1000;
        const b = itemB.dueDateValue.getTime()/1000;
        return a > b ? 1 : b > a ? -1 : 0;
      }
    },
    {key:'grossAmountCents', label:'Brutto', _classes: 'text-end', _style: { width: '5%' },
      sorter: (itemA , itemB) => {
        const a = (typeof itemA.grossAmountCents === 'string') ? 0 : itemA.grossAmountCents
        const b = (typeof itemB.grossAmountCents === 'string') ? 0 : itemB.grossAmountCents
        return a > b ? 1 : b > a ? -1 : 0;
      }
    },
    {key:'grossAmountVerifiedCents', label:'Brutto gpr.', _classes: 'text-end', _style: { width: '5%' },
      sorter: (itemA , itemB) => {
        const a = (typeof itemA.grossAmountVerifiedCents === 'string') ? 0 : itemA.grossAmountVerifiedCents
        const b = (typeof itemB.grossAmountVerifiedCents === 'string') ? 0 : itemB.grossAmountVerifiedCents
        return a > b ? 1 : b > a ? -1 : 0;
      }
    },
    {key:'daysUntilDueTotal', label:'Frist Urspr.', _classes: 'text-end', _style: { width: '5%' } },
    {key:'daysUntilDue', label:'Frist', _classes: 'text-end', _style: { width: '5%' } },
    {key:'details', label: 'Details', _style: { width: '5%' }, filter: false, sorter: false, _classes: 'text-end'},
  ];

  currentColumns : string[] = [];

  labels : IColumn[] = [];

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
