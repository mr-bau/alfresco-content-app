import { NodeEntry, QueryBody, UserInfo } from '@alfresco/js-api';
import { Pipe, PipeTransform } from '@angular/core';

// eslint-disable-next-line
export enum EMRBauTaskCategory {
  Uninitialized     =   0,

  CommonTaskStart   = 1000,
  CommonTaskInfo    = 1001,
  CommonTaskGeneral = 1002,
  CommonTaskApprove = 1003,
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

@Pipe({name: 'mrbauTaskCategory'})
export class MRBauTaskCategoryPipe implements PipeTransform {
  transform(value: number): string {
    switch (value)
    {
      case EMRBauTaskCategory.CommonTaskInfo:  return "Info";
      case EMRBauTaskCategory.CommonTaskGeneral: return "General";
      case EMRBauTaskCategory.CommonTaskApprove: return "Approval";
    }
    return ""+value;
  }
}

@Pipe({name: 'mrbauTaskStatus'})
export class MRBauTaskStatusPipe implements PipeTransform {
  transform(value: number): string {
    switch (value)
    {
      case MRBauTask.STATUS_NEW: return "neu";
      case MRBauTask.STATUS_FINISHED: return "erledigt";
    }
    return ""+value;
  }
}

export class MRBauTask {
  public static readonly STATUS_NEW = -1;
  public static readonly STATUS_FINISHED = 9000;
  public static readonly NAMESPACE_URI = "http://www.mrbau.at/model/tasks/1.0";
  public static readonly NAMESPACE_PREFIX = "mrbt";
  public static readonly MRBT_TASK = "mrbt:task";
  public static readonly MRBT_TASK_FOLDER = "mrbt:tasksFolder";
  public static readonly ASPECT_MRBT_TASK_CORE_DETAILS ="mrbt:taskCoreDetails";

  id : string;
  category: EMRBauTaskCategory;
  desc: string; // description
  status: number = MRBauTask.STATUS_NEW;
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
    this.status = obj && obj.status || MRBauTask.STATUS_NEW;
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
