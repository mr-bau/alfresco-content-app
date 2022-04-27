import { SearchOptions} from '@alfresco/adf-core';
// eslint-disable-next-line
export enum EMRBauTaskCategory {
  Uninitialized     =   0,

  CommonTaskStart   = 100,
  CommonTaskInfo    = 101,
  CommonTaskApprove = 102,
  //...
  CommonTaskLast    = 199,

  NewDocumentStart  = 200,
  NewDocument       = 201,
  //...
  NewDocumentLast   = 299,

  InvoiceAuditStart = 300,
  InvoiceAudit      = 301,
  //...
  InvoiceAuditLast  = 399,
}
export class MRBauTask {
  public static readonly STATUS_NEW: 0;
  public static readonly STATUS_FINISHED: -1;

  category: EMRBauTaskCategory.Uninitialized;
  desc: string = null; // description
  fullDescription: string; // long task description
  assignedUser: string = null; // currently assigned user
  startDate: number = 0;   // start date
  status: number = MRBauTask.STATUS_NEW;
  documentAssociations: Map<string, string> = new Map();// map id -> Name
  // log transaction log TODO
}

/**
 *
 */
export interface IMRBauTasksCategory {
  tabIcon: string;
  tabName: string;
  tabBadge: number;

  searchQuery: string;
  searchOptions: SearchOptions;
}
