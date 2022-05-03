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

export interface IMRBauTaskListEntry {
  id:string;
  desc:string;
  createdUser:string;
  assignedUser:string;
  createdDate: Date;
  dueDate: Date;
  status: number;
  icon:string;
}
export class MRBauTask {

  //category: EMRBauTaskCategory.Uninitialized;
  //desc: string = null; // description
  //fullDescription?: string; // long task description
  //createdUser?: string; // currently assigned user
  //createdDate?: number;   // start date
  //assignedUser?: string; // currently assigned user
  //dueDate?: number;
  //status: number = MRBauTask.STATUS_NEW;
  //documentAssociations: Map<string, string> = new Map();// map id -> Name

  // TODO transaction log

  public static readonly STATUS_NEW: 0;
  public static readonly STATUS_FINISHED: -1;

  constructor(
    private _category : EMRBauTaskCategory = EMRBauTaskCategory.Uninitialized,
    private _desc : string = "?",
    private _fullDescription ?: string,
    private _createdUser ?: string,
    private _createdDate ?: Date,
    private _assignedUser ?: string,
    private _dueDate ?: Date,
    private _status : number = MRBauTask.STATUS_NEW,
    private _documentAssociations : Map<string, string> = new Map()
    )
  {
  }

  get category() {
    return this._category;
  }
  set category(value : EMRBauTaskCategory) {
    this._category = value;
  }

  get desc() {
    return this._desc;
  }
  set desc(value : string) {
    this._desc = value;
  }

  get fullDescription() {
    return this._fullDescription;
  }
  set fullDescription(value : string) {
    this._fullDescription = value;
  }

  get createdUser() {
    return this._createdUser;
  }
  set createdUser(value : string) {
    this._createdUser = value;
  }

  get createdDate() {
    return this._createdDate;
  }
  set createdDate(value : Date) {
    this._createdDate = value;
  }

  get assignedUser() {
    return this._assignedUser;
  }
  set assignedUser(value : string) {
    this._assignedUser = value;
  }

  get dueDate() {
    return this._dueDate;
  }
  set dueDate(value : Date) {
    this._dueDate = value;
  }

  get status() {
    return this._status;
  }
  set status(value : number) {
    this._status = value;
  }

  get documentAssociations() {
    return this._documentAssociations;
  }
  set documentAssociations(value : Map<string, string>) {
    this._documentAssociations = value;
  }
}

/**
 * Category Tab Bar description
 */
export interface IMRBauTasksCategory {
  tabIcon: string;
  tabName: string;
  tabBadge: number;

  searchQuery: string;
  searchOptions: SearchOptions;
}
