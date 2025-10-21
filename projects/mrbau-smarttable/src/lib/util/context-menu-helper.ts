import { IContextMenuListItem, IContextMenuResult } from './context-menu.component';

export interface ITaskSmartTableComponentStats {
  num : number,
  sumGrossAmountCents : number,
  sumGrossAmountVerifiedCents : number,
}

export interface ITaskSmartTableComponentRadioOption {
  formControlName : string,
  key : string,
  label : string,
  tooltip: string,
  filter?: string,
  filter_pre?: string,
  filter_suc?: string,
  contextMenu?: boolean,
  contextMenuResult? : IContextMenuResult,
  staticData?: IContextMenuListItem[],
  loadData?: () => Promise<IContextMenuListItem[] | undefined>,
}



