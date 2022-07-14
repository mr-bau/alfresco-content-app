import { EcmUserModel, PeopleContentQueryResponse, PeopleContentService } from '@alfresco/adf-core';
import { Injectable } from '@angular/core';
import { ContentApiService } from '../../../../../projects/aca-shared/src/public-api';
import { EMRBauTaskCategory, MRBauTask } from '../mrbau-task-declarations';

interface ClientData {
  label: string,
  value: EMRBauClientId,
  folder: string
}
export const enum EMRBauClientId {
  MANDANT_1 = 1,
  MANDANT_2 = 2,
  MANDANT_3 = 3,
}

interface FormOptionsInterface {
  label: string,
  value: any,
  group?: string,
};

interface DocumentCategoryData {
  label: string,
  value: EMRBauDocumentCategory,
  folder: string,
  group: DocumentCategoryGroupData,
}

interface DocumentCategoryGroupData {
  label: string,
  folder: string,
  value: EMRBauDocumentCategoryGroup,
}

export const enum EMRBauDocumentCategory {
  // BILLS
  OFFER,
  ORDER,
  DELIVERY_NOTE,
  ER,
  AR,
  PAYMENT_TERMS,
  OTHER_BILL,
  // CONTRACTS
  LEASE_CONTRACT,
  WAIVE_TERMINATION_RIGHT,
  MAINTENANCE_CONTRACT,
  ALL_IN_CONTRACT,
  LICENSE_CONTRACT,
  TERMINATION,
  FUEL_CARD,
  OTHER_CONTRACT
}

export const enum EMRBauDocumentCategoryGroup {
  BILLS        = 0,
  CONTRACTS    = 1,
}

@Injectable({
  providedIn: 'root'
})
export class MrbauConventionsService {
  // service class to return mrbau related responsibility conventions
  // TODO extract from JSON File
  constructor(
    private contentApiService : ContentApiService,
    private peopleContentService: PeopleContentService,)
  {
    this.queryData();
  }

  readonly clients = new Map<number, ClientData>([
    [EMRBauClientId.MANDANT_1, {value: EMRBauClientId.MANDANT_1, label: "Mandant1", folder: "01 Mandant1"}],
    [EMRBauClientId.MANDANT_2, {value: EMRBauClientId.MANDANT_2, label: "Mandant2", folder: "02 Mandant2"}],
    [EMRBauClientId.MANDANT_3, {value: EMRBauClientId.MANDANT_3, label: "Mandant3", folder: "03 Mandant3"}],
  ]);

  readonly documentCategoryGroups = new Map<number, DocumentCategoryGroupData>([
    [EMRBauDocumentCategoryGroup.BILLS, {value: EMRBauDocumentCategoryGroup.BILLS, label: "Belege", folder: "01 Belege"}],
    [EMRBauDocumentCategoryGroup.CONTRACTS, {value: EMRBauDocumentCategoryGroup.CONTRACTS, label: "Verträge", folder: "02 Verträge"}],
  ]);

  readonly documentCategories = new Map<number, DocumentCategoryData>([
    [EMRBauDocumentCategory.OFFER,          {value: EMRBauDocumentCategory.OFFER,         label: "Angebot",             folder: "01 Angebote",            group : this.documentCategoryGroups.get(EMRBauDocumentCategoryGroup.BILLS)}],
    [EMRBauDocumentCategory.ORDER,          {value: EMRBauDocumentCategory.ORDER,         label: "Auftrag",             folder: "02 Aufträge",            group : this.documentCategoryGroups.get(EMRBauDocumentCategoryGroup.BILLS)}],
    [EMRBauDocumentCategory.DELIVERY_NOTE,  {value: EMRBauDocumentCategory.DELIVERY_NOTE, label: "Lieferschein",        folder: "03 Lieferscheine",       group : this.documentCategoryGroups.get(EMRBauDocumentCategoryGroup.BILLS)}],
    [EMRBauDocumentCategory.ER,             {value: EMRBauDocumentCategory.ER,            label: "Eingangsrechnung",    folder: "04 Eingangsrechnungen",  group : this.documentCategoryGroups.get(EMRBauDocumentCategoryGroup.BILLS)}],
    [EMRBauDocumentCategory.AR,             {value: EMRBauDocumentCategory.AR,            label: "Ausgangsrechnung",    folder: "05 Ausgangsrechnungen",  group : this.documentCategoryGroups.get(EMRBauDocumentCategoryGroup.BILLS)}],
    [EMRBauDocumentCategory.PAYMENT_TERMS,  {value: EMRBauDocumentCategory.PAYMENT_TERMS, label: "Zahlungskonditionen", folder: "05 Zahlungskonditionen", group : this.documentCategoryGroups.get(EMRBauDocumentCategoryGroup.BILLS)}],
    [EMRBauDocumentCategory.OTHER_BILL,     {value: EMRBauDocumentCategory.OTHER_BILL,    label: "Sonstiger Beleg",     folder: "99 Sonstige Belege",     group : this.documentCategoryGroups.get(EMRBauDocumentCategoryGroup.BILLS)}],

    [EMRBauDocumentCategory.LEASE_CONTRACT,           {value: EMRBauDocumentCategory.LEASE_CONTRACT,          label: "Mietvertrag",         folder: "01 Mietverträge",        group : this.documentCategoryGroups.get(EMRBauDocumentCategoryGroup.CONTRACTS)}],
    [EMRBauDocumentCategory.WAIVE_TERMINATION_RIGHT,  {value: EMRBauDocumentCategory.WAIVE_TERMINATION_RIGHT, label: "Kündigungsverzicht",  folder: "02 Kündigungsverzicht",  group : this.documentCategoryGroups.get(EMRBauDocumentCategoryGroup.CONTRACTS)}],
    [EMRBauDocumentCategory.MAINTENANCE_CONTRACT,     {value: EMRBauDocumentCategory.MAINTENANCE_CONTRACT,    label: "Wartungsvertrag",     folder: "03 Wartungsverträge",    group : this.documentCategoryGroups.get(EMRBauDocumentCategoryGroup.CONTRACTS)}],
    [EMRBauDocumentCategory.ALL_IN_CONTRACT,          {value: EMRBauDocumentCategory.ALL_IN_CONTRACT,         label: "All-In Vertrag",      folder: "04 All-In",              group : this.documentCategoryGroups.get(EMRBauDocumentCategoryGroup.CONTRACTS)}],
    [EMRBauDocumentCategory.LICENSE_CONTRACT,         {value: EMRBauDocumentCategory.LICENSE_CONTRACT,        label: "Lizenzvertrag",       folder: "05 Lizenzverträge",      group : this.documentCategoryGroups.get(EMRBauDocumentCategoryGroup.CONTRACTS)}],
    [EMRBauDocumentCategory.TERMINATION,              {value: EMRBauDocumentCategory.TERMINATION,             label: "Kündigung",           folder: "06 Kündigungen",         group : this.documentCategoryGroups.get(EMRBauDocumentCategoryGroup.CONTRACTS)}],
    [EMRBauDocumentCategory.FUEL_CARD,                {value: EMRBauDocumentCategory.FUEL_CARD,               label: "Tankkarte",           folder: "07 Tankkarten",          group : this.documentCategoryGroups.get(EMRBauDocumentCategoryGroup.CONTRACTS)}],
    [EMRBauDocumentCategory.OTHER_CONTRACT,           {value: EMRBauDocumentCategory.OTHER_CONTRACT,          label: "Sonstiger Verträge",  folder: "99 Sonstige Verträge",   group : this.documentCategoryGroups.get(EMRBauDocumentCategoryGroup.CONTRACTS)}],
  ]);

  taskParentFolderId : string;
  people: EcmUserModel[] = [];

  getClientFormOptions() : FormOptionsInterface[] {
    let result : FormOptionsInterface[] = [];
    this.clients.forEach( (d) => result.push({label: d.label, value : d.value}));
    return result;
  }

  getDocumentFormOptions() : FormOptionsInterface[] {
    let result : FormOptionsInterface[] = [];
    this.documentCategories.forEach( (d) => result.push({label: d.label, value : d.value, group: d.group.label}));
    return result;
  }

  getDefaultClient() : EMRBauClientId {
    return EMRBauClientId.MANDANT_1;
  }

  getTaskDescription(task: EMRBauTaskCategory, documentCategory : EMRBauDocumentCategory, client? : EMRBauClientId) : string
  {
    return "description for "+task+" "+client+" "+ documentCategory;
  }
  getTaskFullDescription(task: EMRBauTaskCategory, documentCategory : EMRBauDocumentCategory, client? : EMRBauClientId) : string
  {
    return "full description for "+task+" "+client+" "+ documentCategory;
  }
  getTaskAssignedUserId(task: EMRBauTaskCategory, documentCategory : EMRBauDocumentCategory, client? : EMRBauClientId) : string
  {
    task;
    documentCategory;
    client;
    return "Wolfgang Moser";
  }

  queryData() {
    // todo
    const promiseGetParentId = this.contentApiService.getNodeInfo('-root-', { includeSource: true, include: ['path', 'properties'], relativePath: MRBauTask.TASK_RELATIVE_ROOT_PATH }).toPromise();
    const promiseGetPeople = this.peopleContentService.listPeople({skipCount : 0, maxItems : 999, sorting : { orderBy: "id", direction: "ASC"}}).toPromise();
    const allPromise = Promise.all([promiseGetParentId, promiseGetPeople]);

    allPromise.then(values => {
      const node = values[0];
      this.taskParentFolderId = node.id;
      const response = values[1] as PeopleContentQueryResponse;
      for (let entry of response.entries)
      {
        this.people.push(entry);
      }
    }).catch(error => {
      console.log(error);
    });
  }

}
