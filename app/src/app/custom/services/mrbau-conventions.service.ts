import { Injectable } from '@angular/core';
import { MRBauArchiveModelTypes, EMRBauDocumentCategory } from '../mrbau-doc-declarations';
import { EMRBauTaskCategory} from '../mrbau-task-declarations';

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

export interface FormOptionsInterface {
  label: string,
  value: any,
  group?: string,
};

export interface Vendor {
  "mrba:companyName" : string,
  "mrba:companyVatID" : string,
  "mrba:companyStreet" : string,
  "mrba:companyZipCode" : string,
  "mrba:companyCity" : string,
  "mrba:companyCountryCode": string,
}

@Injectable({
  providedIn: 'root'
})
export class MrbauConventionsService {
  // service class to return mrbau related responsibility conventions
  // TODO extract from JSON File
  constructor()
  {
  }

  readonly organisationUnits = new Map<number, ClientData>([
    [EMRBauClientId.MANDANT_1, {value: EMRBauClientId.MANDANT_1, label: "Mandant1", folder: "01 Mandant1"}],
    [EMRBauClientId.MANDANT_2, {value: EMRBauClientId.MANDANT_2, label: "Mandant2", folder: "02 Mandant2"}],
    [EMRBauClientId.MANDANT_3, {value: EMRBauClientId.MANDANT_3, label: "Mandant3", folder: "03 Mandant3"}],
  ]);


  getOrganisationUnitFormOptions() : FormOptionsInterface[] {
    let result : FormOptionsInterface[] = [];
    this.organisationUnits.forEach( (d) => result.push({label: d.label, value : d.value}));
    return result;
  }

  getDefaultOrganisationUnit() : EMRBauClientId {
    return EMRBauClientId.MANDANT_1;
  }

  getArchiveModelTypesFormOptions() : FormOptionsInterface[] {
    return MRBauArchiveModelTypes.filter( d => d.category != EMRBauDocumentCategory.ARCHIVE_DOCUMENT).map( d => ({label: d.title, value : d.category, group: d.group.label}));
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

  getVendorList() : Vendor[] {
    return [
      {
        "mrba:companyName" : "NET-Solutions & EDV-Service GmbH",
        "mrba:companyVatID" : "ATU53033505",
        "mrba:companyStreet" : "Triglavstrasse 1",
        "mrba:companyZipCode" : "9500",
        "mrba:companyCity" : "Villach",
        "mrba:companyCountryCode" : "AT"
      },
      {
        "mrba:companyName" : "BMD Systemhaus GesmbH",
        "mrba:companyVatID" : "ATU53033505",
        "mrba:companyStreet" : "Sierningerstraße 190",
        "mrba:companyZipCode" : "4400",
        "mrba:companyCity" : "Steyr",
        "mrba:companyCountryCode" : "AT"
      },
    ];
  }

}
