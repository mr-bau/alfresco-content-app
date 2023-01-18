//https://github.com/mr-bau/alfresco-customisations/blob/default/mrbau-alfresco-platform/src/main/resources/alfresco/module/mrbau-alfresco-platform/model/archiveModel.xml
//https://github.com/mr-bau/alfresco-customisations/blob/default/mrbau-alfresco-platform/src/main/resources/alfresco/module/mrbau-alfresco-platform/messages/archiveModel.properties

// * Base Type
// ================
// title: "doc",      name : "mrba:archiveDocument",

// * Document Types
// ================
// title: "Angebot",                    name : "mrba:offer",
// title: "Auftrag",                    name : "mrba:order",
// title: "Zahlungsvereinbarungen",     name : "mrba:frameworkContract",
// title: "Lieferschein",               name : "mrba:deliveryNote",
// title: "Eingangsrechnung",           name : "mrba:inboundInvoice",
// title: "Ausgangsrechnung",           name : "mrba:outboundInvoice",
// title: "Rechnungsprüfblatt"          name : "mrba:invoiceReviewSheet",
// title: "Vergabeverhandlungsprotokoll",name : "mrba:orderNegotiationProtocol",
// title: "Sonstiger Beleg",            name : "mrba:miscellaneousDocument",

// title: "Vertragsdokument",           name : "mrba:contractDocument"
// title: "Mietvertrag",                name : "mrba:rentContract"
// title: "Kündigungsverzicht",         name : "mrba:contractCancellationWaiver"
// title: "Wartungsvertrag",            name : "mrba:maintenanceContract"
// title: "All-In",                     name : "mrba:allInContract"
// title: "Lizenzvertrag",              name : "mrba:licenseContract"
// title: "Finanzierungsvertrag",       name : "mrba:financingContract"
// title: "Werkvertrag",                name : "mrba:workContract"
// title: "Kündigung",                  name : "mrba:contractCancellation"
// title: "Sonstiger Vertrag",          name : "mrba:miscellaneousContractDocument"

//
// * Associations
// ================
// mrba:order                     mrba:order
// mrba:addonOrder                mrba:order
// mrba:frameworkContract         mrba:frameworkContract
// mrba:deliveryNote              mrba:deliveryNote
// mrba:inboundInvoice            mrba:inboundInvoice
// mrba:inboundRevokedInvoice     mrba:inboundInvoice
// mrba:inboundPartialInvoice     mrba:inboundInvoice
// mrba:archiveDocument           mrba:archiveDocument
// mrba:document                  mrba:document
// mrba:outboundInvoice           mrba:outboundInvoice
// mrba:outboundRevokedInvoice    mrba:outboundInvoice
// mrba:outboundPartialInvoice    mrba:outboundInvoice

// mrba:cancelledContract         mrba:contractDocument
// mrba:contractDocument          mrba:contractDocument

import { NodeAssociationEntry  } from '@alfresco/js-api';
import { Pipe, PipeTransform } from '@angular/core';
import { EMRBauDuplicateResolveResult } from './form/mrbau-formly-duplicated-document.component';
import { EMRBauTaskStatus } from './mrbau-task-declarations';
import { MrbauWorkflowService } from './services/mrbau-workflow.service';
import { TasksDetailNewDocumentComponent } from './tasks-detail-new-document/tasks-detail-new-document.component';

@Pipe({name: 'mrbauNodeAssociationEntryFilterPipeImpure', pure: false})
export class MRBauNodeAssociationEntryFilterPipeImpure implements PipeTransform {
  transform(values: NodeAssociationEntry[], ...args: any[]): NodeAssociationEntry[] {
    return values ? values.filter(v => v.entry.association.assocType == args[0]) : values;
  }
}

export const enum EMRBauDocumentAssociations {
  DOCUMENT_REFERENCE,
  ARCHIVE_DOCUMENT_REFERENCE,
  OFFER_REFERENCE,
  ORDER_REFERENCE,
  ADDON_ORDER_REFERENCE,
  FRAMEWORK_CONTRACT_REFERENCE,
  DELIVERY_NOTE_REFERENCE,
  INBOUND_INVOICE_REFERENCE,
  INBOUND_REVOKED_INVOICE_REFERENCE,
  INBOUND_PARTIAL_INVOICE_REFERENCE,
  OUTBOUND_INVOICE_REFERENCE,
  OUTBOUND_REVOKED_INVOICE_REFERENCE,
  OUTBOUND_PARTIAL_INVOICE_REFERENCE,
  CONTRACT_REFERENCE,
  CANCELLED_CONTRACT_REFERENCE,
}
interface IDocumentAssociations {
  category: EMRBauDocumentAssociations,
  aspectName: string,
  associationName: string,
  targetClass: string,
}
export const DocumentAssociations = new Map<number, IDocumentAssociations>([
  [EMRBauDocumentAssociations.DOCUMENT_REFERENCE, {category: EMRBauDocumentAssociations.DOCUMENT_REFERENCE,  aspectName: "mrba:documentReference", associationName: "mrba:document", targetClass: "cm:content"}],
  [EMRBauDocumentAssociations.ARCHIVE_DOCUMENT_REFERENCE, {category: EMRBauDocumentAssociations.ARCHIVE_DOCUMENT_REFERENCE,  aspectName: "mrba:archiveDocumentReference", associationName: "mrba:archiveDocument", targetClass: "mrba:archiveDocument"}],
  [EMRBauDocumentAssociations.OFFER_REFERENCE, {category: EMRBauDocumentAssociations.OFFER_REFERENCE,  aspectName: "mrba:offerReference", associationName: "mrba:offer", targetClass: "mrba:offer"}],
  [EMRBauDocumentAssociations.ORDER_REFERENCE, {category: EMRBauDocumentAssociations.ORDER_REFERENCE,  aspectName: "mrba:orderReference", associationName: "mrba:order", targetClass: "mrba:order"}],
  [EMRBauDocumentAssociations.ADDON_ORDER_REFERENCE, {category: EMRBauDocumentAssociations.ADDON_ORDER_REFERENCE,  aspectName: "mrba:addonOrderReference", associationName: "mrba:addonOrder", targetClass: "mrba:order"}],
  [EMRBauDocumentAssociations.FRAMEWORK_CONTRACT_REFERENCE, {category: EMRBauDocumentAssociations.FRAMEWORK_CONTRACT_REFERENCE,  aspectName: "mrba:frameworkContractReference", associationName: "mrba:frameworkContract", targetClass: "mrba:frameworkContract"}],
  [EMRBauDocumentAssociations.DELIVERY_NOTE_REFERENCE, {category: EMRBauDocumentAssociations.DELIVERY_NOTE_REFERENCE,  aspectName: "mrba:deliveryNoteReference", associationName: "mrba:deliveryNote", targetClass: "mrba:deliveryNote"}],
  [EMRBauDocumentAssociations.INBOUND_INVOICE_REFERENCE, {category: EMRBauDocumentAssociations.INBOUND_INVOICE_REFERENCE,  aspectName: "mrba:inboundInvoiceReference", associationName: "mrba:inboundInvoice", targetClass: "mrba:inboundInvoice"}],
  [EMRBauDocumentAssociations.INBOUND_REVOKED_INVOICE_REFERENCE, {category: EMRBauDocumentAssociations.INBOUND_REVOKED_INVOICE_REFERENCE,  aspectName: "mrba:inboundRevokedInvoiceReference", associationName: "mrba:inboundRevokedInvoice", targetClass: "mrba:inboundInvoice"}],
  [EMRBauDocumentAssociations.INBOUND_PARTIAL_INVOICE_REFERENCE, {category: EMRBauDocumentAssociations.INBOUND_PARTIAL_INVOICE_REFERENCE,  aspectName: "mrba:inboundPartialInvoiceReference", associationName: "mrba:inboundPartialInvoice", targetClass: "mrba:inboundInvoice"}],
  [EMRBauDocumentAssociations.OUTBOUND_INVOICE_REFERENCE, {category: EMRBauDocumentAssociations.OUTBOUND_INVOICE_REFERENCE,  aspectName: "mrba:outboundInvoiceReference", associationName: "mrba:outboundInvoice", targetClass: "mrba:outboundInvoice"}],
  [EMRBauDocumentAssociations.OUTBOUND_REVOKED_INVOICE_REFERENCE, {category: EMRBauDocumentAssociations.OUTBOUND_REVOKED_INVOICE_REFERENCE,  aspectName: "mrba:outboundRevokedInvoiceReference", associationName: "mrba:outboundRevokedInvoice", targetClass: "mrba:outboundInvoice"}],
  [EMRBauDocumentAssociations.OUTBOUND_PARTIAL_INVOICE_REFERENCE, {category: EMRBauDocumentAssociations.OUTBOUND_PARTIAL_INVOICE_REFERENCE,  aspectName: "mrba:outboundPartialInvoiceReference", associationName: "mrba:outboundPartialInvoice", targetClass: "mrba:outboundInvoice"}],

  [EMRBauDocumentAssociations.CONTRACT_REFERENCE, {category: EMRBauDocumentAssociations.CONTRACT_REFERENCE,  aspectName: "mrba:contractDocumentReference", associationName: "mrba:contractDocument", targetClass: "mrba:contractDocument"}],
  [EMRBauDocumentAssociations.CANCELLED_CONTRACT_REFERENCE, {category: EMRBauDocumentAssociations.CANCELLED_CONTRACT_REFERENCE,  aspectName: "mrba:cancelledContractReference", associationName: "mrba:cancelledContract", targetClass: "mrba:contractDocument"}],
]);

export const enum EMRBauDocumentCategory {
  // BILLS
  ARCHIVE_DOCUMENT,
  OFFER, //"mrba:offer",
  ORDER, //"mrba:order",
  ORDER_NEGOTIATION_PROTOCOL, // "mrba:orderNegotiationProtocol",
  DELIVERY_NOTE,  //"mrba:deliveryNote",
  ER, //"mrba:inboundInvoice",
  AR, //"mrba:outboundInvoice",
  PAYMENT_TERMS,//"mrba:frameworkContract",
  INVOICE_REVIEW_SHEET, //mrba:invoiceReviewSheet
  OTHER_BILL, //"mrba:miscellaneousDocument",

  // CONTRACTS
  CONTRACT_DOCUMENT, //"mrba:contractDocument"
  RENT_CONTRACT, //"mrba:rentContract"
  CONTRACT_CANCELLATION_WAIVER, //"mrba:contractCancellationWaiver"
  MAINTENANCE_CONTRACT, //"mrba:maintenanceContract"
  ALL_IN_CONTRACT, //"mrba:allInContract"
  LICENSE_CONTRACT, //"mrba:licenseContract"
  FINANCING_CONTRACT, //"mrba:financingContract"
  WORK_CONTRACT, //"mrba:workContract"
  CONTRACT_CANCELLATION, //"mrba:contractCancellation"
  OTHER_CONTRACT, //"mrba:miscellaneousContractDocument"
}

export const enum EMRBauDocumentCategoryGroup {
  BILLS        = 0,
  CONTRACTS    = 1,
}
interface IDocumentCategoryGroupData {
  category: EMRBauDocumentCategoryGroup,
  label: string,
  folder: string,
}
export const DocumentCategoryGroups = new Map<number, IDocumentCategoryGroupData>([
  [EMRBauDocumentCategoryGroup.BILLS, {category: EMRBauDocumentCategoryGroup.BILLS, label: "Belege", folder: "01 Belege"}],
  [EMRBauDocumentCategoryGroup.CONTRACTS, {category: EMRBauDocumentCategoryGroup.CONTRACTS, label: "Verträge", folder: "02 Verträge"}],
]);

export const enum EMRBauOrderTypes {
  AUFTRAG       = 0,
  ZUSATZAUFTRAG = 1,
}
interface IDocumentOrderTypeData {
  category: EMRBauOrderTypes,
  label: string,
  value: string,
}
export const DocumentOrderTypes = new Map<number, IDocumentOrderTypeData>([
  [EMRBauOrderTypes.AUFTRAG, {category: EMRBauOrderTypes.AUFTRAG, label :"Auftrag", value :"Auftrag"}],
  [EMRBauOrderTypes.ZUSATZAUFTRAG, {category: EMRBauOrderTypes.ZUSATZAUFTRAG, label: "Zusatzauftrag", value:"Zusatzauftrag"}],
]);

export const enum EMRBauInvoiceTypes {
  EINZELRECHNUNG  = 0,
  SCHLUSSRECHNUNG = 1,
  ANZAHLUNG = 2,
}
interface IDocumentInvoiceTypeData {
  category: EMRBauInvoiceTypes,
  label: string,
  value: string,
}
export const DocumentInvoiceTypes = new Map<number, IDocumentInvoiceTypeData>([
  [EMRBauInvoiceTypes.EINZELRECHNUNG, {category: EMRBauInvoiceTypes.EINZELRECHNUNG, label :"Einzelrechnung", value :"Einzelrechnung"}],
  [EMRBauInvoiceTypes.SCHLUSSRECHNUNG, {category: EMRBauInvoiceTypes.SCHLUSSRECHNUNG, label: "Schlussrechnung", value:"Schlussrechnung"}],
  [EMRBauInvoiceTypes.ANZAHLUNG, {category: EMRBauInvoiceTypes.ANZAHLUNG, label: "Teil-/Anzahlungsrechnung", value:"Anzahlung"}],
]);

export interface IMRBauFormDefinition {
  formlyFieldConfigs : string[]; // name maps to this.mrbauFormLibraryService.name
  mandatoryRequiredProperties: string[];
}
export interface IMRBauDocumentType {
  title:string,
  name: string,
  parent?: string,
  mandatoryAspects?: string[],
  category: EMRBauDocumentCategory,
  folder: string,
  group: IDocumentCategoryGroupData,
  mrbauFormDefinitions: {
    [key: string]: IMRBauFormDefinition;
  }
  mrbauWorkflowDefinition: {
    states: IMRBauWorkflowState[]
  }
}

export interface MRBauWorkflowStateCallbackData {
  taskDetailNewDocument : TasksDetailNewDocumentComponent,
  /*task: MRBauTask,
  node: Node,
  nodeAssociations: NodeAssociationEntry[],
  model: any,
  form: FormGroup,*/
}
export type MRBauWorkflowStateCallback = (data?:MRBauWorkflowStateCallbackData) => Promise<any>;
export interface IMRBauWorkflowState {
  state: EMRBauTaskStatus;
  nextState : MRBauWorkflowStateCallback; // get next State
  prevState : MRBauWorkflowStateCallback; // get previous State
  onEnterAction? : MRBauWorkflowStateCallback; // perform on enter action
}

// COMMONLY USED DEFINITIONS
const METADATA_EXTRACT_1_FORM_DEFINITION = [
    'title_mrba_companyId',
    'element_mrba_companyId',
    'title_mrba_costCarrierDetails',
    'aspect_mrba_costCarrierDetails',
  ];

const CONTRACT_DEFAULT_FORM_DEFINITION = {
  'STATUS_METADATA_EXTRACT_1' : {
    formlyFieldConfigs: [
      'title_mrba_companyId',
      'element_mrba_companyId',
      'title_mrba_costCarrierDetails',
      'aspect_mrba_costCarrierDetails',
    ],
    mandatoryRequiredProperties: [
      'mrba:companyId',
    ]
  },
  'STATUS_METADATA_EXTRACT_2' : {
    formlyFieldConfigs: [
      'title_mrba_documentIdentityDetails',
      'aspect_mrba_documentIdentityDetails',
      'title_mrba_contractCoreDetails',
      'aspect_mrba_contractCoreDetails',
    ],
    mandatoryRequiredProperties: [
      'mrba:documentTopic',
      'mrba:documentNumber',
      'mrba:documentDateValue',
      'mrba:contractStartValue'
    ]
  },
  'STATUS_DUPLICATE' : {
    formlyFieldConfigs: [
      'duplicated_document_form'
    ],
    mandatoryRequiredProperties: [
    ]
  },
  'STATUS_ALL_SET' : {
    formlyFieldConfigs: [
      'workflow_all_set_form'
      ],
      mandatoryRequiredProperties: [
      ]
  }
};

// ARCHIVE MODEL
export class MrbauArchiveModel {
  constructor(
    private mrbauWorkflowService : MrbauWorkflowService,
    ){}

  isContractDocument(nodeType:string)
  {
    return this.mrbauContracts.map( d => d.name).indexOf(nodeType) >= 0;
  }

  // find first task state if status is new, otherwise do nothing
  initTaskStateFromNodeType(state : EMRBauTaskStatus, nodeType: string) : EMRBauTaskStatus {
    let currentState = state;
    if (state == EMRBauTaskStatus.STATUS_NEW)
    {
      // select first status
      let docModel = this.mrbauArchiveModelTypes.filter(doc => doc.name == nodeType);
      if (docModel.length > 0)
      {
        const workflowStates = docModel[0].mrbauWorkflowDefinition.states;
        if (workflowStates.length > 0)
        {
          currentState = workflowStates[0].state;
        }
      }
    }
    return currentState;
  }

  getDocumentCategoryFromName(name:string) : EMRBauDocumentCategory {
    let docModel = this.mrbauArchiveModelTypes.filter(doc => doc.name == name);
    if (docModel.length > 0)
    {
      return docModel[0].category
    }

    return null;
  }

  getWorkFlowStateFromNodeType(data:MRBauWorkflowStateCallbackData) : IMRBauWorkflowState {
    const state = data.taskDetailNewDocument.task.status;
    const nodeType = data.taskDetailNewDocument.taskNode.nodeType;
    let docModel = this.mrbauArchiveModelTypes.filter(doc => doc.name == nodeType);
    if (docModel.length > 0)
    {
      const workflowStates = docModel[0].mrbauWorkflowDefinition.states;
      if (workflowStates.length > 0)
      {
        for (let i = 0; i< workflowStates.length; i++ )
        {
          if (workflowStates[i].state == state)
          {
            return workflowStates[i];
          }
        }
      }
    }
    return null;
  }

  getNextTaskStateFromNodeType(data:MRBauWorkflowStateCallbackData) : Promise<EMRBauTaskStatus> {
    const workflowState = this.getWorkFlowStateFromNodeType(data);
    return (workflowState) ? workflowState.nextState(data) : new Promise<EMRBauTaskStatus>(resolve => resolve(data.taskDetailNewDocument.task.status));
  }

  getPrevTaskStateFromNodeType(data:MRBauWorkflowStateCallbackData) : Promise<EMRBauTaskStatus> {
    const workflowState = this.getWorkFlowStateFromNodeType(data);
    return (workflowState) ? workflowState.prevState(data) : new Promise<EMRBauTaskStatus>(resolve => resolve(data.taskDetailNewDocument.task.status));
  }

  readonly mrbauBelege : IMRBauDocumentType[] = [
    {
      title: "doc",
      name : "mrba:archiveDocument",
      //parent : "cm:content",
      //mandatoryAspects : [
      //  "mrba:archiveDates",
      //  "mrba:archiveIdentifiers",
      //  "cm:versionable"
      //],
      category: EMRBauDocumentCategory.ARCHIVE_DOCUMENT,
      folder: "-",
      group : DocumentCategoryGroups.get(EMRBauDocumentCategoryGroup.BILLS),
      mrbauFormDefinitions : null,
      mrbauWorkflowDefinition: {states : null},
    },
    {
      title: "Angebot",
      name : "mrba:offer",
      //parent : "mrba:archiveDocument",
      //mandatoryAspects : [
      //  "mrba:companyIdentifiers",
      //  "mrba:documentIdentityDetails",
      //  "mrba:amountDetails",
      //  "mrba:taxRate",
      //],
      category: EMRBauDocumentCategory.OFFER,
      folder: "01 Angebote",
      group : DocumentCategoryGroups.get(EMRBauDocumentCategoryGroup.BILLS),
      mrbauWorkflowDefinition: {states : [
        {state : EMRBauTaskStatus.STATUS_METADATA_EXTRACT_1,
          nextState : () => new Promise<EMRBauTaskStatus>(resolve => resolve(EMRBauTaskStatus.STATUS_METADATA_EXTRACT_2)),
          prevState : () => new Promise<EMRBauTaskStatus>(resolve => resolve(EMRBauTaskStatus.STATUS_METADATA_EXTRACT_1))},
        {state : EMRBauTaskStatus.STATUS_METADATA_EXTRACT_2,
          nextState : (data) => new Promise<EMRBauTaskStatus>((resolve, reject) => {
            this.mrbauWorkflowService.performDuplicateCheck(data)
            .then( (duplicatedData) =>
            {
              resolve( duplicatedData ? EMRBauTaskStatus.STATUS_DUPLICATE : EMRBauTaskStatus.STATUS_ALL_SET);
            })
            .catch( (error) => reject(error))
          }),
          prevState : () => new Promise<EMRBauTaskStatus>(resolve => resolve(EMRBauTaskStatus.STATUS_METADATA_EXTRACT_1)),
          onEnterAction : (data) => this.mrbauWorkflowService.cloneMetadataFromLinkedDocuments(data)
        },
        {state : EMRBauTaskStatus.STATUS_DUPLICATE,
          nextState : (data) => new Promise<EMRBauTaskStatus>((resolve, reject) => {
            this.mrbauWorkflowService.resolveDuplicateIssue(data)
            .then( (result) =>
            {
              let newState = EMRBauTaskStatus.STATUS_DUPLICATE;
              switch (result)
              {
                case EMRBauDuplicateResolveResult.IGNORE: newState = EMRBauTaskStatus.STATUS_ALL_SET; break;
                case EMRBauDuplicateResolveResult.DELETE_SUCCESS: newState = EMRBauTaskStatus.STATUS_FINISHED;break
                case EMRBauDuplicateResolveResult.DELETE_CANCEL: newState = EMRBauTaskStatus.STATUS_DUPLICATE;break;
                case EMRBauDuplicateResolveResult.NEW_VERSION: newState = EMRBauTaskStatus.STATUS_ALL_SET;break;
              }
              resolve(newState);
            })
            .catch( (error) => reject(error))
          }),
          prevState : () => new Promise<EMRBauTaskStatus>(resolve => resolve(EMRBauTaskStatus.STATUS_METADATA_EXTRACT_2)),
        },
        {state : EMRBauTaskStatus.STATUS_ALL_SET,
          nextState : () => new Promise<EMRBauTaskStatus>(resolve => resolve(EMRBauTaskStatus.STATUS_FINISHED)),
          prevState : () => new Promise<EMRBauTaskStatus>(resolve => resolve(EMRBauTaskStatus.STATUS_METADATA_EXTRACT_2))},
        {state : EMRBauTaskStatus.STATUS_FINISHED,
          nextState : () => new Promise<EMRBauTaskStatus>(resolve => resolve(EMRBauTaskStatus.STATUS_FINISHED)),
          prevState : () => new Promise<EMRBauTaskStatus>(resolve => resolve(EMRBauTaskStatus.STATUS_ALL_SET))},
      ]},
      mrbauFormDefinitions : {
        'STATUS_METADATA_EXTRACT_1' : {
          formlyFieldConfigs: METADATA_EXTRACT_1_FORM_DEFINITION,
          mandatoryRequiredProperties: [
            'mrba:companyId',
          ]
        },
        'STATUS_METADATA_EXTRACT_2' : {
          formlyFieldConfigs: [
            'title_mrba_documentIdentityDetails',
            'aspect_mrba_documentIdentityDetails',
            'title_mrba_amountDetails_mrba_taxRate',
            'aspect_mrba_amountDetails_mrba_taxRate',
          ],
          mandatoryRequiredProperties: [
            'mrba:documentNumber',
            'mrba:documentDateValue',
          ]
        },
        'STATUS_DUPLICATE' : {
          formlyFieldConfigs: [
            'duplicated_document_form'
          ],
          mandatoryRequiredProperties: [
          ]
        },
        'STATUS_ALL_SET' : {
          formlyFieldConfigs: [
            'workflow_all_set_form'
            ],
            mandatoryRequiredProperties: [
            ]
        }
      },
    },
    {
      title: "Auftrag",
      name : "mrba:order",
      //parent : "mrba:archiveDocument",
      //mandatoryAspects : [
      //  "mrba:companyIdentifiers",
      //  "mrba:documentIdentityDetails",
      //  "mrba:costCarrierDetails",
      //  "mrba:orderDetails",
      //  "mrba:amountDetails",
      //  "mrba:taxRate",
      //  "mrba:paymentConditionDetails",

      //  "mrba:offerReference",
      //  "mrba:frameworkContractReference",
      //],
      category: EMRBauDocumentCategory.ORDER,
      folder: "02 Aufträge",
      group : DocumentCategoryGroups.get(EMRBauDocumentCategoryGroup.BILLS),
      mrbauWorkflowDefinition: {states : [
        {state : EMRBauTaskStatus.STATUS_METADATA_EXTRACT_1,
          nextState : () => new Promise<EMRBauTaskStatus>(resolve => resolve(EMRBauTaskStatus.STATUS_LINK_DOCUMENTS)),
          prevState : () => new Promise<EMRBauTaskStatus>(resolve => resolve(EMRBauTaskStatus.STATUS_METADATA_EXTRACT_1))},
        {state : EMRBauTaskStatus.STATUS_LINK_DOCUMENTS,
          nextState : (data) => new Promise<EMRBauTaskStatus>((resolve, reject) => {
            this.mrbauWorkflowService.createAssociationsForProposedDocuments(data)
            .then( () =>
            {
              resolve(EMRBauTaskStatus.STATUS_METADATA_EXTRACT_2);
            })
            .catch( (error) => reject(error))
            }),
          prevState : () => new Promise<EMRBauTaskStatus>(resolve => resolve(EMRBauTaskStatus.STATUS_METADATA_EXTRACT_1)),},
        {state : EMRBauTaskStatus.STATUS_METADATA_EXTRACT_2,
          nextState : (data) => new Promise<EMRBauTaskStatus>((resolve, reject) => {
            this.mrbauWorkflowService.performDuplicateCheck(data)
            .then( (duplicatedData) =>
            {
              resolve( duplicatedData ? EMRBauTaskStatus.STATUS_DUPLICATE : EMRBauTaskStatus.STATUS_ALL_SET);
            })
            .catch( (error) => reject(error))
          }),
          prevState : () => new Promise<EMRBauTaskStatus>(resolve => resolve(EMRBauTaskStatus.STATUS_LINK_DOCUMENTS)),
          onEnterAction : (data) => this.mrbauWorkflowService.cloneMetadataFromLinkedDocuments(data)
        },
        {state : EMRBauTaskStatus.STATUS_DUPLICATE,
          nextState : (data) => new Promise<EMRBauTaskStatus>((resolve, reject) => {
            this.mrbauWorkflowService.resolveDuplicateIssue(data)
            .then( (result) =>
            {
              let newState = EMRBauTaskStatus.STATUS_DUPLICATE;
              switch (result)
              {
                case EMRBauDuplicateResolveResult.IGNORE: newState = EMRBauTaskStatus.STATUS_ALL_SET; break;
                case EMRBauDuplicateResolveResult.DELETE_SUCCESS: newState = EMRBauTaskStatus.STATUS_FINISHED;break
                case EMRBauDuplicateResolveResult.DELETE_CANCEL: newState = EMRBauTaskStatus.STATUS_DUPLICATE;break;
                case EMRBauDuplicateResolveResult.NEW_VERSION: newState = EMRBauTaskStatus.STATUS_ALL_SET;break;
              }
              resolve(newState);
            })
            .catch( (error) => reject(error))
          }),
          prevState : () => new Promise<EMRBauTaskStatus>(resolve => resolve(EMRBauTaskStatus.STATUS_METADATA_EXTRACT_2)),
        },
        {state : EMRBauTaskStatus.STATUS_ALL_SET,
          nextState : () => new Promise<EMRBauTaskStatus>(resolve => resolve(EMRBauTaskStatus.STATUS_FINISHED)),
          prevState : () => new Promise<EMRBauTaskStatus>(resolve => resolve(EMRBauTaskStatus.STATUS_METADATA_EXTRACT_2))},
        {state : EMRBauTaskStatus.STATUS_FINISHED,
          nextState : () => new Promise<EMRBauTaskStatus>(resolve => resolve(EMRBauTaskStatus.STATUS_FINISHED)),
          prevState : () => new Promise<EMRBauTaskStatus>(resolve => resolve(EMRBauTaskStatus.STATUS_ALL_SET))},
      ]},
      mrbauFormDefinitions : {
        'STATUS_METADATA_EXTRACT_1' : {
          formlyFieldConfigs: METADATA_EXTRACT_1_FORM_DEFINITION,
          mandatoryRequiredProperties: [
            'mrba:companyId',
            'mrba:costCarrierNumber', //d:int
            'mrba:projectName'
          ]
        },
        'STATUS_LINK_DOCUMENTS' : {
          formlyFieldConfigs: [],
          mandatoryRequiredProperties: []
        },
        'STATUS_METADATA_EXTRACT_2' : {
          formlyFieldConfigs: [
            'title_mrba_orderType',
            'element_mrba_orderType',
            'title_mrba_documentIdentityDetails',
            'aspect_mrba_documentIdentityDetails',
            'title_mrba_amountDetails_mrba_taxRate',
            'aspect_mrba_amountDetails_mrba_taxRate',
            'title_mrba_paymentConditionDetails',
            'aspect_mrba_paymentConditionDetails',
          ],
          mandatoryRequiredProperties: [
            'mrba:orderType',
            'mrba:documentNumber',
            'mrba:documentDateValue',
            'mrba:netAmount',
            'mrba:grossAmount',
            'mrba:taxRate',
            'mrba:reviewDaysFinalInvoice',
            'mrba:paymentTargetDays',
          ]
        },
        'STATUS_DUPLICATE' : {
          formlyFieldConfigs: [
            'duplicated_document_form'
          ],
          mandatoryRequiredProperties: [
          ]
        },
        'STATUS_ALL_SET' : {
          formlyFieldConfigs: [
            'workflow_all_set_form'
            ],
            mandatoryRequiredProperties: [
            ]
        }
      }
    },
    {
      title: "Zahlungsvereinbarungen",
      name : "mrba:frameworkContract",
      //parent : "mrba:archiveDocument",
      //mandatoryAspects : [
      //  "mrba:companyIdentifiers",
      // TODO mrba:documentIdentityDetails
      //  "mrba:paymentConditionDetails",
      //  "mrba:inboundInvoiceReference",
      //  "mrba:inboundPartialInvoiceReference",
      //],
      category: EMRBauDocumentCategory.PAYMENT_TERMS,
      folder: "03 Zahlungsvereinbarungen",
      group : DocumentCategoryGroups.get(EMRBauDocumentCategoryGroup.BILLS),
      mrbauWorkflowDefinition: {states : [
        {state : EMRBauTaskStatus.STATUS_METADATA_EXTRACT_1,
          nextState : () => new Promise<EMRBauTaskStatus>(resolve => resolve(EMRBauTaskStatus.STATUS_METADATA_EXTRACT_2)),
          prevState : () => new Promise<EMRBauTaskStatus>(resolve => resolve(EMRBauTaskStatus.STATUS_METADATA_EXTRACT_1))},
        {state : EMRBauTaskStatus.STATUS_METADATA_EXTRACT_2,
          nextState : (data) => new Promise<EMRBauTaskStatus>((resolve, reject) => {
            this.mrbauWorkflowService.performDuplicateCheck(data)
            .then( (duplicatedData) =>
            {
              resolve( duplicatedData ? EMRBauTaskStatus.STATUS_DUPLICATE : EMRBauTaskStatus.STATUS_ALL_SET);
            })
            .catch( (error) => reject(error))
          }),
          prevState : () => new Promise<EMRBauTaskStatus>(resolve => resolve(EMRBauTaskStatus.STATUS_METADATA_EXTRACT_1)),
          onEnterAction : (data) => this.mrbauWorkflowService.cloneMetadataFromLinkedDocuments(data)
        },
        {state : EMRBauTaskStatus.STATUS_DUPLICATE,
          nextState : (data) => new Promise<EMRBauTaskStatus>((resolve, reject) => {
            this.mrbauWorkflowService.resolveDuplicateIssue(data)
            .then( (result) =>
            {
              let newState = EMRBauTaskStatus.STATUS_DUPLICATE;
              switch (result)
              {
                case EMRBauDuplicateResolveResult.IGNORE: newState = EMRBauTaskStatus.STATUS_ALL_SET; break;
                case EMRBauDuplicateResolveResult.DELETE_SUCCESS: newState = EMRBauTaskStatus.STATUS_FINISHED;break
                case EMRBauDuplicateResolveResult.DELETE_CANCEL: newState = EMRBauTaskStatus.STATUS_DUPLICATE;break;
                case EMRBauDuplicateResolveResult.NEW_VERSION: newState = EMRBauTaskStatus.STATUS_ALL_SET;break;
              }
              resolve(newState);
            })
            .catch( (error) => reject(error))
          }),
          prevState : () => new Promise<EMRBauTaskStatus>(resolve => resolve(EMRBauTaskStatus.STATUS_METADATA_EXTRACT_2)),
        },
        {state : EMRBauTaskStatus.STATUS_ALL_SET,
          nextState : () => new Promise<EMRBauTaskStatus>(resolve => resolve(EMRBauTaskStatus.STATUS_FINISHED)),
          prevState : () => new Promise<EMRBauTaskStatus>(resolve => resolve(EMRBauTaskStatus.STATUS_METADATA_EXTRACT_2))},
        {state : EMRBauTaskStatus.STATUS_FINISHED,
          nextState : () => new Promise<EMRBauTaskStatus>(resolve => resolve(EMRBauTaskStatus.STATUS_FINISHED)),
          prevState : () => new Promise<EMRBauTaskStatus>(resolve => resolve(EMRBauTaskStatus.STATUS_ALL_SET))},
      ]},
      mrbauFormDefinitions : {
        'STATUS_METADATA_EXTRACT_1' : {
          formlyFieldConfigs: [
            'title_mrba_companyId',
            'element_mrba_companyId',
          ],
          mandatoryRequiredProperties: [
            'mrba:companyId',
          ]
        },
        'STATUS_METADATA_EXTRACT_2' : {
          formlyFieldConfigs: [
            'title_mrba_documentIdentityDetails',
            'aspect_mrba_documentIdentityDetails',
            'title_mrba_paymentConditionDetails',
            'aspect_mrba_paymentConditionDetails',
          ],
          mandatoryRequiredProperties: [
            'mrba:documentDateValue',
            'mrba:reviewDaysFinalInvoice',
            'mrba:paymentTargetDays',
          ]
        },
        'STATUS_DUPLICATE' : {
          formlyFieldConfigs: [
            'duplicated_document_form'
          ],
          mandatoryRequiredProperties: [
          ]
        },
        'STATUS_ALL_SET' : {
          formlyFieldConfigs: [
            'workflow_all_set_form'
            ],
            mandatoryRequiredProperties: [
            ]
        }
      },
    },
    {
      title: "Lieferschein",
      name : "mrba:deliveryNote",
      parent : "mrba:archiveDocument",
      //mandatoryAspects : [
      //  "mrba:companyIdentifiers",
      //  "mrba:documentIdentityDetails",
      //  "mrba:costCarrierDetails",
      //],
      category: EMRBauDocumentCategory.DELIVERY_NOTE,
      folder: "04 Lieferscheine",
      group : DocumentCategoryGroups.get(EMRBauDocumentCategoryGroup.BILLS),
      mrbauWorkflowDefinition: {states : [
        {state : EMRBauTaskStatus.STATUS_METADATA_EXTRACT_1,
          nextState : () => new Promise<EMRBauTaskStatus>(resolve => resolve(EMRBauTaskStatus.STATUS_METADATA_EXTRACT_2)),
          prevState : () => new Promise<EMRBauTaskStatus>(resolve => resolve(EMRBauTaskStatus.STATUS_METADATA_EXTRACT_1))},
        {state : EMRBauTaskStatus.STATUS_METADATA_EXTRACT_2,
          nextState : (data) => new Promise<EMRBauTaskStatus>((resolve, reject) => {
            this.mrbauWorkflowService.performDuplicateCheck(data)
            .then( (duplicatedData) =>
            {
              resolve( duplicatedData ? EMRBauTaskStatus.STATUS_DUPLICATE : EMRBauTaskStatus.STATUS_ALL_SET);
            })
            .catch( (error) => reject(error))
          }),
          prevState : () => new Promise<EMRBauTaskStatus>(resolve => resolve(EMRBauTaskStatus.STATUS_METADATA_EXTRACT_1)),
          onEnterAction : (data) => this.mrbauWorkflowService.cloneMetadataFromLinkedDocuments(data)
        },
        {state : EMRBauTaskStatus.STATUS_DUPLICATE,
          nextState : (data) => new Promise<EMRBauTaskStatus>((resolve, reject) => {
            this.mrbauWorkflowService.resolveDuplicateIssue(data)
            .then( (result) =>
            {
              let newState = EMRBauTaskStatus.STATUS_DUPLICATE;
              switch (result)
              {
                case EMRBauDuplicateResolveResult.IGNORE: newState = EMRBauTaskStatus.STATUS_ALL_SET; break;
                case EMRBauDuplicateResolveResult.DELETE_SUCCESS: newState = EMRBauTaskStatus.STATUS_FINISHED;break
                case EMRBauDuplicateResolveResult.DELETE_CANCEL: newState = EMRBauTaskStatus.STATUS_DUPLICATE;break;
                case EMRBauDuplicateResolveResult.NEW_VERSION: newState = EMRBauTaskStatus.STATUS_ALL_SET;break;
              }
              resolve(newState);
            })
            .catch( (error) => reject(error))
          }),
          prevState : () => new Promise<EMRBauTaskStatus>(resolve => resolve(EMRBauTaskStatus.STATUS_METADATA_EXTRACT_2)),
        },
        {state : EMRBauTaskStatus.STATUS_ALL_SET,
          nextState : () => new Promise<EMRBauTaskStatus>(resolve => resolve(EMRBauTaskStatus.STATUS_FINISHED)),
          prevState : () => new Promise<EMRBauTaskStatus>(resolve => resolve(EMRBauTaskStatus.STATUS_METADATA_EXTRACT_2))},
        {state : EMRBauTaskStatus.STATUS_FINISHED,
          nextState : () => new Promise<EMRBauTaskStatus>(resolve => resolve(EMRBauTaskStatus.STATUS_FINISHED)),
          prevState : () => new Promise<EMRBauTaskStatus>(resolve => resolve(EMRBauTaskStatus.STATUS_ALL_SET))},
      ]},
      mrbauFormDefinitions : {
        'STATUS_METADATA_EXTRACT_1' : {
          formlyFieldConfigs: METADATA_EXTRACT_1_FORM_DEFINITION,
          mandatoryRequiredProperties: [
            'mrba:companyId',
            'mrba:costCarrierNumber', //d:int
            'mrba:projectName'
          ]
        },
        'STATUS_METADATA_EXTRACT_2' : {
          formlyFieldConfigs: [
            'title_mrba_documentIdentityDetails',
            'aspect_mrba_documentIdentityDetails',
          ],
          mandatoryRequiredProperties: [
            'mrba:documentNumber',
            'mrba:documentDateValue',
          ]
        },
        'STATUS_DUPLICATE' : {
          formlyFieldConfigs: [
            'duplicated_document_form'
          ],
          mandatoryRequiredProperties: [
          ]
        },
        'STATUS_ALL_SET' : {
          formlyFieldConfigs: [
            'workflow_all_set_form'
            ],
            mandatoryRequiredProperties: [
            ]
        },
      }
    },
    {
      title: "Eingangsrechnung",
      name : "mrba:inboundInvoice",
      //parent : "mrba:archiveDocument",
      //mandatoryAspects : [
      //  "mrba:companyIdentifiers",
      //  "mrba:documentIdentityDetails",
      //  "mrba:fiscalYearDetails", ?
      //  "mrba:inboundInvoiceDetails",
      //  "mrba:taxRate",
      //  "mrba:paymentConditionDetails",
      //  "mrba:costCarrierDetails",
      //  "mrba:orderReference",
      //  "mrba:deliveryNoteReference",
      //  "mrba:inboundInvoiceReference",
      //  "mrba:inboundRevokedInvoiceReference",
      //  "mrba:inboundPartialInvoiceReference",
      //],
      category: EMRBauDocumentCategory.ER,
      folder: "05 Eingangsrechnungen",
      group : DocumentCategoryGroups.get(EMRBauDocumentCategoryGroup.BILLS),
      mrbauWorkflowDefinition: {states : [
        {state : EMRBauTaskStatus.STATUS_METADATA_EXTRACT_1,
          nextState : () => new Promise<EMRBauTaskStatus>(resolve => resolve(EMRBauTaskStatus.STATUS_LINK_DOCUMENTS)),
          prevState : () => new Promise<EMRBauTaskStatus>(resolve => resolve(EMRBauTaskStatus.STATUS_METADATA_EXTRACT_1))},
        {state : EMRBauTaskStatus.STATUS_LINK_DOCUMENTS,
          nextState : (data) => new Promise<EMRBauTaskStatus>((resolve, reject) => {
            this.mrbauWorkflowService.createAssociationsForProposedDocuments(data)
            .then( () =>
            {
              resolve(EMRBauTaskStatus.STATUS_METADATA_EXTRACT_2);
            })
            .catch( (error) => reject(error))
            }),
          prevState : () => new Promise<EMRBauTaskStatus>(resolve => resolve(EMRBauTaskStatus.STATUS_METADATA_EXTRACT_1)),},
        {state : EMRBauTaskStatus.STATUS_METADATA_EXTRACT_2,
          nextState : (data) => new Promise<EMRBauTaskStatus>((resolve, reject) => {
            this.mrbauWorkflowService.performDuplicateCheck(data)
            .then( (duplicatedData) =>
            {
              resolve( duplicatedData ? EMRBauTaskStatus.STATUS_DUPLICATE : EMRBauTaskStatus.STATUS_FORMAL_REVIEW);
            })
            .catch( (error) => reject(error))
          }),
          prevState : () => new Promise<EMRBauTaskStatus>(resolve => resolve(EMRBauTaskStatus.STATUS_LINK_DOCUMENTS)),
          onEnterAction : (data) => this.mrbauWorkflowService.cloneMetadataFromLinkedDocuments(data)
        },
        {state : EMRBauTaskStatus.STATUS_DUPLICATE,
          nextState : (data) => new Promise<EMRBauTaskStatus>((resolve, reject) => {
            this.mrbauWorkflowService.resolveDuplicateIssue(data)
            .then( (result) =>
            {
              let newState = EMRBauTaskStatus.STATUS_DUPLICATE;
              switch (result)
              {
                case EMRBauDuplicateResolveResult.IGNORE: newState = EMRBauTaskStatus.STATUS_ALL_SET; break;
                case EMRBauDuplicateResolveResult.DELETE_SUCCESS: newState = EMRBauTaskStatus.STATUS_FINISHED;break
                case EMRBauDuplicateResolveResult.DELETE_CANCEL: newState = EMRBauTaskStatus.STATUS_FORMAL_REVIEW;break;
                case EMRBauDuplicateResolveResult.NEW_VERSION: newState = EMRBauTaskStatus.STATUS_ALL_SET;break;
              }
              resolve(newState);
            })
            .catch( (error) => reject(error))
          }),
          prevState : () => new Promise<EMRBauTaskStatus>(resolve => resolve(EMRBauTaskStatus.STATUS_METADATA_EXTRACT_2)),
        },
        {state : EMRBauTaskStatus.STATUS_FORMAL_REVIEW,
          nextState : (data) => new Promise<EMRBauTaskStatus>((resolve, reject) => {
            this.mrbauWorkflowService.assignNewUserWithDialog(data, EMRBauTaskStatus.STATUS_INVOICE_VERIFICATION)
            .then( (node) => {
              console.log(node);
              resolve(EMRBauTaskStatus.STATUS_INVOICE_VERIFICATION); })
            .catch( (error) => reject(error))
          }),
          prevState : () => new Promise<EMRBauTaskStatus>(resolve => resolve(EMRBauTaskStatus.STATUS_METADATA_EXTRACT_2)),
        },
        {state : EMRBauTaskStatus.STATUS_INVOICE_VERIFICATION,
          nextState : () => new Promise<EMRBauTaskStatus>(resolve => resolve(EMRBauTaskStatus.STATUS_INVOICE_REVIEW)),
          prevState : () => new Promise<EMRBauTaskStatus>(resolve => resolve(EMRBauTaskStatus.STATUS_FORMAL_REVIEW)),
          onEnterAction : (data) => this.mrbauWorkflowService.invoiceVerificationPrefillValues(data)
        },
        {state : EMRBauTaskStatus.STATUS_INVOICE_REVIEW,
          nextState : (data) => new Promise<EMRBauTaskStatus>((resolve, reject) => {
            this.mrbauWorkflowService.assignNewUser(data, EMRBauTaskStatus.STATUS_FINAL_APPROVAL)
            .then( () => { resolve(EMRBauTaskStatus.STATUS_FINAL_APPROVAL); })
            .catch( (error) => reject(error))
          }),
          prevState : () => new Promise<EMRBauTaskStatus>(resolve => resolve(EMRBauTaskStatus.STATUS_INVOICE_VERIFICATION)),
        },
        {state : EMRBauTaskStatus.STATUS_FINAL_APPROVAL,
          nextState : (data) => new Promise<EMRBauTaskStatus>((resolve, reject) => {
            this.mrbauWorkflowService.assignNewUserWithDialog(data, EMRBauTaskStatus.STATUS_ACCOUNTING)
            .then( () => { resolve(EMRBauTaskStatus.STATUS_ACCOUNTING); })
            .catch( (error) => reject(error))
          }),
          prevState : () => new Promise<EMRBauTaskStatus>(resolve => resolve(EMRBauTaskStatus.STATUS_INVOICE_VERIFICATION)),
        },
        {state : EMRBauTaskStatus.STATUS_ACCOUNTING,
          nextState : () => new Promise<EMRBauTaskStatus>(resolve => resolve(EMRBauTaskStatus.STATUS_ALL_SET)),
          prevState : () => new Promise<EMRBauTaskStatus>(resolve => resolve(EMRBauTaskStatus.STATUS_INVOICE_VERIFICATION)),
        },
        {state : EMRBauTaskStatus.STATUS_ALL_SET,
          nextState : () => new Promise<EMRBauTaskStatus>(resolve => resolve(EMRBauTaskStatus.STATUS_FINISHED)),
          prevState : () => new Promise<EMRBauTaskStatus>(resolve => resolve(EMRBauTaskStatus.STATUS_ACCOUNTING))},
        {state : EMRBauTaskStatus.STATUS_FINISHED,
          nextState : () => new Promise<EMRBauTaskStatus>(resolve => resolve(EMRBauTaskStatus.STATUS_FINISHED)),
          prevState : () => new Promise<EMRBauTaskStatus>(resolve => resolve(EMRBauTaskStatus.STATUS_ALL_SET))},
      ]},
      mrbauFormDefinitions : {
        'STATUS_METADATA_EXTRACT_1' : {
          formlyFieldConfigs: METADATA_EXTRACT_1_FORM_DEFINITION,
          mandatoryRequiredProperties: [
            'mrba:companyId',
            'mrba:costCarrierNumber', //d:int
            'mrba:projectName'
          ]
        },
        'STATUS_LINK_DOCUMENTS' : {
          formlyFieldConfigs: [],
          mandatoryRequiredProperties: []
        },
        'STATUS_METADATA_EXTRACT_2' : {
          formlyFieldConfigs: [
            'title_mrba_inboundInvoiceType',
            'element_mrba_inboundInvoiceType',
            'title_mrba_documentIdentityDetails',
            'aspect_mrba_documentIdentityDetails',
            'title_mrba_amountDetails_mrba_taxRate',
            'aspect_mrba_amountDetails_mrba_taxRate',
            'title_mrba_paymentConditionDetails',
            'aspect_mrba_paymentConditionDetails',
          ],
          mandatoryRequiredProperties: [
            'mrba:inboundInvoiceType',
            'mrba:documentNumber',
            'mrba:documentDateValue',
            'mrba:netAmount',
            'mrba:grossAmount',
            'mrba:taxRate',
            'mrba:reviewDaysFinalInvoice',
            'mrba:paymentTargetDays',
          ]
        },
        'STATUS_DUPLICATE' : {
          formlyFieldConfigs: [
            'duplicated_document_form'
          ],
          mandatoryRequiredProperties: [
          ]
        },
        'STATUS_FORMAL_REVIEW' : {
          formlyFieldConfigs: [
            'workflow_formal_review',
            'title_mrba_documentSummary',
            'label_group_reviewDays',
            'label_group_netPayment',
            'label_group_earlyPaymentDiscount1',
            'label_group_earlyPaymentDiscount2',
          ],
          mandatoryRequiredProperties: [
          ]
        },
        'STATUS_INVOICE_VERIFICATION' : {
          formlyFieldConfigs: [
            'title_mrba_verifyData',
            'aspect_mrba_verifyData',
            'title_mrba_verifyData2',
            'aspect_mrba_verifyData2',

            'title_mrba_documentSummary',
            'label_group_reviewDays',
            'label_group_netPayment',
            'label_group_earlyPaymentDiscount1',
            'label_group_earlyPaymentDiscount2',
          ],
          mandatoryRequiredProperties: [
            'mrba:netAmountVerified',
            'mrba:verifyDateValue',
            'mrba:paymentDateNetValue',
          ]
        },
        'STATUS_INVOICE_REVIEW' : {
          formlyFieldConfigs: [
            'workflow_invoice_review',
            'title_mrba_verifyData',
            'label_group_paymentNet',
            'label_group_paymentDiscount1',
            'label_group_paymentDiscount2',
            'label_group_taxRate',
            ],
            mandatoryRequiredProperties: [
            ]
        },
        'STATUS_FINAL_APPROVAL' : {
          formlyFieldConfigs: [
            'workflow_invoice_approval',
            'title_mrba_verifyData',
            'label_group_paymentNet',
            'label_group_paymentDiscount1',
            'label_group_paymentDiscount2',
            'label_group_taxRate',
          ],
          mandatoryRequiredProperties: [
          ]
        },
        'STATUS_ACCOUNTING' : {
          formlyFieldConfigs: [
            'mrba_accountingId',
            'title_mrba_verifyData',
            'label_group_paymentNet',
            'label_group_paymentDiscount1',
            'label_group_paymentDiscount2',
            'label_group_taxRate',
          ],
          mandatoryRequiredProperties: [
            'mrba:accountingId',
          ]
        },
        'STATUS_ALL_SET' : {
          formlyFieldConfigs: [
            'workflow_all_set_form'
            ],
            mandatoryRequiredProperties: [
            ]
        }
      }
    },
    {
     title: "Ausgangsrechnung",
     name : "mrba:outboundInvoice",
     //parent : "mrba:archiveDocument",
      //mandatoryAspects : [
        //mrba:companyIdentifiers
        //mrba:documentIdentityDetails
        //mrba:fiscalYearDetails
        //mrba:outboundInvoiceDetails
        //mrba:invoiceDetails
        //mrba:amountDetails
        //mrba:taxRate
        //mrba:paymentConditionDetails
        //mrba:costCarrierDetails
        //mrba:orderReference
        //mrba:deliveryNoteReference
        //mrba:outboundInvoiceReference
        //mrba:outboundRevokedInvoiceReference
        //mrba:outboundPartialInvoiceReference
      //],
      category: EMRBauDocumentCategory.AR,
      folder: "06 Ausgangsrechnungen",
      group : DocumentCategoryGroups.get(EMRBauDocumentCategoryGroup.BILLS),
      mrbauWorkflowDefinition: {states : [
        {state : EMRBauTaskStatus.STATUS_METADATA_EXTRACT_1,
          nextState : () => new Promise<EMRBauTaskStatus>(resolve => resolve(EMRBauTaskStatus.STATUS_LINK_DOCUMENTS)),
          prevState : () => new Promise<EMRBauTaskStatus>(resolve => resolve(EMRBauTaskStatus.STATUS_METADATA_EXTRACT_1))},
        {state : EMRBauTaskStatus.STATUS_LINK_DOCUMENTS,
          nextState : (data) => new Promise<EMRBauTaskStatus>((resolve, reject) => {
            this.mrbauWorkflowService.createAssociationsForProposedDocuments(data)
            .then( () =>
            {
              resolve(EMRBauTaskStatus.STATUS_METADATA_EXTRACT_2);
            })
            .catch( (error) => reject(error))
            }),
          prevState : () => new Promise<EMRBauTaskStatus>(resolve => resolve(EMRBauTaskStatus.STATUS_METADATA_EXTRACT_1)),},
        {state : EMRBauTaskStatus.STATUS_METADATA_EXTRACT_2,
          nextState : (data) => new Promise<EMRBauTaskStatus>((resolve, reject) => {
            this.mrbauWorkflowService.performDuplicateCheck(data)
            .then( (duplicatedData) =>
            {
              resolve( duplicatedData ? EMRBauTaskStatus.STATUS_DUPLICATE : EMRBauTaskStatus.STATUS_ACCOUNTING);
            })
            .catch( (error) => reject(error))
          }),
          prevState : () => new Promise<EMRBauTaskStatus>(resolve => resolve(EMRBauTaskStatus.STATUS_LINK_DOCUMENTS)),
          onEnterAction : (data) => this.mrbauWorkflowService.cloneMetadataFromLinkedDocuments(data)
        },
        {state : EMRBauTaskStatus.STATUS_DUPLICATE,
          nextState : (data) => new Promise<EMRBauTaskStatus>((resolve, reject) => {
            this.mrbauWorkflowService.resolveDuplicateIssue(data)
            .then( (result) =>
            {
              let newState = EMRBauTaskStatus.STATUS_DUPLICATE;
              switch (result)
              {
                case EMRBauDuplicateResolveResult.IGNORE: newState = EMRBauTaskStatus.STATUS_ACCOUNTING; break;
                case EMRBauDuplicateResolveResult.DELETE_SUCCESS: newState = EMRBauTaskStatus.STATUS_FINISHED;break
                case EMRBauDuplicateResolveResult.DELETE_CANCEL: newState = EMRBauTaskStatus.STATUS_FORMAL_REVIEW;break;
                case EMRBauDuplicateResolveResult.NEW_VERSION: newState = EMRBauTaskStatus.STATUS_ACCOUNTING;break;
              }
              resolve(newState);
            })
            .catch( (error) => reject(error))
          }),
          prevState : () => new Promise<EMRBauTaskStatus>(resolve => resolve(EMRBauTaskStatus.STATUS_METADATA_EXTRACT_2)),
        },
        {state : EMRBauTaskStatus.STATUS_ACCOUNTING,
          nextState : () => new Promise<EMRBauTaskStatus>(resolve => resolve(EMRBauTaskStatus.STATUS_ALL_SET)),
          prevState : () => new Promise<EMRBauTaskStatus>(resolve => resolve(EMRBauTaskStatus.STATUS_METADATA_EXTRACT_2))},
        {state : EMRBauTaskStatus.STATUS_ALL_SET,
          nextState : () => new Promise<EMRBauTaskStatus>(resolve => resolve(EMRBauTaskStatus.STATUS_FINISHED)),
          prevState : () => new Promise<EMRBauTaskStatus>(resolve => resolve(EMRBauTaskStatus.STATUS_ACCOUNTING))},
        {state : EMRBauTaskStatus.STATUS_FINISHED,
          nextState : () => new Promise<EMRBauTaskStatus>(resolve => resolve(EMRBauTaskStatus.STATUS_FINISHED)),
          prevState : () => new Promise<EMRBauTaskStatus>(resolve => resolve(EMRBauTaskStatus.STATUS_ALL_SET))},
      ]},
      mrbauFormDefinitions : {
        'STATUS_METADATA_EXTRACT_1' : {
          formlyFieldConfigs: METADATA_EXTRACT_1_FORM_DEFINITION,
          mandatoryRequiredProperties: [
            'mrba:companyId',
            'mrba:costCarrierNumber', //d:int
            'mrba:projectName'
          ]
        },
        'STATUS_LINK_DOCUMENTS' : {
          formlyFieldConfigs: [],
          mandatoryRequiredProperties: []
        },
        'STATUS_METADATA_EXTRACT_2' : {
          formlyFieldConfigs: [
            'title_mrba_outboundInvoiceType',
            'element_mrba_outboundInvoiceType',
            'title_mrba_documentIdentityDetails',
            'aspect_mrba_documentIdentityDetails',
            'title_mrba_amountDetails_mrba_taxRate',
            'aspect_mrba_amountDetails_mrba_taxRate',
            'title_mrba_paymentConditionDetails',
            'aspect_mrba_paymentConditionDetails',
          ],
          mandatoryRequiredProperties: [
            'mrba:outboundInvoiceType',
            'mrba:documentNumber',
            'mrba:documentDateValue',
            'mrba:netAmount',
            'mrba:grossAmount',
            'mrba:taxRate',
            'mrba:reviewDaysFinalInvoice',
            'mrba:paymentTargetDays',
          ]
        },
        'STATUS_DUPLICATE' : {
          formlyFieldConfigs: [
            'duplicated_document_form'
          ],
          mandatoryRequiredProperties: [
          ]
        },
        'STATUS_ACCOUNTING' : {
          formlyFieldConfigs: [
            'mrba_accountingId',
          ],
          mandatoryRequiredProperties: [
            'mrba:accountingId',
          ]
        },
        'STATUS_ALL_SET' : {
          formlyFieldConfigs: [
            'workflow_all_set_form'
            ],
            mandatoryRequiredProperties: [
            ]
        }
      }
    },
    {
      title: "Rechnungs-Prüfblatt",
      name : "mrba:invoiceReviewSheet",
      //parent : "mrba:archiveDocument",
      //mandatoryAspects : [
      //  "mrba:companyIdentifiers"
      //  "mrba:costCarrierDetails"
      //  "mrba:documentIdentityDetails"
      //  "mrba:inboundInvoiceReference"
      //],
      category: EMRBauDocumentCategory.INVOICE_REVIEW_SHEET,
      folder: "08 Rechnungsprüfblätter",
      group : DocumentCategoryGroups.get(EMRBauDocumentCategoryGroup.BILLS),
      mrbauFormDefinitions : null,
      mrbauWorkflowDefinition: {states : null},
    },
    {
      title: "Vergabeverhandlungsprotokoll",
      name : "mrba:orderNegotiationProtocol",
      //parent : "mrba:archiveDocument",
      //mandatoryAspects : [
      //  "mrba:companyIdentifiers",
      //  "mrba:documentIdentityDetails",
      //  "mrba:amountDetails",
      //  "mrba:taxRate",
      //  "mrba:costCarrierDetails",
      //],
      category: EMRBauDocumentCategory.ORDER_NEGOTIATION_PROTOCOL,
      folder: "07 Vergabeverhandlungsprotokolle",
      group : DocumentCategoryGroups.get(EMRBauDocumentCategoryGroup.BILLS),
      mrbauWorkflowDefinition: {states : [
        {state : EMRBauTaskStatus.STATUS_METADATA_EXTRACT_1,
          nextState : () => new Promise<EMRBauTaskStatus>(resolve => resolve(EMRBauTaskStatus.STATUS_METADATA_EXTRACT_2)),
          prevState : () => new Promise<EMRBauTaskStatus>(resolve => resolve(EMRBauTaskStatus.STATUS_METADATA_EXTRACT_1))},
        {state : EMRBauTaskStatus.STATUS_METADATA_EXTRACT_2,
          nextState : (data) => new Promise<EMRBauTaskStatus>((resolve, reject) => {
            this.mrbauWorkflowService.performDuplicateCheck(data)
            .then( (duplicatedData) =>
            {
              resolve( duplicatedData ? EMRBauTaskStatus.STATUS_DUPLICATE : EMRBauTaskStatus.STATUS_ALL_SET);
            })
            .catch( (error) => reject(error))
          }),
          prevState : () => new Promise<EMRBauTaskStatus>(resolve => resolve(EMRBauTaskStatus.STATUS_METADATA_EXTRACT_1)),
          onEnterAction : (data) => this.mrbauWorkflowService.cloneMetadataFromLinkedDocuments(data)
        },
        {state : EMRBauTaskStatus.STATUS_DUPLICATE,
          nextState : (data) => new Promise<EMRBauTaskStatus>((resolve, reject) => {
            this.mrbauWorkflowService.resolveDuplicateIssue(data)
            .then( (result) =>
            {
              let newState = EMRBauTaskStatus.STATUS_DUPLICATE;
              switch (result)
              {
                case EMRBauDuplicateResolveResult.IGNORE: newState = EMRBauTaskStatus.STATUS_ALL_SET; break;
                case EMRBauDuplicateResolveResult.DELETE_SUCCESS: newState = EMRBauTaskStatus.STATUS_FINISHED;break
                case EMRBauDuplicateResolveResult.DELETE_CANCEL: newState = EMRBauTaskStatus.STATUS_DUPLICATE;break;
                case EMRBauDuplicateResolveResult.NEW_VERSION: newState = EMRBauTaskStatus.STATUS_ALL_SET;break;
              }
              resolve(newState);
            })
            .catch( (error) => reject(error))
          }),
          prevState : () => new Promise<EMRBauTaskStatus>(resolve => resolve(EMRBauTaskStatus.STATUS_METADATA_EXTRACT_2)),
        },
        {state : EMRBauTaskStatus.STATUS_ALL_SET,
          nextState : () => new Promise<EMRBauTaskStatus>(resolve => resolve(EMRBauTaskStatus.STATUS_FINISHED)),
          prevState : () => new Promise<EMRBauTaskStatus>(resolve => resolve(EMRBauTaskStatus.STATUS_METADATA_EXTRACT_2))},
        {state : EMRBauTaskStatus.STATUS_FINISHED,
          nextState : () => new Promise<EMRBauTaskStatus>(resolve => resolve(EMRBauTaskStatus.STATUS_FINISHED)),
          prevState : () => new Promise<EMRBauTaskStatus>(resolve => resolve(EMRBauTaskStatus.STATUS_ALL_SET))},
      ]},
      mrbauFormDefinitions : {
        'STATUS_METADATA_EXTRACT_1' : {
          formlyFieldConfigs: METADATA_EXTRACT_1_FORM_DEFINITION,
          mandatoryRequiredProperties: [
            'mrba:companyId',
            'mrba:costCarrierNumber', //d:int
            'mrba:projectName'
          ]
        },
        'STATUS_METADATA_EXTRACT_2' : {
          formlyFieldConfigs: [
            'title_mrba_documentIdentityDetails',
            'aspect_mrba_documentIdentityDetails',
            'title_mrba_amountDetails_mrba_taxRate',
            'aspect_mrba_amountDetails_mrba_taxRate',
            'title_mrba_paymentConditionDetails',
            'aspect_mrba_paymentConditionDetails',
          ],
          mandatoryRequiredProperties: [
            'mrba:documentNumber',
            'mrba:documentDateValue',
            'mrba:netAmount',
            'mrba:grossAmount',
            'mrba:taxRate',
            'mrba:reviewDaysFinalInvoice',
            'mrba:paymentTargetDays',
          ]
        },
        'STATUS_DUPLICATE' : {
          formlyFieldConfigs: [
            'duplicated_document_form'
          ],
          mandatoryRequiredProperties: [
          ]
        },
        'STATUS_ALL_SET' : {
          formlyFieldConfigs: [
            'workflow_all_set_form'
            ],
            mandatoryRequiredProperties: [
            ]
        }
      }
    },
    {
      title: "Sonstiger Beleg",
      name : "mrba:miscellaneousDocument",
      //parent : "mrba:archiveDocument",
      //mandatoryAspects : [
      //  "mrba:companyIdentifiers",
      //  "mrba:documentIdentityDetails",
      //  TODO "mrba:costCarrierDetails",
      //],
      category: EMRBauDocumentCategory.OTHER_BILL,
      folder: "99 Sonstige Belege",
      group : DocumentCategoryGroups.get(EMRBauDocumentCategoryGroup.BILLS),
      mrbauWorkflowDefinition: {states : [
        {state : EMRBauTaskStatus.STATUS_METADATA_EXTRACT_1,
          nextState : () => new Promise<EMRBauTaskStatus>(resolve => resolve(EMRBauTaskStatus.STATUS_METADATA_EXTRACT_2)),
          prevState : () => new Promise<EMRBauTaskStatus>(resolve => resolve(EMRBauTaskStatus.STATUS_METADATA_EXTRACT_1))},
        {state : EMRBauTaskStatus.STATUS_METADATA_EXTRACT_2,
          nextState : (data) => new Promise<EMRBauTaskStatus>((resolve, reject) => {
            this.mrbauWorkflowService.performDuplicateCheck(data)
            .then( (duplicatedData) =>
            {
              resolve( duplicatedData ? EMRBauTaskStatus.STATUS_DUPLICATE : EMRBauTaskStatus.STATUS_ALL_SET);
            })
            .catch( (error) => reject(error))
          }),
          prevState : () => new Promise<EMRBauTaskStatus>(resolve => resolve(EMRBauTaskStatus.STATUS_METADATA_EXTRACT_1)),
          onEnterAction : (data) => this.mrbauWorkflowService.cloneMetadataFromLinkedDocuments(data)
        },
        {state : EMRBauTaskStatus.STATUS_DUPLICATE,
          nextState : (data) => new Promise<EMRBauTaskStatus>((resolve, reject) => {
            this.mrbauWorkflowService.resolveDuplicateIssue(data)
            .then( (result) =>
            {
              let newState = EMRBauTaskStatus.STATUS_DUPLICATE;
              switch (result)
              {
                case EMRBauDuplicateResolveResult.IGNORE: newState = EMRBauTaskStatus.STATUS_ALL_SET; break;
                case EMRBauDuplicateResolveResult.DELETE_SUCCESS: newState = EMRBauTaskStatus.STATUS_FINISHED;break
                case EMRBauDuplicateResolveResult.DELETE_CANCEL: newState = EMRBauTaskStatus.STATUS_DUPLICATE;break;
                case EMRBauDuplicateResolveResult.NEW_VERSION: newState = EMRBauTaskStatus.STATUS_ALL_SET;break;
              }
              resolve(newState);
            })
            .catch( (error) => reject(error))
          }),
          prevState : () => new Promise<EMRBauTaskStatus>(resolve => resolve(EMRBauTaskStatus.STATUS_METADATA_EXTRACT_2)),
        },
        {state : EMRBauTaskStatus.STATUS_ALL_SET,
          nextState : () => new Promise<EMRBauTaskStatus>(resolve => resolve(EMRBauTaskStatus.STATUS_FINISHED)),
          prevState : () => new Promise<EMRBauTaskStatus>(resolve => resolve(EMRBauTaskStatus.STATUS_METADATA_EXTRACT_2))},
        {state : EMRBauTaskStatus.STATUS_FINISHED,
          nextState : () => new Promise<EMRBauTaskStatus>(resolve => resolve(EMRBauTaskStatus.STATUS_FINISHED)),
          prevState : () => new Promise<EMRBauTaskStatus>(resolve => resolve(EMRBauTaskStatus.STATUS_ALL_SET))},
      ]},
      mrbauFormDefinitions : {
        'STATUS_METADATA_EXTRACT_1' : {
          formlyFieldConfigs: METADATA_EXTRACT_1_FORM_DEFINITION,
          mandatoryRequiredProperties: [
            'mrba:companyId',
          ]
        },
        'STATUS_METADATA_EXTRACT_2' : {
          formlyFieldConfigs: [
            'title_mrba_documentIdentityDetails',
            'aspect_mrba_documentIdentityDetails',
          ],
          mandatoryRequiredProperties: [
            'mrba:documentDateValue',
          ]
        },
        'STATUS_DUPLICATE' : {
          formlyFieldConfigs: [
            'duplicated_document_form'
          ],
          mandatoryRequiredProperties: [
          ]
        },
        'STATUS_ALL_SET' : {
          formlyFieldConfigs: [
            'workflow_all_set_form'
            ],
            mandatoryRequiredProperties: [
            ]
        }
      }
    }
  ];

  readonly CONTRACT_DEFAULT_WORKFLOW_DEFINITION = {
    states : [
      {state : EMRBauTaskStatus.STATUS_METADATA_EXTRACT_1,
        nextState : () => new Promise<EMRBauTaskStatus>(resolve => resolve(EMRBauTaskStatus.STATUS_METADATA_EXTRACT_2)),
        prevState : () => new Promise<EMRBauTaskStatus>(resolve => resolve(EMRBauTaskStatus.STATUS_METADATA_EXTRACT_1))},
      {state : EMRBauTaskStatus.STATUS_METADATA_EXTRACT_2,
        onEnterAction : (data) => this.mrbauWorkflowService.cloneMetadataFromLinkedDocuments(data),
        nextState : (data) => new Promise<EMRBauTaskStatus>((resolve, reject) => {
          this.mrbauWorkflowService.performDuplicateCheck(data)
          .then( (duplicatedData) =>
          {
            resolve( duplicatedData ? EMRBauTaskStatus.STATUS_DUPLICATE : EMRBauTaskStatus.STATUS_ALL_SET);
          })
          .catch( (error) => reject(error))
        }),
        prevState : () => new Promise<EMRBauTaskStatus>(resolve => resolve(EMRBauTaskStatus.STATUS_METADATA_EXTRACT_1)),
      },
      {state : EMRBauTaskStatus.STATUS_DUPLICATE,
        nextState : (data) => new Promise<EMRBauTaskStatus>((resolve, reject) => {
          this.mrbauWorkflowService.resolveDuplicateIssue(data)
          .then( (result) =>
          {
            let newState = EMRBauTaskStatus.STATUS_DUPLICATE;
            switch (result)
            {
              case EMRBauDuplicateResolveResult.IGNORE: newState = EMRBauTaskStatus.STATUS_ALL_SET; break;
              case EMRBauDuplicateResolveResult.DELETE_SUCCESS: newState = EMRBauTaskStatus.STATUS_FINISHED;break
              case EMRBauDuplicateResolveResult.DELETE_CANCEL: newState = EMRBauTaskStatus.STATUS_DUPLICATE;break;
              case EMRBauDuplicateResolveResult.NEW_VERSION: newState = EMRBauTaskStatus.STATUS_ALL_SET;break;
            }
            resolve(newState);
          })
          .catch( (error) => reject(error))
        }),
        prevState : () => new Promise<EMRBauTaskStatus>(resolve => resolve(EMRBauTaskStatus.STATUS_METADATA_EXTRACT_2)),
      },
      {state : EMRBauTaskStatus.STATUS_ALL_SET,
        nextState : () => new Promise<EMRBauTaskStatus>(resolve => resolve(EMRBauTaskStatus.STATUS_FINISHED)),
        prevState : () => new Promise<EMRBauTaskStatus>(resolve => resolve(EMRBauTaskStatus.STATUS_METADATA_EXTRACT_2))},
      {state : EMRBauTaskStatus.STATUS_FINISHED,
        nextState : () => new Promise<EMRBauTaskStatus>(resolve => resolve(EMRBauTaskStatus.STATUS_FINISHED)),
        prevState : () => new Promise<EMRBauTaskStatus>(resolve => resolve(EMRBauTaskStatus.STATUS_ALL_SET))},
    ]
  }

  readonly mrbauContracts : IMRBauDocumentType[] = [
    {
      title: "contract",
      name : "mrba:contractDocument",
      //parent : "mrba:archiveDocument",
      //mandatoryAspects : [
          //<aspect>mrba:companyIdentifiers</aspect>
          //<aspect>mrba:documentIdentityDetails</aspect>
          //<aspect>mrba:contractCoreDetails</aspect>
      //],
      category: EMRBauDocumentCategory.CONTRACT_DOCUMENT,
      folder: "-",
      group : DocumentCategoryGroups.get(EMRBauDocumentCategoryGroup.CONTRACTS),
      mrbauFormDefinitions : null,
      mrbauWorkflowDefinition: {states : null},
    },
    {
      title: "Mietvertrag",
      name : "mrba:rentContract",
      //parent : "mrba:contractDocument",
      //mandatoryAspects : [],
      category: EMRBauDocumentCategory.RENT_CONTRACT,
      folder: "01 Mietvertrag",
      group : DocumentCategoryGroups.get(EMRBauDocumentCategoryGroup.CONTRACTS),
      mrbauWorkflowDefinition: this.CONTRACT_DEFAULT_WORKFLOW_DEFINITION,
      mrbauFormDefinitions : CONTRACT_DEFAULT_FORM_DEFINITION,
    },
    {
      title: "Kündigungsverzicht",
      name : "mrba:contractCancellationWaiver",
      //parent : "mrba:contractDocument",
      //mandatoryAspects : [],
      category: EMRBauDocumentCategory.CONTRACT_CANCELLATION_WAIVER,
      folder: "02 Kündigungsverzicht",
      group : DocumentCategoryGroups.get(EMRBauDocumentCategoryGroup.CONTRACTS),
      mrbauWorkflowDefinition: this.CONTRACT_DEFAULT_WORKFLOW_DEFINITION,
      mrbauFormDefinitions : CONTRACT_DEFAULT_FORM_DEFINITION,
    },
    {
      title: "Wartungsvertrag",
      name : "mrba:maintenanceContract",
      //parent : "mrba:contractDocument",
      //mandatoryAspects : [],
      category: EMRBauDocumentCategory.MAINTENANCE_CONTRACT,
      folder: "03 Wartungsverträge",
      group : DocumentCategoryGroups.get(EMRBauDocumentCategoryGroup.CONTRACTS),
      mrbauWorkflowDefinition: this.CONTRACT_DEFAULT_WORKFLOW_DEFINITION,
      mrbauFormDefinitions : CONTRACT_DEFAULT_FORM_DEFINITION,
    },
    {
      title: "All-In-Vertrag",
      name : "mrba:allInContract",
      //parent : "mrba:contractDocument",
      //mandatoryAspects : [],
      category: EMRBauDocumentCategory.ALL_IN_CONTRACT,
      folder: "04 All-In",
      group : DocumentCategoryGroups.get(EMRBauDocumentCategoryGroup.CONTRACTS),
      mrbauWorkflowDefinition: this.CONTRACT_DEFAULT_WORKFLOW_DEFINITION,
      mrbauFormDefinitions : CONTRACT_DEFAULT_FORM_DEFINITION,
    },
    {
      title: "Lizenzvertrag",
      name : "mrba:licenseContract",
      //parent : "mrba:contractDocument",
      //mandatoryAspects : [],
      category: EMRBauDocumentCategory.LICENSE_CONTRACT,
      folder: "05 Lizenzverträge",
      group : DocumentCategoryGroups.get(EMRBauDocumentCategoryGroup.CONTRACTS),
      mrbauWorkflowDefinition: this.CONTRACT_DEFAULT_WORKFLOW_DEFINITION,
      mrbauFormDefinitions : CONTRACT_DEFAULT_FORM_DEFINITION,
    },
    {
      title: "Finanzierungsvertrag",
      name : "mrba:financingContract",
      //parent : "mrba:contractDocument",
      //mandatoryAspects : [],
      category: EMRBauDocumentCategory.FINANCING_CONTRACT,
      folder: "06 Finanzierungsverträge",
      group : DocumentCategoryGroups.get(EMRBauDocumentCategoryGroup.CONTRACTS),
      mrbauWorkflowDefinition: this.CONTRACT_DEFAULT_WORKFLOW_DEFINITION,
      mrbauFormDefinitions : CONTRACT_DEFAULT_FORM_DEFINITION,
    },
    {
      title: "Werkvertrag",
      name : "mrba:workContract",
      //parent : "mrba:contractDocument",
      //mandatoryAspects : [],
      category: EMRBauDocumentCategory.WORK_CONTRACT,
      folder: "07 Werkverträge",
      group : DocumentCategoryGroups.get(EMRBauDocumentCategoryGroup.CONTRACTS),
      mrbauFormDefinitions : null,
      mrbauWorkflowDefinition: {states : null},
    },
    {
      title:"Kündigung",
      name: "mrba:contractCancellation",
      //<parent>mrba:archiveDocument</parent>
      //mandatoryAspects : [
      //  <aspect>mrba:contractCancellationDetails</aspect>
      //  <aspect>mrba:cancelledContractReference</aspect>
      // ],
      category: EMRBauDocumentCategory.CONTRACT_CANCELLATION,
      folder: "08 Kündigungen",
      group : DocumentCategoryGroups.get(EMRBauDocumentCategoryGroup.CONTRACTS),
      mrbauWorkflowDefinition: this.CONTRACT_DEFAULT_WORKFLOW_DEFINITION,
      mrbauFormDefinitions : CONTRACT_DEFAULT_FORM_DEFINITION,
    },
    {
      title: "Sonstiger Vertrag",
      name : "mrba:miscellaneousContractDocument",
      //parent : "mrba:contractDocument",
      //mandatoryAspects : [],
      category: EMRBauDocumentCategory.OTHER_CONTRACT,
      folder: "08 Sonstige Verträge",
      group : DocumentCategoryGroups.get(EMRBauDocumentCategoryGroup.CONTRACTS),
      mrbauWorkflowDefinition: this.CONTRACT_DEFAULT_WORKFLOW_DEFINITION,
      mrbauFormDefinitions : CONTRACT_DEFAULT_FORM_DEFINITION,
    }
  ];

  readonly mrbauArchiveModelTypes : IMRBauDocumentType[] = [...this.mrbauBelege, ...this.mrbauContracts];
}
