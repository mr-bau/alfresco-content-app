import { MinimalNode, QueryBody, UserInfo } from '@alfresco/js-api';
import { Pipe, PipeTransform } from '@angular/core';



export const enum EMRBauTaskStatus {
  STATUS_NEW         = 0,
  STATUS_IN_PROGRESS = 100,
  STATUS_ON_HOLD     = 101,


  // -- numbers above STATUS_NOTIFY_DONE do not show modifications UI except done/reject
  STATUS_NOTIFY_DONE      = 8000,
  STATUS_NOTIFY_APPROVED = 8001,
  STATUS_NOTIFY_DECLINED   = 8002,

  STATUS_FINISHED    = 9000,
  STATUS_CANCELED    = 9001
}

export const MRBauTaskStatusNames =
[
  {label: 'Neu', value: EMRBauTaskStatus.STATUS_NEW},
  {label: 'In Bearbeitung', value: EMRBauTaskStatus.STATUS_IN_PROGRESS},
  {label: 'On Hold', value: EMRBauTaskStatus.STATUS_ON_HOLD},

  {label: 'Erledigt', value: EMRBauTaskStatus.STATUS_NOTIFY_DONE},
  {label: 'Genehmigt', value: EMRBauTaskStatus.STATUS_NOTIFY_APPROVED},
  {label: 'Abgelehnt', value: EMRBauTaskStatus.STATUS_NOTIFY_DECLINED},

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
  1001 : "Allgemein",
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
  associatedDocumentRef: string[] = [];
  associatedDocumentName: string[] = [];
  fullDescription?: string; // long task description
  createdUser?: UserInfo; // currently assigned user
  createdDate?: Date;   // start date
  assignedUserName?: string; // currently assigned user Id
  dueDate?: Date;

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
    this.dueDate = obj && obj.dueDate;
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
    this.dueDate = node.properties["mrbt:dueDate"] ? node.properties["mrbt:dueDate"] : null;
    this.associatedDocumentRef = node.properties["mrbt:associatedDocumentRef"] ? node.properties["mrbt:associatedDocumentRef"] : [];
    this.associatedDocumentName = node.properties["mrbt:associatedDocumentName"] ? node.properties["mrbt:associatedDocumentName"] : [];
  }

  public isInNotifyState() : boolean {
    return this.status >= EMRBauTaskStatus.STATUS_NOTIFY_DONE && this.status < EMRBauTaskStatus.STATUS_FINISHED;
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
