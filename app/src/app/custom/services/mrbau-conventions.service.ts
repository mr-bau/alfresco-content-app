import { Injectable } from '@angular/core';
import { EMRBauTaskCategory, MRBauTask} from '../mrbau-task-declarations';
import { MrbauCommonService } from './mrbau-common.service';
import { MrbauArchiveModelService } from './mrbau-archive-model.service';
import { DocumentOrderTypes, EMRBauDocumentCategory, IMRBauDocumentType } from '../mrbau-doc-declarations';

//import jsonKtList from '../../../../../projects/mrbau-extension/assets/json/kt-list.json';
import jsonVendorList from '../../../../../projects/mrbau-extension/assets/json/vendor-list.json';

interface ClientData {
  value: EMRBauClientId,
  label: string,
  folder: string
}
export const enum EMRBauClientId {
  MANDANT_1,
  MANDANT_2,
  MANDANT_3,
}

export interface SelectFormOptions {
  label: string,
  value: any,
  group?: string,
};

export interface Vendor {
  "mrba:companyId" : string,
  "mrba:companyName" : string,
  "mrba:companyVatID" : string,
  "mrba:companyStreet" : string,
  "mrba:companyZipCode" : string,
  "mrba:companyCity" : string,
  "mrba:companyCountryCode": string,
  "ZZiel"?: string,
  "SktoProz1"?: string,
  "SktoTage1"?: string,
  "Ohne Steuer"?: string,
  "-"?: string,
}

@Injectable({
  providedIn: 'root'
})
export class MrbauConventionsService {
  // service class to return mrbau related responsibility conventions
  // TODO extract from JSON File
  constructor(
    private mrbauCommonService: MrbauCommonService,
    private mrbauArchiveModelService: MrbauArchiveModelService
    )
  {
  }

  readonly organisationUnits = new Map<number, ClientData>([
    [EMRBauClientId.MANDANT_1, {value: EMRBauClientId.MANDANT_1, label: "Mandant1", folder: "01 Mandant1"}],
    [EMRBauClientId.MANDANT_2, {value: EMRBauClientId.MANDANT_2, label: "Mandant2", folder: "02 Mandant2"}],
    [EMRBauClientId.MANDANT_3, {value: EMRBauClientId.MANDANT_3, label: "Mandant3", folder: "03 Mandant3"}],
  ]);

  getOrganisationUnitFormOptions() : SelectFormOptions[] {
    //console.log(jsonKtList);
    console.log(jsonVendorList);

    let result : SelectFormOptions[] = [];
    this.organisationUnits.forEach( (d) => result.push({label: d.label, value : d.value}));
    return result;
  }

  getDefaultOrganisationUnit() : EMRBauClientId {
    return EMRBauClientId.MANDANT_1;
  }

  getArchiveModelTypesFormOptions() : SelectFormOptions[] {
    return this.mrbauArchiveModelService.mrbauArchiveModel.mrbauArchiveModelTypes.filter( d => d.category != EMRBauDocumentCategory.ARCHIVE_DOCUMENT).map( d => ({label: d.title, value : d.category, group: d.group.label}));
  }

  getArchiveModelNodeTye(category:EMRBauDocumentCategory) : string
  {
    let docModel : IMRBauDocumentType[] = this.mrbauArchiveModelService.mrbauArchiveModel.mrbauArchiveModelTypes.filter( d => d.category == category);
    if (docModel.length > 0)
    {
      return docModel[0].name;
    }
    else
    {
      return undefined;
    }
  }

  getArchiveModelNodeTitle(category:EMRBauDocumentCategory) : string
  {
    let docModel : IMRBauDocumentType[] = this.mrbauArchiveModelService.mrbauArchiveModel.mrbauArchiveModelTypes.filter( d => d.category == category);
    if (docModel.length > 0)
    {
      return docModel[0].title;
    }
    else
    {
      return undefined;
    }
  }

  getTaskDescription(task: EMRBauTaskCategory, documentCategory? : EMRBauDocumentCategory, client? : EMRBauClientId) : string
  {
    if (task == EMRBauTaskCategory.NewDocumentValidateAndArchive)
    {
      return "Dokument prüfen und archivieren" + (documentCategory ? " - "+this.getArchiveModelNodeTitle(documentCategory) : "");
    }

    return "description for "+task+" "+client+" "+ documentCategory;
  }
  getTaskFullDescription(task: EMRBauTaskCategory, documentCategory? : EMRBauDocumentCategory, client? : EMRBauClientId) : string
  {
    task;documentCategory;client;
    return null;
  }
  getTaskDueDateValue(task: EMRBauTaskCategory, documentCategory? : EMRBauDocumentCategory, client? : EMRBauClientId) : string
  {
    task;documentCategory;client;
    let date = new Date();
    date.setDate( date.getDate() + MRBauTask.DOCUMENT_DEFAULT_TASK_DURATION );
    return this.mrbauCommonService.getFormDateValue(date);
  }
  getTaskAssignedUserId(task: EMRBauTaskCategory, documentCategory? : EMRBauDocumentCategory, client? : EMRBauClientId) : string
  {
    task;
    documentCategory;
    client;
    return "Wolfgang Moser";
  }

  readonly reviewDaysDefaultValues = ['0','7','10', '14','28','30','36'];
  readonly taxRateDefaultValues = ['0,0', '20,0','10,0'];
  readonly discountDefaultValues = ['3,00', '2,00','1,00'];
  /*readonly vendorList = new Map<string, Vendor>([
      ["Net-Solutions",{
        "mrba:companyId" : "Net-Solutions",
        "mrba:companyName" : "NET-Solutions & EDV-Service GmbH",
        "mrba:companyVatID" : "ATU53033505",
        "mrba:companyStreet" : "Triglavstrasse 1",
        "mrba:companyZipCode" : "9500",
        "mrba:companyCity" : "Villach",
        "mrba:companyCountryCode" : "AT"
      }],
      ["BMD",{
        "mrba:companyId" : "BMD",
        "mrba:companyName" : "BMD Systemhaus GesmbH",
        "mrba:companyVatID" : "ATU53033505",
        "mrba:companyStreet" : "Sierningerstraße 190",
        "mrba:companyZipCode" : "4400",
        "mrba:companyCity" : "Steyr",
        "mrba:companyCountryCode" : "AT"
      }],
  ]);*/

  readonly vendorList = {
    "Net-Solutions" : {
      "mrba:companyId" : "Net-Solutions",
      "mrba:companyName" : "NET-Solutions & EDV-Service GmbH",
      "mrba:companyVatID" : "ATU53033505",
      "mrba:companyStreet" : "Triglavstrasse 1",
      "mrba:companyZipCode" : "9500",
      "mrba:companyCity" : "Villach",
      "mrba:companyCountryCode" : "AT"
    },
    "BMD" : {
      "mrba:companyId" : "BMD",
      "mrba:companyName" : "BMD Systemhaus GesmbH",
      "mrba:companyVatID" : "ATU53033505",
      "mrba:companyStreet" : "Sierningerstraße 190",
      "mrba:companyZipCode" : "4400",
      "mrba:companyCity" : "Steyr",
      "mrba:companyCountryCode" : "AT"
    }
  };

  private _vendorListFormOptions : SelectFormOptions[];
  getVendorListFormOptions() : SelectFormOptions[] {
    if (this._vendorListFormOptions) {
      return this._vendorListFormOptions;
    }
    let result : SelectFormOptions[] = [];
    for (const key in jsonVendorList) {
      const d = jsonVendorList[key] as Vendor;
      result.push({label: d['mrba:companyName'], value : d['mrba:companyId']})
    }
    result = result.sort((a,b) => a.label.localeCompare(b.label));
    //this.vendorList.forEach( (d) => result.push({label: d['mrba:companyName'], value : d['mrba:companyId']}));
    this._vendorListFormOptions = result;
    return result;
  }

  getOrderTypeFormOptions() : SelectFormOptions[] {
    let result : SelectFormOptions[] = [];
    DocumentOrderTypes.forEach( (d) => result.push({label: d.label, value : d.label}));
    return result;
  }
}
