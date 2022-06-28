import { NodeEntry, QueryBody, UserInfo } from '@alfresco/js-api';
import { Pipe, PipeTransform } from '@angular/core';



export const enum EMRBauTaskStatus {
  STATUS_NEW         = 0,
  STATUS_IN_PROGRESS = 100,
  STATUS_ON_HOLD     = 101,

  STATUS_FINISHED    = 9000,
  STATUS_CANCELED    = 9001
}

export const MRBauTaskStatusNames =
[
  {label: 'Neu', value: EMRBauTaskStatus.STATUS_NEW},
  {label: 'In Bearbeitung', value: EMRBauTaskStatus.STATUS_IN_PROGRESS},
  {label: 'On Hold', value: EMRBauTaskStatus.STATUS_ON_HOLD},
  {label: 'Abgeschlossen', value: EMRBauTaskStatus.STATUS_FINISHED},
  {label: 'Abgebrochen', value: EMRBauTaskStatus.STATUS_CANCELED},
]

export const MRBauTaskStatusNamesReduced =
[
  {label: 'In Bearbeitung', value: EMRBauTaskStatus.STATUS_IN_PROGRESS},
  {label: 'On Hold', value: EMRBauTaskStatus.STATUS_ON_HOLD},
]

@Pipe({name: 'mrbauTaskStatus'})
export class MRBauTaskStatusPipe implements PipeTransform {
  transform(value: EMRBauTaskStatus): string {
    for (const val in MRBauTaskStatusNames)
    {
      if (MRBauTaskStatusNames[val].value == value)
      {
        return MRBauTaskStatusNames[val].label;
      }
    }
    return value.toString();
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
  NewDocument       = 2001,
  //...
  NewDocumentLast   = 2999,

  InvoiceAuditStart = 3000,
  InvoiceAudit      = 3001,
  //...
  InvoiceAuditLast  = 3999,
}

export const MRBauTaskCategoryNames = {
  1001 : "General",
  1002 : "Info",
  1003 : "Approval"
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
  createdDate: Date;
  dueDate: Date;
  icon:string;
  status: EMRBauTaskStatus;
}


export class MRBauTask {
  public static readonly TASK_RELATIVE_ROOT_PATH = "/Aufgaben";
  public static readonly NAMESPACE_URI = "http://www.mrbau.at/model/tasks/1.0";
  public static readonly NAMESPACE_PREFIX = "mrbt";
  public static readonly MRBT_TASK = "mrbt:task";
  public static readonly MRBT_TASK_FOLDER = "mrbt:tasksFolder";
  public static readonly ASPECT_MRBT_TASK_CORE_DETAILS ="mrbt:taskCoreDetails";
  public static readonly DEFAULT_TASK_DURATION = 14;
  id : string;
  category: EMRBauTaskCategory;
  desc: string; // description
  status: number = EMRBauTaskStatus.STATUS_NEW;
  documentAssociations: Map<string, string> = new Map();// map id -> Name

  fullDescription?: string; // long task description
  createdUser?: UserInfo; // currently assigned user
  createdDate?: Date;   // start date
  assignedUser?: string; // currently assigned user
  dueDate?: Date;

  constructor(obj?: any) {
    this.id = obj && obj.id || null;
    this.category = obj && obj.category || EMRBauTaskCategory.Uninitialized;
    this.desc =  obj && obj.desc || null;
    this.status = obj && obj.status || EMRBauTaskStatus.STATUS_NEW;
    this.documentAssociations = obj && obj.documentAssociations || new Map()
    this.fullDescription = obj && obj.fullDescription;
    this.createdUser = obj && obj.createdUser;
    this.createdDate = obj && obj.createdDate;
    this.assignedUser = obj && obj.assignedUser;
    this.dueDate = obj && obj.dueDate;
  }

  public updateWithNodeData(node: NodeEntry){
    this.id = node.entry.id;
    this.category = node.entry.properties["mrbt:category"];
    this.desc = node.entry.properties["mrbt:description"];
    this.status = node.entry.properties["mrbt:status"];
    this.fullDescription = node.entry.properties["mrbt:fullDescription"] ? node.entry.properties["mrbt:fullDescription"] : null;
    this.createdUser = node.entry.createdByUser;
    this.createdDate = node.entry.createdAt;
    this.assignedUser = node.entry.properties["mrbt:assignedUser"];
    this.dueDate = node.entry.properties["mrbt:dueDate"] ? node.entry.properties["mrbt:dueDate"] : null;

    //console.log(node.entry.properties["mrbt:associatedDocument"]);

    // kept in sync with mrbt:associatedDocument via automation
    // identical order as mrbt:associatedDocument
    //console.log(node.entry.properties["mrbt:associatedDocumentName"]);
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
}
