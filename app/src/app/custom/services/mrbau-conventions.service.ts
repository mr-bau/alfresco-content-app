import { Injectable } from '@angular/core';
import { EMRBauTaskCategory, EMRBauTaskStatus, MRBauTask} from '../mrbau-task-declarations';
import { MrbauCommonService } from './mrbau-common.service';
import { DocumentInvoiceTypes, DocumentOfferTypes, DocumentOrderTypes, EMRBauDocumentCategory, MRBauSigningStatusTypes, MRBauVerifiedInboundInvoiceTypes, MRBauWorkflowStateCallbackData, OrganisationPositionTypes } from '../mrbau-doc-declarations';

import jsonMrbauAppConfig from '../../../../../projects/mrbau-extension/assets/json/mrbau-app-config.json';
import { IMrbauAppConfig  } from '../../../../../projects/mrbau-extension/src/mrbau-app-config';
import { MrbauDbService } from './mrbau-db.service';
//import jsonKtList from '../../../../../projects/mrbau-extension/assets/json/kt-list.json';
//import jsonVendorList from '../../../../../projects/mrbau-extension/assets/json/vendor-list.json';

// INTERFACES
export interface ISelectFormOptions {
  label: string,
  value: any,
  group?: string,
};

export interface IVendor {
  "mrba:companyId" : string,
  "mrba:companyName" : string,
  "mrba:companyStreet" : string,
  "mrba:companyZipCode" : string,
  "mrba:companyCity" : string,
  "mrba:companyVatID" : string,
  "mrba:companyEmail" : string,
  "mrba:companyPhone" : string,
}

export interface ICostCarrier {
  "mrba:costCarrierNumber" : string,
  "mrba:projectName" : string,
  "auditor1" : string,
  "auditor2" : string,
  "accountant" : string,
}

// SERVICE
@Injectable({
  providedIn: 'root'
})
export class MrbauConventionsService {
  readonly mrbauAppConfig = jsonMrbauAppConfig as IMrbauAppConfig;

  // service class to return mrbau related responsibility conventions
  // MR-TODO extract from JSON File
  constructor(
    private mrbauCommonService: MrbauCommonService,
    private mrbauDbService:MrbauDbService
    )
  {
  }

  getOrganisationUnitFormOptions() : ISelectFormOptions[] {
    let result : ISelectFormOptions[] = [];
    this.mrbauAppConfig.organisationUnits.forEach( (d) => result.push({label: d.label, value : d.folder}));
    return result;
  }

  getOrganisationPositionFormOptions() : ISelectFormOptions[] {
    let result : ISelectFormOptions[] = [];
    OrganisationPositionTypes.forEach( (d) => result.push({label: d.label, value : d.value}));
    return result;
  }

  getDefaultOrganisationUnit() : string {
    return this.mrbauAppConfig.organisationUnits[this.mrbauAppConfig.organisationUnitDefault].folder;
  }

  getTaskDefaultAssignedUserIdForStatus(data: MRBauWorkflowStateCallbackData, status: EMRBauTaskStatus) : Promise<string>
  {
    let taskCategory = data?.taskDetailNewDocument?.task?.category;
    let kt = data?.taskDetailNewDocument?.taskNode?.properties['mrba:costCarrierNumber'];
    return new Promise((resolve, reject) => {
      if (taskCategory == EMRBauTaskCategory.NewDocumentValidateAndArchive && kt)
      {
        this.mrbauDbService.getProject(kt).subscribe(
          result => {
            //console.log(result);
            if (typeof result === 'string') {
              reject(result);
              return;
            }
            let project = result as ICostCarrier;
            switch (status)
            {
              case EMRBauTaskStatus.STATUS_INVOICE_VERIFICATION:
                resolve(project.auditor1);
              case EMRBauTaskStatus.STATUS_FINAL_APPROVAL:
                resolve(project.auditor2);
              case EMRBauTaskStatus.STATUS_ACCOUNTING:
                resolve(project.accountant);
              default:
                resolve(null);
            }
            return;
          },
          error => {
            reject(error);
          },
        );
      }
    });
  }

  getTaskFullDescription(task: EMRBauTaskCategory, documentCategory? : EMRBauDocumentCategory, client? : number) : string
  {
    task;documentCategory;client;
    return null;
  }
  getTaskDueDateValue(task: EMRBauTaskCategory, documentCategory? : EMRBauDocumentCategory, client? : number) : string
  {
    task;documentCategory;client;
    let date = new Date();
    date.setDate( date.getDate() + MRBauTask.DOCUMENT_DEFAULT_TASK_DURATION );
    return this.mrbauCommonService.getFormDateValue(date);
  }
  getNewTaskDefaultAssignedUserId(task: EMRBauTaskCategory, documentCategory? : EMRBauDocumentCategory, client? : number) : string
  {
    task;
    documentCategory;
    client;
    // return null to use the current user
    return null;
  }

  readonly reviewDaysDefaultValues = ['0','7','10','14','28','30','36'];
  readonly taxRateDefaultValues = ['0,0', '20,0','13,0', '10,0'];
  readonly discountDefaultValues = ['1,00','2,00','3,00'];

  /*public createVendorString(v : IVendor) : string {
    let result = v['mrba:companyName'];
    result = (v['mrba:companyStreet']) ? result.concat(', ').concat(v['mrba:companyStreet']) : result;
    result = (v['mrba:companyCity']) ? result.concat(', ').concat(v['mrba:companyZipCode']).concat(' ').concat(v['mrba:companyCity'])  : result;
    result = (v['mrba:companyVatID']) ? result.concat(', ').concat(v['mrba:companyVatID']) : result;
    //console.log(result);
    return result;
  }
  private _vendorListFormOptions : ISelectFormOptions[];
  getVendorListFormOptions() : ISelectFormOptions[] {
    if (this._vendorListFormOptions) {
      return this._vendorListFormOptions;
    }
    let result : ISelectFormOptions[] = [];
    for (const key in jsonVendorList) {
      const d = jsonVendorList[key] as IVendor;
      result.push({label: this.createVendorString(d), value : d['mrba:companyId']})
    }
    result = result.sort((a,b) => a.label.localeCompare(b.label));
    this._vendorListFormOptions = result;
    return result;
  }
  getVendorListFormOption(mrba_companyId : string) : ISelectFormOptions {
    const result = this.getVendorListFormOptions().filter( d => d.value == mrba_companyId);
    return (result.length > 0) ? result[0] : undefined;
  }
  getVendor(key : string) : IVendor {
    return jsonVendorList[key] as IVendor
  }*/

  addVendor() {
    this.mrbauCommonService.addVendorWithConfirmDialog().then((result) => {
      if (result) { }
    })
    .catch((error) => {
      this.mrbauCommonService.showError(error);
    });
  }

  editVendor() {
    this.mrbauCommonService.editVendorWithConfirmDialog().then((result) => {
      if (result) { }
    })
    .catch((error) => {
      this.mrbauCommonService.showError(error);
    });
  }

  addProject() {
    this.mrbauCommonService.addProjectWithConfirmDialog().then((result) => {
      if (result) { }
    })
    .catch((error) => {
      this.mrbauCommonService.showError(error);
    });
  }

  editProject() {
    this.mrbauCommonService.editProjectWithConfirmDialog().then((result) => {
      if (result) { }
    })
    .catch((error) => {
      this.mrbauCommonService.showError(error);
    });
  }
/*
  private createKtString(v:ICostCarrier) : string {
    let result = v['mrba:costCarrierNumber'];
    result = (v['mrba:projectName']) ? result.concat(', ').concat(v['mrba:projectName']) : result;
    return result;
  }

  private _ktListFormOptions : ISelectFormOptions[];
  getKtListFormOptions() : ISelectFormOptions[] {
    if (this._ktListFormOptions) {
      return this._ktListFormOptions;
    }
    let result : ISelectFormOptions[] = [];
    for (const key in jsonKtList) {
      const d = jsonKtList[key] as ICostCarrier;
      result.push({label: this.createKtString(d), value : d['mrba:costCarrierNumber']})
    }
    result = result.sort((a,b) => a.label.localeCompare(b.label));
    this._ktListFormOptions = result;
    return result;
  }
  getKtListFormOption(mrba_costCarrierNumber : string) : ISelectFormOptions {
    const result = this.getKtListFormOptions().filter( d => d.value == mrba_costCarrierNumber);
    return (result.length > 0) ? result[0] : undefined;
  }
  getCostCarrier(key : string) : ICostCarrier {
    return jsonKtList[key] as ICostCarrier
  }*/

  getOfferTypeFormOptions() : ISelectFormOptions[] {
    let result : ISelectFormOptions[] = [];
    DocumentOfferTypes.forEach( (d) => result.push({label: d.label, value : d.value}));
    return result;
  }

  getOrderTypeFormOptions() : ISelectFormOptions[] {
    let result : ISelectFormOptions[] = [];
    DocumentOrderTypes.forEach( (d) => result.push({label: d.label, value : d.value}));
    return result;
  }

  getInvoiceTypeFormOptions() : ISelectFormOptions[] {
    let result : ISelectFormOptions[] = [];
    DocumentInvoiceTypes.forEach( (d) => result.push({label: d.label, value : d.value}));
    return result;
  }

  getSigningStatusFormOptions() : ISelectFormOptions[] {
    let result : ISelectFormOptions[] = [];
    MRBauSigningStatusTypes.forEach( (d) => result.push({label: d.label, value : d.value}));
    return result;
  }

  getVerifiedInboundInvoiceTypeFormOptions() : ISelectFormOptions[] {
    let result : ISelectFormOptions[] = [];
    MRBauVerifiedInboundInvoiceTypes.forEach( (d) => result.push({label: d.label, value : d.value}));
    return result;
  }
}
