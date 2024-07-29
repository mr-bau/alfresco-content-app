import {  MinimalNode, QueryBody, UserInfo } from '@alfresco/js-api';
import { Pipe, PipeTransform } from '@angular/core';

export const enum EMRBauTaskStatus {
  STATUS_NEW         = 0,
  STATUS_IN_PROGRESS = 100,
  STATUS_ON_HOLD     = 101,

  STATUS_METADATA_EXTRACT_1   = 200,
  STATUS_METADATA_EXTRACT_2   = 201,
  STATUS_DUPLICATE            = 202,
  STATUS_FORMAL_REVIEW        = 203,
  STATUS_INVOICE_VERIFICATION = 204,
  STATUS_FINAL_APPROVAL       = 205,
  STATUS_ACCOUNTING           = 206,
  STATUS_ALL_SET              = 207,
  STATUS_INVOICE_REVIEW       = 208,
  STATUS_LINK_DOCUMENTS       = 209,
  STATUS_SIGNING              = 210,
  STATUS_PAUSED               = 211,
  STATUS_INTERNAL_INVOICE_VIEW= 212,

  // -- numbers above STATUS_NOTIFY_DONE do not show modifications UI except done/reject
  STATUS_NOTIFY_DONE      = 8000,
  STATUS_NOTIFY_APPROVED  = 8001,
  STATUS_NOTIFY_DECLINED  = 8002,

  STATUS_FINISHED    = 9000,
  STATUS_CANCELED    = 9001
}

// encapsulate a EMRBauTaskStatus value with an optional new assigned user value
export interface IMRBauTaskStatusAndUser {
  state:EMRBauTaskStatus;
  userName?:string;
}

export interface MRBauTaskStatusData {
  state : EMRBauTaskStatus;
  stateAsString : string;
  label : string;
}

export const MRBauTaskStatusDefinition = new Map<number, MRBauTaskStatusData>([
  [EMRBauTaskStatus.STATUS_NEW, {state: EMRBauTaskStatus.STATUS_NEW, stateAsString: "STATUS_NEW", label: 'Neu'}],
  [EMRBauTaskStatus.STATUS_IN_PROGRESS, {state: EMRBauTaskStatus.STATUS_IN_PROGRESS, stateAsString: "STATUS_IN_PROGRESS", label: 'In Bearbeitung'}],
  [EMRBauTaskStatus.STATUS_ON_HOLD, {state: EMRBauTaskStatus.STATUS_ON_HOLD, stateAsString: "STATUS_ON_HOLD", label: 'On Hold'}],

  [EMRBauTaskStatus.STATUS_METADATA_EXTRACT_1, {state: EMRBauTaskStatus.STATUS_METADATA_EXTRACT_1, stateAsString: "STATUS_METADATA_EXTRACT_1", label: 'Firmen- und KT-Zuordnung'}],
  [EMRBauTaskStatus.STATUS_LINK_DOCUMENTS, {state: EMRBauTaskStatus.STATUS_LINK_DOCUMENTS, stateAsString: "STATUS_LINK_DOCUMENTS", label: 'Dokumente zuordnen'}],
  [EMRBauTaskStatus.STATUS_METADATA_EXTRACT_2, {state: EMRBauTaskStatus.STATUS_METADATA_EXTRACT_2, stateAsString: "STATUS_METADATA_EXTRACT_2", label: 'Metadaten Zuweisen'}],
  [EMRBauTaskStatus.STATUS_DUPLICATE, {state: EMRBauTaskStatus.STATUS_DUPLICATE, stateAsString: "STATUS_DUPLICATE", label: 'Dublettenprüfung'}],
  [EMRBauTaskStatus.STATUS_SIGNING, {state: EMRBauTaskStatus.STATUS_SIGNING, stateAsString: "STATUS_SIGNING", label: 'Versand- u. Signatur-Status'}],
  [EMRBauTaskStatus.STATUS_PAUSED, {state: EMRBauTaskStatus.STATUS_PAUSED, stateAsString: "STATUS_PAUSED", label: 'Pausiert'}],
  [EMRBauTaskStatus.STATUS_FORMAL_REVIEW, {state: EMRBauTaskStatus.STATUS_FORMAL_REVIEW, stateAsString: "STATUS_FORMAL_REVIEW", label: 'Formale Rechnungsprüfung'}],
  [EMRBauTaskStatus.STATUS_INVOICE_VERIFICATION, {state: EMRBauTaskStatus.STATUS_INVOICE_VERIFICATION, stateAsString: "STATUS_INVOICE_VERIFICATION", label: 'Sachliche Rechnungsprüfung'}],
  [EMRBauTaskStatus.STATUS_INVOICE_REVIEW, {state: EMRBauTaskStatus.STATUS_INVOICE_REVIEW, stateAsString: "STATUS_INVOICE_REVIEW", label: 'Sachliche Rechnungsprüfung Freigabe'}],
  [EMRBauTaskStatus.STATUS_FINAL_APPROVAL, {state: EMRBauTaskStatus.STATUS_FINAL_APPROVAL, stateAsString: "STATUS_FINAL_APPROVAL", label: 'Freigabe'}],
  [EMRBauTaskStatus.STATUS_ACCOUNTING, {state: EMRBauTaskStatus.STATUS_ACCOUNTING, stateAsString: "STATUS_ACCOUNTING", label: 'Buchen'}],
  [EMRBauTaskStatus.STATUS_ALL_SET, {state: EMRBauTaskStatus.STATUS_ALL_SET, stateAsString: "STATUS_ALL_SET", label: 'Workflow abschließen'}],
  [EMRBauTaskStatus.STATUS_INTERNAL_INVOICE_VIEW, {state: EMRBauTaskStatus.STATUS_INTERNAL_INVOICE_VIEW, stateAsString: "STATUS_INTERNAL_INVOICE_VIEW", label: 'Interne Rechnung zur Info'}],


  [EMRBauTaskStatus.STATUS_NOTIFY_DONE, {state: EMRBauTaskStatus.STATUS_NOTIFY_DONE, stateAsString: "STATUS_NOTIFY_DONE", label: 'Erledigt'}],
  [EMRBauTaskStatus.STATUS_NOTIFY_APPROVED, {state: EMRBauTaskStatus.STATUS_NOTIFY_APPROVED, stateAsString: "STATUS_NOTIFY_APPROVED", label: 'Genehmigt'}],
  [EMRBauTaskStatus.STATUS_NOTIFY_DECLINED, {state: EMRBauTaskStatus.STATUS_NOTIFY_DECLINED, stateAsString: "STATUS_NOTIFY_DECLINED", label: 'Abgelehnt'}],

  [EMRBauTaskStatus.STATUS_FINISHED, {state: EMRBauTaskStatus.STATUS_FINISHED, stateAsString: "STATUS_FINISHED", label: 'Fertiggestellt'}],
  [EMRBauTaskStatus.STATUS_CANCELED, {state: EMRBauTaskStatus.STATUS_CANCELED, stateAsString: "STATUS_CANCELED", label: 'Abgebrochen'}],
]);

export const MRBauTaskStatusNamesReduced =
[
  {label: MRBauTaskStatusDefinition.get(EMRBauTaskStatus.STATUS_IN_PROGRESS).label, value: EMRBauTaskStatus.STATUS_IN_PROGRESS},
  {label: MRBauTaskStatusDefinition.get(EMRBauTaskStatus.STATUS_ON_HOLD).label, value: EMRBauTaskStatus.STATUS_ON_HOLD},
]

@Pipe({name: 'mrbauTaskStatus'})
export class MRBauTaskStatusPipe implements PipeTransform {
  transform(value: EMRBauTaskStatus): string {
    const val = MRBauTaskStatusDefinition.get(value);
    return (val) ? val.label : value.toString();
  }
}

export const enum EMRBauTaskCategory {
  Uninitialized     =   0,

  CommonTaskStart   = 1000,
  CommonTaskGeneral = 1001, // Eine neue Aufgabe sich selbst oder einen Kollegen zuweisen
  CommonTaskInfo    = 1002, // Zur Information übermitteln
  CommonTaskApprove = 1003, // Überprüfen und genehmigen (ein Überprüfer)
  //...
  CommonTaskLast    = 1999,

  NewDocumentStart  = 2000,
  NewDocumentValidateAndArchive  = 2001,
  //...
  NewDocumentLast   = 2999,
}

export const MRBauTaskCategoryNames = {
  1001 : "Allgemein",
  1002 : "Info",
  1003 : "Approval",
  2001 : "Dokument",
};

@Pipe({name: 'mrbauTaskCategory'})
export class MRBauTaskCategoryPipe implements PipeTransform {
  transform(value: EMRBauTaskCategory): string {
    return MRBauTaskCategoryNames[value] ? MRBauTaskCategoryNames[value] : value.toString();
  }
}

export interface IMRBauTaskListEntry {
  task:MRBauTask;
  desc:string;
  createdUser:string;
  assignedUser:string;
  createdDate: Date;
  dueDateValue: Date;
  icon:string;
  status: string;
  company?: string;
  kt?:string;
  prio?: number
}

export class MRBauTask {
  public static readonly TASK_RELATIVE_ROOT_PATH = "/Aufgaben";
  public static readonly NAMESPACE_URI = "http://www.mrbau.at/model/tasks/1.0";
  public static readonly NAMESPACE_PREFIX = "mrbt";
  public static readonly MRBT_TASK = "mrbt:task";
  public static readonly MRBT_TASK_FOLDER = "mrbt:tasksFolder";
  public static readonly ASPECT_MRBT_TASK_CORE_DETAILS ="mrbt:taskCoreDetails";
  public static readonly DEFAULT_TASK_DURATION = 14;
  public static readonly DOCUMENT_DEFAULT_TASK_DURATION = 3;

  id : string;
  category: EMRBauTaskCategory;
  desc: string; // description
  status: number = EMRBauTaskStatus.STATUS_NEW;
  associatedDocumentRef: string[] = [];
  associatedDocumentName: string[] = [];
  fullDescription?: string; // long task description
  createdUser?: UserInfo; // currently assigned user
  createdDate?: Date;   // start date
  assignedUserName?: string; // currently assigned user Id
  dueDateValue?: Date;
  companyName : string;
  costCarrierNumber:string;

  constructor(obj?: any) {
    this.id = obj && obj.id || null;
    this.category = obj && obj.category || EMRBauTaskCategory.Uninitialized;
    this.desc =  obj && obj.desc || null;
    this.status = obj && obj.status || EMRBauTaskStatus.STATUS_NEW;
    this.associatedDocumentRef = obj && obj.associatedDocumentRef || [];
    this.associatedDocumentName = obj && obj.associatedDocumentName || [];
    this.fullDescription = obj && obj.fullDescription;
    this.createdUser = obj && obj.createdUser;
    this.createdDate = obj && obj.createdDate;
    this.assignedUserName = obj && obj.assignedUserName;
    this.dueDateValue = obj && obj.dueDateValue;
    this.companyName = obj && obj.companyName;
    this.costCarrierNumber = obj && obj.costCarrierNumber;
  }

  public updateWithNodeData(node: MinimalNode){
    this.id = node.id;
    this.category = node.properties["mrbt:category"];
    this.desc = node.properties["mrbt:description"];
    this.status = node.properties["mrbt:status"];
    this.fullDescription = node.properties["mrbt:fullDescription"] ? node.properties["mrbt:fullDescription"] : null;
    this.createdUser = node.createdByUser;
    this.createdDate = node.createdAt;
    this.assignedUserName = node.properties["mrbt:assignedUserName"];
    this.dueDateValue = node.properties["mrbt:dueDateValue"] ? node.properties["mrbt:dueDateValue"] : null;
    this.associatedDocumentRef = node.properties["mrbt:associatedDocumentRef"] ? node.properties["mrbt:associatedDocumentRef"] : [];
    this.associatedDocumentName = node.properties["mrbt:associatedDocumentName"] ? node.properties["mrbt:associatedDocumentName"] : [];
    this.companyName = node.properties["mrba:companyName"] || undefined;
    this.costCarrierNumber = node.properties["mrba:costCarrierNumber"] || undefined;
  }

  public updateDueDate(date:Date) {
    this.dueDateValue = date;
  }

  public isInNotifyState() : boolean {
    return this.status >= EMRBauTaskStatus.STATUS_NOTIFY_DONE && this.status < EMRBauTaskStatus.STATUS_FINISHED;
  }

  public isInPausedState() : boolean {
    return this.status == EMRBauTaskStatus.STATUS_PAUSED;
  }

  public isTaskInDoneState() : boolean {
    return this.status >= EMRBauTaskStatus.STATUS_FINISHED;
  }

  public isTaskInNormalState() : boolean {
    return this.status < EMRBauTaskStatus.STATUS_NOTIFY_DONE;
  }

  public isTaskModificationUiVisible() : boolean {
    return this.status < EMRBauTaskStatus.STATUS_NOTIFY_DONE;
  }

  public isCommonTask() : boolean {
    return this.category > EMRBauTaskCategory.CommonTaskStart && this.category < EMRBauTaskCategory.CommonTaskLast;
  }

  public isNewDocumentTask() :boolean {
    return this.category == EMRBauTaskCategory.NewDocumentValidateAndArchive;
  }

  public getStateLabel() : string {
    return MRBauTask.getStateLabel(this.status);
  }

  public static getStateLabel(state:EMRBauTaskStatus) : string {
    const val = MRBauTaskStatusDefinition.get(state);
    return (val) ? val.label : state.toString();
  }

  public isTaskInNotifyOrDoneState() : boolean {
    return MRBauTask.isTaskInNotifyOrDoneState(this.status);
  }

  public static isTaskInNotifyOrDoneState(state : EMRBauTaskStatus) : boolean {
    return state >= EMRBauTaskStatus.STATUS_NOTIFY_DONE;
  }

  public getStateAsString() : string
  {
    return MRBauTask.getStateAsString(this.status);
  }

  public static getStateAsString(state:EMRBauTaskStatus) : string
  {
    const val = MRBauTaskStatusDefinition.get(state);
    return (val) ? val.stateAsString : state.toString();
  }
}

/**
 * Category Tab Bar description
 */
export interface IMRBauTasksCategory {
  tabIcon: string;
  tabName: string;
  tabBadge: number;
  searchRequest: QueryBody;
  order: string;
}
