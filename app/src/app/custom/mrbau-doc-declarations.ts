//https://github.com/mr-bau/alfresco-customisations/blob/default/mrbau-alfresco-platform/src/main/resources/alfresco/module/mrbau-alfresco-platform/model/archiveModel.xml
//https://github.com/mr-bau/alfresco-customisations/blob/default/mrbau-alfresco-platform/src/main/resources/alfresco/module/mrbau-alfresco-platform/messages/archiveModel.properties

// * Base Type
// ================
// title: "doc",      name : "mrba:archiveDocument",

// * Document Types
// ================
// title: "Angebot",                    name : "mrba:offer",
// title: "Auftrag",                    name : "mrba:order",
// title: "Vergabeverhandlungsprotokoll",name : "mrba:orderNegotiationProtocol",
// title: "Zahlungsvereinbarungen",     name : "mrba:frameworkContract",
// title: "Lieferschein",               name : "mrba:deliveryNote",
// title: "Rechnung",                   name : "mrba:invoice",
// title: "Rechnungsprüfblatt"          name : "mrba:invoiceReviewSheet",

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
// mrba:offer                     mrba:offer
// mrba:addonOffer                mrba:offer
// mrba:order                     mrba:order
// mrba:addonOrder                mrba:order
// mrba:frameworkContract         mrba:frameworkContract
// mrba:deliveryNote              mrba:deliveryNote
// mrba:invoice                   mrba:invoice
// mrba:partialInvoice            mrba:invoice
// mrba:archiveDocument           mrba:archiveDocument
// mrba:document                  mrba:document

// mrba:cancelledContract         mrba:contractDocument
// mrba:contractDocument          mrba:contractDocument

import { NodeAssociationEntry  } from '@alfresco/js-api';
import { Pipe, PipeTransform } from '@angular/core';
import { EMRBauDuplicateResolveResult } from './form/mrbau-formly-duplicated-document.component';
import { EMRBauTaskStatus, IMRBauTaskStatusAndUser } from './mrbau-task-declarations';
import { MrbauWorkflowService } from './services/mrbau-workflow.service';
import { TasksDetailNewDocumentComponent } from './tasks-detail-new-document/tasks-detail-new-document.component';

@Pipe({name: 'mrbauArchiveNodeTypeLabel'})
export class MRBauArchiveNodeTypeLabelPipe implements PipeTransform {
  readonly data = {
    "mrba:archiveDocument":"MRBAU_EXTENSION.MRBA_ARCHIVE_MODEL.ARCHIVE_DOCUMENT",
    "mrba:offer":"MRBAU_EXTENSION.MRBA_ARCHIVE_MODEL.OFFER",
    "mrba:order":"MRBAU_EXTENSION.MRBA_ARCHIVE_MODEL.ORDER",
    "mrba:orderNegotiationProtocol":"MRBAU_EXTENSION.MRBA_ARCHIVE_MODEL.ORDER_NEGOTIATION_PROTOCOL",
    "mrba:frameworkContract":"MRBAU_EXTENSION.MRBA_ARCHIVE_MODEL.FRAMEWORK_CONTRACT",
    "mrba:deliveryNote":"MRBAU_EXTENSION.MRBA_ARCHIVE_MODEL.DELIVERY_NOTE",
    "mrba:invoiceReviewSheet":"MRBAU_EXTENSION.MRBA_ARCHIVE_MODEL.INVOICE_REVIEW_SHEET",
    "mrba:invoice":"MRBAU_EXTENSION.MRBA_ARCHIVE_MODEL.INVOICE",
    "mrba:miscellaneousDocument":"MRBAU_EXTENSION.MRBA_ARCHIVE_MODEL.MISCELLANEOUS_DOCUMENT",
    "mrba:monition":"MRBAU_EXTENSION.MRBA_ARCHIVE_MODEL.MONITION", // Mahnung
    "mrba:guarantee":"MRBAU_EXTENSION.MRBA_ARCHIVE_MODEL.GUARANTEE", // Garantie
    "mrba:liabilityEscrow":"MRBAU_EXTENSION.MRBA_ARCHIVE_MODEL.LIABILITYESCROW", //Haftrücklass
    "mrba:financialRetention":"MRBAU_EXTENSION.MRBA_ARCHIVE_MODEL.FINANCIALRETENTION", // Deckungsrücklass
    "mrba:contractGuarantee":"MRBAU_EXTENSION.MRBA_ARCHIVE_MODEL.CONTRACTGUARANTEE", //Erfüllungsgarantie
    "mrba:noteDocument":"MRBAU_EXTENSION.MRBA_ARCHIVE_MODEL.NOTEDOCUMENT", // Bescheid

    "mrba:contractDocument":"MRBAU_EXTENSION.MRBA_ARCHIVE_MODEL.CONTRACT_DOCUMENT",
    "mrba:rentContract":"MRBAU_EXTENSION.MRBA_ARCHIVE_MODEL.RENT_CONTRACT",
    "mrba:contractCancellationWaiver":"MRBAU_EXTENSION.MRBA_ARCHIVE_MODEL.CONTRACT_CANCELLATION_WAIVER",
    "mrba:maintenanceContract":"MRBAU_EXTENSION.MRBA_ARCHIVE_MODEL.MAINTENANCE_CONTRACT",
    "mrba:allInContract":"MRBAU_EXTENSION.MRBA_ARCHIVE_MODEL.ALL_IN_CONTRACT",
    "mrba:licenseContract":"MRBAU_EXTENSION.MRBA_ARCHIVE_MODEL.LICENSE_CONTRACT",
    "mrba:financingContract":"MRBAU_EXTENSION.MRBA_ARCHIVE_MODEL.FINANCING_CONTRACT",
    "mrba:workContract":"MRBAU_EXTENSION.MRBA_ARCHIVE_MODEL.WORK_CONTRACT",
    "mrba:contractCancellation":"MRBAU_EXTENSION.MRBA_ARCHIVE_MODEL.CONTRACT_CANCELLATION",
    "mrba:miscellaneousContractDocument":"MRBAU_EXTENSION.MRBA_ARCHIVE_MODEL.MISCELLANEOUS_CONTRACT_DOCUMENT",
  };
  transform(value: string): string {
    const result = this.data[value];
    return (result) ? result : value;
  }
}

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
  ADDON_OFFER_REFERENCE,
  ORDER_REFERENCE,
  ADDON_ORDER_REFERENCE,
  FRAMEWORK_CONTRACT_REFERENCE,
  DELIVERY_NOTE_REFERENCE,
  INVOICE_REFERENCE,
  PARTIAL_INVOICE_REFERENCE,
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
  [EMRBauDocumentAssociations.ADDON_OFFER_REFERENCE, {category: EMRBauDocumentAssociations.ADDON_OFFER_REFERENCE,  aspectName: "mrba:addonOfferReference", associationName: "mrba:addonOffer", targetClass: "mrba:offer"}],
  [EMRBauDocumentAssociations.ORDER_REFERENCE, {category: EMRBauDocumentAssociations.ORDER_REFERENCE,  aspectName: "mrba:orderReference", associationName: "mrba:order", targetClass: "mrba:order"}],
  [EMRBauDocumentAssociations.ADDON_ORDER_REFERENCE, {category: EMRBauDocumentAssociations.ADDON_ORDER_REFERENCE,  aspectName: "mrba:addonOrderReference", associationName: "mrba:addonOrder", targetClass: "mrba:order"}],
  [EMRBauDocumentAssociations.FRAMEWORK_CONTRACT_REFERENCE, {category: EMRBauDocumentAssociations.FRAMEWORK_CONTRACT_REFERENCE,  aspectName: "mrba:frameworkContractReference", associationName: "mrba:frameworkContract", targetClass: "mrba:frameworkContract"}],
  [EMRBauDocumentAssociations.DELIVERY_NOTE_REFERENCE, {category: EMRBauDocumentAssociations.DELIVERY_NOTE_REFERENCE,  aspectName: "mrba:deliveryNoteReference", associationName: "mrba:deliveryNote", targetClass: "mrba:deliveryNote"}],
  [EMRBauDocumentAssociations.INVOICE_REFERENCE, {category: EMRBauDocumentAssociations.INVOICE_REFERENCE,  aspectName: "mrba:invoiceReference", associationName: "mrba:invoice", targetClass: "mrba:invoice"}],
  [EMRBauDocumentAssociations.PARTIAL_INVOICE_REFERENCE, {category: EMRBauDocumentAssociations.PARTIAL_INVOICE_REFERENCE,  aspectName: "mrba:partialInvoiceReference", associationName: "mrba:partialInvoice", targetClass: "mrba:invoice"}],
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
  INVOICE, //"mrba:invoice",
  PAYMENT_TERMS,//"mrba:frameworkContract",
  INVOICE_REVIEW_SHEET, //mrba:invoiceReviewSheet
  OTHER_BILL, //"mrba:miscellaneousDocument",
  MONITION, // "mrba:monition"
  GUARANTEE, // "mrba:guarantee"
  LIABILITY_ESCROW, // "mrba:liabilityEscrow"
  FINANCIAL_RETENTION, // "mrba:financialRetention"
  CONTRACT_GUARANTEE, // "mrba:contractGuarantee"
  NOTE_DOCUMENT, // "mrba:noteDocument"

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

export const enum EMRBauOfferTypes {
  ANGEBOT       = 0,
  NACHTRAGSANGEBOT = 1,
}

interface IDocumentOfferTypeData {
  category: EMRBauOfferTypes,
  label: string,
  value: string,
}
export const DocumentOfferTypes = new Map<number, IDocumentOfferTypeData>([
  [EMRBauOfferTypes.ANGEBOT, {category: EMRBauOfferTypes.ANGEBOT, label :"Angebot", value :"Angebot"}],
  [EMRBauOfferTypes.NACHTRAGSANGEBOT, {category: EMRBauOfferTypes.NACHTRAGSANGEBOT, label: "Nachtragsangebot", value:"Nachtragsangebot"}],
]);

export const enum EMRBauOrderTypes {
  AUFTRAG       = 0,
  ZUSATZAUFTRAG = 1,
}
interface IDocumentOrderTypeData {
  category: EMRBauOrderTypes,
  label: string,
  value: string,
  default?: boolean,
}
export const DocumentOrderTypes = new Map<number, IDocumentOrderTypeData>([
  [EMRBauOrderTypes.AUFTRAG, {category: EMRBauOrderTypes.AUFTRAG, label :"Auftrag", value :"Auftrag"}],
  [EMRBauOrderTypes.ZUSATZAUFTRAG, {category: EMRBauOrderTypes.ZUSATZAUFTRAG, label: "Zusatzauftrag", value:"Zusatzauftrag"}],
]);

export const enum EMRBauOrganisationPositionTypes {
  AUFTRAGGEBER = 0,
  AUFTRAGNEHMER = 1,
}
interface IOrganisationPositionTypeData {
  category: EMRBauOrganisationPositionTypes,
  label: string,
  value: string,
}
export const OrganisationPositionTypes = new Map<number, IOrganisationPositionTypeData>([
  [EMRBauOrganisationPositionTypes.AUFTRAGGEBER, {category: EMRBauOrganisationPositionTypes.AUFTRAGGEBER, label :"Auftraggeber", value :"Auftraggeber"}],
  [EMRBauOrganisationPositionTypes.AUFTRAGNEHMER, {category: EMRBauOrganisationPositionTypes.AUFTRAGNEHMER, label: "Auftragnehmer", value:"Auftragnehmer"}],
]);

export const enum EMRBauInvoiceTypes {
  EINZELRECHNUNG  = 0,
  SCHLUSSRECHNUNG = 1,
  TEILRECHNUNG = 2,
}
interface IDocumentInvoiceTypeData {
  category: EMRBauInvoiceTypes,
  label: string,
  value: string,
}
export const DocumentInvoiceTypes = new Map<number, IDocumentInvoiceTypeData>([
  [EMRBauInvoiceTypes.EINZELRECHNUNG, {category: EMRBauInvoiceTypes.EINZELRECHNUNG, label :"Einzelrechnung", value :"Einzelrechnung"}],
  [EMRBauInvoiceTypes.SCHLUSSRECHNUNG, {category: EMRBauInvoiceTypes.SCHLUSSRECHNUNG, label: "Schlussrechnung", value:"Schlussrechnung"}],
  [EMRBauInvoiceTypes.TEILRECHNUNG, {category: EMRBauInvoiceTypes.TEILRECHNUNG, label: "Teil-/Anzahlungsrechnung", value:"Teilrechnung"}],
]);

export const enum EMRBauSigningStatusTypes {
  IN_ERSTELLUNG = 0,
  VERSENDET = 1,
  IN_PRUEFUNG = 2,
  FINAL = 3,
}
interface IMRBauSigningStatusTypeData {
  category: EMRBauSigningStatusTypes,
  label: string,
  value: string,
  default?: boolean,
}
export const MRBauSigningStatusTypes = new Map<number, IMRBauSigningStatusTypeData>([
  [EMRBauSigningStatusTypes.IN_ERSTELLUNG, {category: EMRBauSigningStatusTypes.IN_ERSTELLUNG, label :"In Erstellung", value :"In Erstellung"}],
  [EMRBauSigningStatusTypes.VERSENDET, {category: EMRBauSigningStatusTypes.VERSENDET, label: "Versendet", value:"Versendet"}],
  [EMRBauSigningStatusTypes.IN_PRUEFUNG, {category: EMRBauSigningStatusTypes.IN_PRUEFUNG, label: "In Prüfung", value:"In Prüfung"}],
  [EMRBauSigningStatusTypes.FINAL, {category: EMRBauSigningStatusTypes.FINAL, label: "Final", value:"Final"}],
]);

export const enum EMRBauVerifiedInboundInvoiceType {
  UEBERWEISUNG = 0,
  ABBUCHER = 1,
  INTERNE_RECHNUNG = 2,
  GUTSCHRIFT = 3,
}
interface IMRBauVerifiedInboundInvoiceTypeData {
  category: EMRBauVerifiedInboundInvoiceType,
  label: string,
  value: string,
}
export const MRBauVerifiedInboundInvoiceTypes = new Map<number, IMRBauVerifiedInboundInvoiceTypeData>([
  [EMRBauVerifiedInboundInvoiceType.UEBERWEISUNG, {category: EMRBauVerifiedInboundInvoiceType.UEBERWEISUNG, label :"Überweisung", value : "Überweisung"}],
  [EMRBauVerifiedInboundInvoiceType.ABBUCHER, {category: EMRBauVerifiedInboundInvoiceType.ABBUCHER, label :"Abbucher", value : "Abbucher"}],
  [EMRBauVerifiedInboundInvoiceType.INTERNE_RECHNUNG, {category: EMRBauVerifiedInboundInvoiceType.INTERNE_RECHNUNG, label :"Interne Rechnung", value : "Interne Rechnung"}],
  [EMRBauVerifiedInboundInvoiceType.GUTSCHRIFT, {category: EMRBauVerifiedInboundInvoiceType.GUTSCHRIFT, label :"Gutschrift", value : "Gutschrift"}],
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
export type MRBauWorkflowStateCallback = (data?:MRBauWorkflowStateCallbackData) => Promise<IMRBauTaskStatusAndUser>;
export interface IMRBauWorkflowState {
  state: EMRBauTaskStatus;
  nextState : MRBauWorkflowStateCallback; // get next State
  prevState : MRBauWorkflowStateCallback; // get previous State
  onEnterAction? : MRBauWorkflowStateCallback; // perform on enter action
}

// COMMONLY USED DEFINITIONS
const METADATA_EXTRACT_1_FORM_DEFINITION = [
    'title_mrba_organisationPosition',
    'element_mrba_organisationPosition',
    'title_mrba_companyId',
    //'element_mrba_companyId',
    'element_mrba_companyId_wbtn',
    'title_mrba_costCarrierDetails',
    'aspect_mrba_costCarrierDetails_wbtn',
  ];

const CONTRACT_DEFAULT_FORM_DEFINITION = {
  'STATUS_METADATA_EXTRACT_1' : {
    formlyFieldConfigs: [
      'title_mrba_organisationPosition',
      'element_mrba_organisationPosition',
      'title_mrba_companyId',
      'element_mrba_companyId',
      'title_mrba_costCarrierDetails',
      'aspect_mrba_costCarrierDetails',
    ],
    mandatoryRequiredProperties: [
      'mrba:companyId',
      'mrba:organisationPosition',
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

  isAuftraggeber( organisationPosition:string) : boolean {
    return organisationPosition == OrganisationPositionTypes.get(EMRBauOrganisationPositionTypes.AUFTRAGGEBER).value;
  }

  isAuftragnehmer( organisationPosition:string) : boolean {
    return organisationPosition == OrganisationPositionTypes.get(EMRBauOrganisationPositionTypes.AUFTRAGNEHMER).value;
  }

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

  getNextTaskStateFromNodeType(data:MRBauWorkflowStateCallbackData) : Promise<IMRBauTaskStatusAndUser> {
    const workflowState = this.getWorkFlowStateFromNodeType(data);
    return (workflowState) ? workflowState.nextState(data) : new Promise<IMRBauTaskStatusAndUser>(resolve => resolve({state:data.taskDetailNewDocument.task.status}));
  }

  getPrevTaskStateFromNodeType(data:MRBauWorkflowStateCallbackData) : Promise<IMRBauTaskStatusAndUser> {
    const workflowState = this.getWorkFlowStateFromNodeType(data);
    return (workflowState) ? workflowState.prevState(data) : new Promise<IMRBauTaskStatusAndUser>(resolve => resolve({state:data.taskDetailNewDocument.task.status}));
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
          nextState : () => new Promise<IMRBauTaskStatusAndUser>(resolve => resolve({state:EMRBauTaskStatus.STATUS_METADATA_EXTRACT_2})),
          prevState : () => new Promise<IMRBauTaskStatusAndUser>(resolve => resolve({state:EMRBauTaskStatus.STATUS_METADATA_EXTRACT_1}))},
        {state : EMRBauTaskStatus.STATUS_METADATA_EXTRACT_2,
          nextState : (data) => new Promise<IMRBauTaskStatusAndUser>((resolve, reject) => {
            this.mrbauWorkflowService.performDuplicateCheck(data)
            .then( (duplicatedData) =>
            {
              resolve( duplicatedData ? {state:EMRBauTaskStatus.STATUS_DUPLICATE} : {state:EMRBauTaskStatus.STATUS_ALL_SET});
            })
            .catch( (error) => reject(error))
          }),
          prevState : () => new Promise<IMRBauTaskStatusAndUser>(resolve => resolve({state:EMRBauTaskStatus.STATUS_METADATA_EXTRACT_1})),
          onEnterAction : (data) => this.mrbauWorkflowService.cloneMetadataFromLinkedDocuments(data)
        },
        {state : EMRBauTaskStatus.STATUS_DUPLICATE,
          nextState : (data) => new Promise<IMRBauTaskStatusAndUser>((resolve, reject) => {
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
              resolve({state:newState});
            })
            .catch( (error) => reject(error))
          }),
          prevState : () => new Promise<IMRBauTaskStatusAndUser>(resolve => resolve({state:EMRBauTaskStatus.STATUS_METADATA_EXTRACT_2})),
        },
        {state : EMRBauTaskStatus.STATUS_ALL_SET,
          nextState : () => new Promise<IMRBauTaskStatusAndUser>(resolve => resolve({state:EMRBauTaskStatus.STATUS_FINISHED})),
          prevState : () => new Promise<IMRBauTaskStatusAndUser>(resolve => resolve({state:EMRBauTaskStatus.STATUS_METADATA_EXTRACT_2}))},
        {state : EMRBauTaskStatus.STATUS_FINISHED,
          nextState : () => new Promise<IMRBauTaskStatusAndUser>(resolve => resolve({state:EMRBauTaskStatus.STATUS_FINISHED})),
          prevState : () => new Promise<IMRBauTaskStatusAndUser>(resolve => resolve({state:EMRBauTaskStatus.STATUS_ALL_SET}))},
      ]},
      mrbauFormDefinitions : {
        'STATUS_METADATA_EXTRACT_1' : {
          formlyFieldConfigs: METADATA_EXTRACT_1_FORM_DEFINITION,
          mandatoryRequiredProperties: [
            'mrba:companyId',
            'mrba:organisationPosition',
          ]
        },
        'STATUS_METADATA_EXTRACT_2' : {
          formlyFieldConfigs: [
            'title_mrba_offerType',
            'element_mrba_offerType',
            'title_mrba_documentIdentityDetails',
            'aspect_mrba_documentIdentityDetails',
            'title_mrba_amountDetails_mrba_taxRate',
            'aspect_mrba_amountDetails_mrba_taxRate',
          ],
          mandatoryRequiredProperties: [
            'mrba:offerType',
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
          nextState : () => new Promise<IMRBauTaskStatusAndUser>(resolve => resolve({state:EMRBauTaskStatus.STATUS_LINK_DOCUMENTS})),
          prevState : () => new Promise<IMRBauTaskStatusAndUser>(resolve => resolve({state:EMRBauTaskStatus.STATUS_METADATA_EXTRACT_1}))},
        {state : EMRBauTaskStatus.STATUS_LINK_DOCUMENTS,
          nextState : (data) => new Promise<IMRBauTaskStatusAndUser>((resolve, reject) => {
            this.mrbauWorkflowService.createAssociationsForProposedDocuments(data)
            .then( () =>
            {
              resolve({state:EMRBauTaskStatus.STATUS_METADATA_EXTRACT_2});
            })
            .catch( (error) => reject(error))
            }),
          prevState : () => new Promise<IMRBauTaskStatusAndUser>(resolve => resolve({state:EMRBauTaskStatus.STATUS_METADATA_EXTRACT_1})),},
        {state : EMRBauTaskStatus.STATUS_METADATA_EXTRACT_2,
          nextState : (data) => new Promise<IMRBauTaskStatusAndUser>((resolve, reject) => {
            this.mrbauWorkflowService.performDuplicateCheck(data)
            .then( (duplicatedData) =>
            {
              resolve( duplicatedData ? {state:EMRBauTaskStatus.STATUS_DUPLICATE} : {state:EMRBauTaskStatus.STATUS_SIGNING});
            })
            .catch( (error) => reject(error))
          }),
          prevState : () => new Promise<IMRBauTaskStatusAndUser>(resolve => resolve({state:EMRBauTaskStatus.STATUS_LINK_DOCUMENTS})),
          onEnterAction : (data) => this.mrbauWorkflowService.cloneMetadataFromLinkedDocuments(data)
        },
        {state : EMRBauTaskStatus.STATUS_DUPLICATE,
          nextState : (data) => new Promise<IMRBauTaskStatusAndUser>((resolve, reject) => {
            this.mrbauWorkflowService.resolveDuplicateIssue(data)
            .then( (result) =>
            {
              let newState = EMRBauTaskStatus.STATUS_DUPLICATE;
              switch (result)
              {
                case EMRBauDuplicateResolveResult.IGNORE: newState = EMRBauTaskStatus.STATUS_SIGNING; break;
                case EMRBauDuplicateResolveResult.DELETE_SUCCESS: newState = EMRBauTaskStatus.STATUS_FINISHED;break
                case EMRBauDuplicateResolveResult.DELETE_CANCEL: newState = EMRBauTaskStatus.STATUS_DUPLICATE;break;
                case EMRBauDuplicateResolveResult.NEW_VERSION: newState = EMRBauTaskStatus.STATUS_SIGNING;break;
              }
              resolve({state:newState});
            })
            .catch( (error) => reject(error))
          }),
          prevState : () => new Promise<IMRBauTaskStatusAndUser>(resolve => resolve({state:EMRBauTaskStatus.STATUS_METADATA_EXTRACT_2})),
        },
        {state : EMRBauTaskStatus.STATUS_SIGNING,
          nextState : () => new Promise<IMRBauTaskStatusAndUser>(resolve => resolve({state:EMRBauTaskStatus.STATUS_ALL_SET})),
          prevState : () => new Promise<IMRBauTaskStatusAndUser>(resolve => resolve({state:EMRBauTaskStatus.STATUS_METADATA_EXTRACT_2}))},
        {state : EMRBauTaskStatus.STATUS_ALL_SET,
          nextState : () => new Promise<IMRBauTaskStatusAndUser>(resolve => resolve({state:EMRBauTaskStatus.STATUS_FINISHED})),
          prevState : () => new Promise<IMRBauTaskStatusAndUser>(resolve => resolve({state:EMRBauTaskStatus.STATUS_SIGNING}))},
        {state : EMRBauTaskStatus.STATUS_FINISHED,
          nextState : () => new Promise<IMRBauTaskStatusAndUser>(resolve => resolve({state:EMRBauTaskStatus.STATUS_FINISHED})),
          prevState : () => new Promise<IMRBauTaskStatusAndUser>(resolve => resolve({state:EMRBauTaskStatus.STATUS_ALL_SET}))},
        {state : EMRBauTaskStatus.STATUS_PAUSED,
          nextState : () => new Promise<IMRBauTaskStatusAndUser>(resolve => resolve({state:EMRBauTaskStatus.STATUS_PAUSED})),
          prevState : () => new Promise<IMRBauTaskStatusAndUser>(resolve => resolve({state:EMRBauTaskStatus.STATUS_PAUSED}))},
      ]},
      mrbauFormDefinitions : {
        'STATUS_METADATA_EXTRACT_1' : {
          formlyFieldConfigs: METADATA_EXTRACT_1_FORM_DEFINITION,
          mandatoryRequiredProperties: [
            'mrba:companyId',
            'mrba:organisationPosition',
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
            /*'mrba:netAmount',
            'mrba:grossAmount',
            'mrba:taxRate',*/
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
        'STATUS_SIGNING' : {
          formlyFieldConfigs: [
            'title_mrba_signingStatus',
            'element_mrba_signingStatus',
            ],
            mandatoryRequiredProperties: [
              'mrba:signingStatus'
            ]
        },
        'STATUS_PAUSED' : {
          formlyFieldConfigs: [
            'title_mrba_signingStatus',
            'element_mrba_signingStatus',
            ],
            mandatoryRequiredProperties: [
              'mrba:signingStatus'
            ]
        },
        'STATUS_ALL_SET' : {
          formlyFieldConfigs: [
            'workflow_all_set_form'
            ],
            mandatoryRequiredProperties: [
              'mrba:signingStatus'
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
      //  "mrba:documentIdentityDetails",
      //  "mrba:paymentConditionDetails",
      //  "mrba:invoiceReference",
      //  "mrba:partialInvoiceReference",
      //],
      category: EMRBauDocumentCategory.PAYMENT_TERMS,
      folder: "03 Zahlungsvereinbarungen",
      group : DocumentCategoryGroups.get(EMRBauDocumentCategoryGroup.BILLS),
      mrbauWorkflowDefinition: {states : [
        {state : EMRBauTaskStatus.STATUS_METADATA_EXTRACT_1,
          nextState : () => new Promise<IMRBauTaskStatusAndUser>(resolve => resolve({state:EMRBauTaskStatus.STATUS_METADATA_EXTRACT_2})),
          prevState : () => new Promise<IMRBauTaskStatusAndUser>(resolve => resolve({state:EMRBauTaskStatus.STATUS_METADATA_EXTRACT_1}))},
        {state : EMRBauTaskStatus.STATUS_METADATA_EXTRACT_2,
          nextState : (data) => new Promise<IMRBauTaskStatusAndUser>((resolve, reject) => {
            this.mrbauWorkflowService.performDuplicateCheck(data)
            .then( (duplicatedData) =>
            {
              resolve( duplicatedData ? {state:EMRBauTaskStatus.STATUS_DUPLICATE} : {state:EMRBauTaskStatus.STATUS_SIGNING});
            })
            .catch( (error) => reject(error))
          }),
          prevState : () => new Promise<IMRBauTaskStatusAndUser>(resolve => resolve({state:EMRBauTaskStatus.STATUS_METADATA_EXTRACT_1})),
          onEnterAction : (data) => this.mrbauWorkflowService.cloneMetadataFromLinkedDocuments(data)
        },
        {state : EMRBauTaskStatus.STATUS_DUPLICATE,
          nextState : (data) => new Promise<IMRBauTaskStatusAndUser>((resolve, reject) => {
            this.mrbauWorkflowService.resolveDuplicateIssue(data)
            .then( (result) =>
            {
              let newState = EMRBauTaskStatus.STATUS_DUPLICATE;
              switch (result)
              {
                case EMRBauDuplicateResolveResult.IGNORE: newState = EMRBauTaskStatus.STATUS_SIGNING; break;
                case EMRBauDuplicateResolveResult.DELETE_SUCCESS: newState = EMRBauTaskStatus.STATUS_FINISHED;break
                case EMRBauDuplicateResolveResult.DELETE_CANCEL: newState = EMRBauTaskStatus.STATUS_DUPLICATE;break;
                case EMRBauDuplicateResolveResult.NEW_VERSION: newState = EMRBauTaskStatus.STATUS_SIGNING;break;
              }
              resolve({state:newState});
            })
            .catch( (error) => reject(error))
          }),
          prevState : () => new Promise<IMRBauTaskStatusAndUser>(resolve => resolve({state:EMRBauTaskStatus.STATUS_METADATA_EXTRACT_2})),
        },
        {state : EMRBauTaskStatus.STATUS_SIGNING,
          nextState : () => new Promise<IMRBauTaskStatusAndUser>(resolve => resolve({state:EMRBauTaskStatus.STATUS_ALL_SET})),
          prevState : () => new Promise<IMRBauTaskStatusAndUser>(resolve => resolve({state:EMRBauTaskStatus.STATUS_METADATA_EXTRACT_2}))},
        {state : EMRBauTaskStatus.STATUS_ALL_SET,
          nextState : () => new Promise<IMRBauTaskStatusAndUser>(resolve => resolve({state:EMRBauTaskStatus.STATUS_FINISHED})),
          prevState : () => new Promise<IMRBauTaskStatusAndUser>(resolve => resolve({state:EMRBauTaskStatus.STATUS_SIGNING}))},
        {state : EMRBauTaskStatus.STATUS_FINISHED,
          nextState : () => new Promise<IMRBauTaskStatusAndUser>(resolve => resolve({state:EMRBauTaskStatus.STATUS_FINISHED})),
          prevState : () => new Promise<IMRBauTaskStatusAndUser>(resolve => resolve({state:EMRBauTaskStatus.STATUS_ALL_SET}))},
        {state : EMRBauTaskStatus.STATUS_PAUSED,
          nextState : () => new Promise<IMRBauTaskStatusAndUser>(resolve => resolve({state:EMRBauTaskStatus.STATUS_PAUSED})),
          prevState : () => new Promise<IMRBauTaskStatusAndUser>(resolve => resolve({state:EMRBauTaskStatus.STATUS_PAUSED}))},
      ]},
      mrbauFormDefinitions : {
        'STATUS_METADATA_EXTRACT_1' : {
          formlyFieldConfigs: [
            'title_mrba_organisationPosition',
            'element_mrba_organisationPosition',
            'title_mrba_companyId',
            'element_mrba_companyId',
          ],
          mandatoryRequiredProperties: [
            'mrba:companyId',
            'mrba:organisationPosition',
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
        'STATUS_SIGNING' : {
          formlyFieldConfigs: [
            'title_mrba_signingStatus',
            'element_mrba_signingStatus',
            ],
            mandatoryRequiredProperties: [
              'mrba:signingStatus'
            ]
        },
        'STATUS_PAUSED' : {
          formlyFieldConfigs: [
            'title_mrba_signingStatus',
            'element_mrba_signingStatus',
            ],
            mandatoryRequiredProperties: [
              'mrba:signingStatus'
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
          nextState : () => new Promise<IMRBauTaskStatusAndUser>(resolve => resolve({state:EMRBauTaskStatus.STATUS_METADATA_EXTRACT_2})),
          prevState : () => new Promise<IMRBauTaskStatusAndUser>(resolve => resolve({state:EMRBauTaskStatus.STATUS_METADATA_EXTRACT_1}))},
        {state : EMRBauTaskStatus.STATUS_METADATA_EXTRACT_2,
          nextState : (data) => new Promise<IMRBauTaskStatusAndUser>((resolve, reject) => {
            this.mrbauWorkflowService.performDuplicateCheck(data)
            .then( (duplicatedData) =>
            {
              resolve( duplicatedData ? {state:EMRBauTaskStatus.STATUS_DUPLICATE} : {state:EMRBauTaskStatus.STATUS_ALL_SET});
            })
            .catch( (error) => reject(error))
          }),
          prevState : () => new Promise<IMRBauTaskStatusAndUser>(resolve => resolve({state:EMRBauTaskStatus.STATUS_METADATA_EXTRACT_1})),
          onEnterAction : (data) => this.mrbauWorkflowService.cloneMetadataFromLinkedDocuments(data)
        },
        {state : EMRBauTaskStatus.STATUS_DUPLICATE,
          nextState : (data) => new Promise<IMRBauTaskStatusAndUser>((resolve, reject) => {
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
              resolve({state:newState});
            })
            .catch( (error) => reject(error))
          }),
          prevState : () => new Promise<IMRBauTaskStatusAndUser>(resolve => resolve({state:EMRBauTaskStatus.STATUS_METADATA_EXTRACT_2})),
        },
        {state : EMRBauTaskStatus.STATUS_ALL_SET,
          nextState : () => new Promise<IMRBauTaskStatusAndUser>(resolve => resolve({state:EMRBauTaskStatus.STATUS_FINISHED})),
          prevState : () => new Promise<IMRBauTaskStatusAndUser>(resolve => resolve({state:EMRBauTaskStatus.STATUS_METADATA_EXTRACT_2}))},
        {state : EMRBauTaskStatus.STATUS_FINISHED,
          nextState : () => new Promise<IMRBauTaskStatusAndUser>(resolve => resolve({state:EMRBauTaskStatus.STATUS_FINISHED})),
          prevState : () => new Promise<IMRBauTaskStatusAndUser>(resolve => resolve({state:EMRBauTaskStatus.STATUS_ALL_SET}))},
      ]},
      mrbauFormDefinitions : {
        'STATUS_METADATA_EXTRACT_1' : {
          formlyFieldConfigs: METADATA_EXTRACT_1_FORM_DEFINITION,
          mandatoryRequiredProperties: [
            'mrba:companyId',
            'mrba:organisationPosition',
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
      title: "Rechnung",
      name : "mrba:invoice",
      //parent : "mrba:archiveDocument",
      //mandatoryAspects : [
      //  "mrba:companyIdentifiers",
      //  "mrba:documentIdentityDetails",
      //  "mrba:fiscalYearDetails", ?
      //  "mrba:invoiceDetails",
      //  "mrba:taxRate",
      //  "mrba:paymentConditionDetails",
      //  "mrba:costCarrierDetails",
      //  "mrba:orderReference",
      //  "mrba:deliveryNoteReference",
      //  "mrba:invoiceReference",
      //  "mrba:partialInvoiceReference",
      //],
      category: EMRBauDocumentCategory.INVOICE,
      folder: "05 Rechnungen", // ER AR
      group : DocumentCategoryGroups.get(EMRBauDocumentCategoryGroup.BILLS),
      mrbauWorkflowDefinition: {states : [
        {state : EMRBauTaskStatus.STATUS_METADATA_EXTRACT_1,
          nextState : () => new Promise<IMRBauTaskStatusAndUser>(resolve => resolve({state:EMRBauTaskStatus.STATUS_LINK_DOCUMENTS})),
          prevState : () => new Promise<IMRBauTaskStatusAndUser>(resolve => resolve({state:EMRBauTaskStatus.STATUS_METADATA_EXTRACT_1}))},
        {state : EMRBauTaskStatus.STATUS_LINK_DOCUMENTS,
          nextState : (data) => new Promise<IMRBauTaskStatusAndUser>((resolve, reject) => {
            this.mrbauWorkflowService.createAssociationsForProposedDocuments(data)
            .then( () =>
            {
              resolve({state:EMRBauTaskStatus.STATUS_METADATA_EXTRACT_2});
            })
            .catch( (error) => reject(error))
            }),
          prevState : () => new Promise<IMRBauTaskStatusAndUser>(resolve => resolve({state:EMRBauTaskStatus.STATUS_METADATA_EXTRACT_1})),},
        {state : EMRBauTaskStatus.STATUS_METADATA_EXTRACT_2,
          nextState : (data) => new Promise<IMRBauTaskStatusAndUser>((resolve, reject) => {
            let invoiceIsER = this.isAuftraggeber(data.taskDetailNewDocument.taskNode.properties['mrba:organisationPosition']);
            let nextState = invoiceIsER ? EMRBauTaskStatus.STATUS_FORMAL_REVIEW : EMRBauTaskStatus.STATUS_ALL_SET;
            this.mrbauWorkflowService.performDuplicateCheck(data)
            .then( (duplicatedData) =>
            {
              resolve( duplicatedData ? {state:EMRBauTaskStatus.STATUS_DUPLICATE} : {state:nextState});
            })
            .catch( (error) => reject(error))
          }),
          prevState : () => new Promise<IMRBauTaskStatusAndUser>(resolve => resolve({state:EMRBauTaskStatus.STATUS_LINK_DOCUMENTS})),
          onEnterAction : (data) => this.mrbauWorkflowService.cloneMetadataFromLinkedDocuments(data)
        },
        {state : EMRBauTaskStatus.STATUS_DUPLICATE,
          nextState : (data) => new Promise<IMRBauTaskStatusAndUser>((resolve, reject) => {
            let invoiceIsER = this.isAuftraggeber(data.taskDetailNewDocument.taskNode.properties['mrba:organisationPosition']);
            let nextState = invoiceIsER ? EMRBauTaskStatus.STATUS_FORMAL_REVIEW : EMRBauTaskStatus.STATUS_ALL_SET
            this.mrbauWorkflowService.resolveDuplicateIssue(data)
            .then( (result) =>
            {
              let newState = EMRBauTaskStatus.STATUS_DUPLICATE;
              switch (result)
              {
                // TODO
                case EMRBauDuplicateResolveResult.IGNORE: newState = nextState; break;
                case EMRBauDuplicateResolveResult.DELETE_SUCCESS: newState = EMRBauTaskStatus.STATUS_FINISHED;break
                case EMRBauDuplicateResolveResult.DELETE_CANCEL: newState = EMRBauTaskStatus.STATUS_DUPLICATE;break;
                case EMRBauDuplicateResolveResult.NEW_VERSION: newState = nextState;break;
              }
              resolve({state:newState});
            })
            .catch( (error) => reject(error))
          }),
          prevState : () => new Promise<IMRBauTaskStatusAndUser>(resolve => resolve({state:EMRBauTaskStatus.STATUS_METADATA_EXTRACT_2})),
        },
        {state : EMRBauTaskStatus.STATUS_FORMAL_REVIEW,
          nextState : (data) => new Promise<IMRBauTaskStatusAndUser>((resolve, reject) => {
            let newNextState =EMRBauTaskStatus.STATUS_INVOICE_VERIFICATION
            if (data.taskDetailNewDocument.taskNode.properties["mrba:verifiedInboundInvoiceType"] == "Interne Rechnung")
            {
              // Interne Rechnung has different workflow
              newNextState =  EMRBauTaskStatus.STATUS_INTERNAL_INVOICE_VIEW;
            }
            this.mrbauWorkflowService.recalculateDueDate(data, EMRBauTaskStatus.STATUS_FORMAL_REVIEW)
            .then ( (result) => {
              result;
              return this.mrbauWorkflowService.getNewUserWithDialog(data, EMRBauTaskStatus.STATUS_INVOICE_VERIFICATION)
            })
            .then( (userName) => {
              resolve({state:newNextState,userName:userName}); })
            .catch( (error) => reject(error))
          }),
          prevState : () => new Promise<IMRBauTaskStatusAndUser>(resolve => resolve({state:EMRBauTaskStatus.STATUS_METADATA_EXTRACT_2})),
        },
        {state : EMRBauTaskStatus.STATUS_INVOICE_VERIFICATION,
          nextState : (data) => new Promise<IMRBauTaskStatusAndUser>((resolve, reject) => {
            this.mrbauWorkflowService.recalculateDueDate(data, EMRBauTaskStatus.STATUS_INVOICE_VERIFICATION)
            .then ( (result) => {
              result;
              resolve({state:EMRBauTaskStatus.STATUS_INVOICE_REVIEW})
            })
            .catch( (error) => reject(error))
          }),
          prevState : () => new Promise<IMRBauTaskStatusAndUser>(resolve => resolve({state:EMRBauTaskStatus.STATUS_FORMAL_REVIEW})),
          onEnterAction : (data) => this.mrbauWorkflowService.invoiceVerificationPrefillValues(data)
        },

        {state : EMRBauTaskStatus.STATUS_INVOICE_REVIEW,
          nextState : (data) => new Promise<IMRBauTaskStatusAndUser>((resolve, reject) => {
            this.mrbauWorkflowService.getNewElevatedUserWithDialog(data, EMRBauTaskStatus.STATUS_FINAL_APPROVAL)
            .then( (userName) => {resolve({state:EMRBauTaskStatus.STATUS_FINAL_APPROVAL, userName:userName}); })
            .catch( (error) => { reject(error)})
          }),
          prevState : () => new Promise<IMRBauTaskStatusAndUser>(resolve => resolve({state:EMRBauTaskStatus.STATUS_INVOICE_VERIFICATION})),
        },
        {state : EMRBauTaskStatus.STATUS_FINAL_APPROVAL,
          nextState : (data) => new Promise<IMRBauTaskStatusAndUser>((resolve, reject) => {
            this.mrbauWorkflowService.getNewUserWithDialog(data, EMRBauTaskStatus.STATUS_ACCOUNTING)
            .then( (userName) => { resolve({state:EMRBauTaskStatus.STATUS_ACCOUNTING, userName: userName}); })
            .catch( (error) => reject(error))
          }),
          prevState : () => new Promise<IMRBauTaskStatusAndUser>(resolve => resolve({state:EMRBauTaskStatus.STATUS_INVOICE_VERIFICATION})),
        },
        {state : EMRBauTaskStatus.STATUS_ACCOUNTING,
          nextState : () => new Promise<IMRBauTaskStatusAndUser>(resolve => resolve({state:EMRBauTaskStatus.STATUS_ALL_SET})),
          prevState : () => new Promise<IMRBauTaskStatusAndUser>(resolve => resolve({state:EMRBauTaskStatus.STATUS_INVOICE_VERIFICATION})),
        },
        {state : EMRBauTaskStatus.STATUS_ALL_SET,
          nextState : () => new Promise<IMRBauTaskStatusAndUser>(resolve => resolve({state:EMRBauTaskStatus.STATUS_FINISHED})),
          prevState : (data) => new Promise<IMRBauTaskStatusAndUser>(resolve => {
            let invoiceIsER = this.isAuftraggeber(data.taskDetailNewDocument.taskNode.properties['mrba:organisationPosition']);
            let prev = invoiceIsER ? EMRBauTaskStatus.STATUS_ACCOUNTING : EMRBauTaskStatus.STATUS_METADATA_EXTRACT_2
            resolve({state:prev})
            }
        )},
        {state : EMRBauTaskStatus.STATUS_INTERNAL_INVOICE_VIEW,
          nextState : () => new Promise<IMRBauTaskStatusAndUser>(resolve => resolve({state:EMRBauTaskStatus.STATUS_FINISHED})),
          prevState : () => new Promise<IMRBauTaskStatusAndUser>(resolve => resolve({state:EMRBauTaskStatus.STATUS_FORMAL_REVIEW})),
        },
        {state : EMRBauTaskStatus.STATUS_FINISHED,
          nextState : () => new Promise<IMRBauTaskStatusAndUser>(resolve => resolve({state:EMRBauTaskStatus.STATUS_FINISHED})),
          prevState : () => new Promise<IMRBauTaskStatusAndUser>(resolve => resolve({state:EMRBauTaskStatus.STATUS_ALL_SET}))},
      ]},
      mrbauFormDefinitions : {
        'STATUS_METADATA_EXTRACT_1' : {
          formlyFieldConfigs: METADATA_EXTRACT_1_FORM_DEFINITION,
          mandatoryRequiredProperties: [
            'mrba:companyId',
            'mrba:organisationPosition',
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
            'title_mrba_invoiceType',
            'element_mrba_invoiceType',
            'title_mrba_documentIdentityDetails',
            'aspect_mrba_documentIdentityDetails',
            'title_mrba_amountDetails_mrba_taxRate',
            'aspect_mrba_amountDetails_mrba_taxRate',
            'title_mrba_verifiedInboundInvoiceType',
            'element_mrba_verifiedInboundInvoiceType',
            'title_mrba_paymentConditionDetails',
            'aspect_mrba_paymentConditionDetails',
          ],
          mandatoryRequiredProperties: [
            'mrba:invoiceType',
            'mrba:documentNumber',
            'mrba:documentDateValue',
            'mrba:netAmount',
            'mrba:grossAmount',
            'mrba:taxRate',
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
            'label_group_invoiceType_archiveDate',
            'label_mrba_verifiedInboundInvoiceType',
            'label_group_netgrossPayment',
            'label_group_reviewDays',
            'label_group_earlyPaymentDiscount1',
            'label_group_earlyPaymentDiscount2',
            'label_group_paymentTargetDays'
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

            'title_mrba_documentSummary_large',
            'label_group_invoiceType_archiveDate',
            'label_group_netgrossPayment',
            'title_mrba_costCarrierDetails',
            'aspect_mrba_costCarrierDetails',
            'title_mrba_taxRate',
            'aspect_mrba_taxRate',
            'title_mrba_verifiedInboundInvoiceType',
            'element_mrba_verifiedInboundInvoiceType',
            'title_mrba_paymentConditionDetails',
            'aspect_mrba_paymentConditionDetails',
          ],
          mandatoryRequiredProperties: [
            'mrba:costCarrierNumber', //d:int
            'mrba:projectName',
            'mrba:grossAmountVerified',
            'mrba:verifyDateValue',
            'mrba:paymentDateNetValue',
            'mrba:taxRate',
          ]
        },
        'STATUS_INVOICE_REVIEW' : {
          formlyFieldConfigs: [
            'workflow_invoice_review',

            'title_mrba_verifyData',
            'label_group_paymentNetGrossVerified',
            'label_mrba_verifiedInboundInvoiceType',
            'label_group_paymentDiscount1',
            'label_group_paymentDiscount2',
            'label_group_paymentDateVerified',

            'title_mrba_documentSummary',
            'label_group_invoiceType_archiveDate',
            'label_group_companyDetails',
            'label_group_costCarrierDetails',
            'label_group_reviewDays',
            'label_group_earlyPaymentDiscount1',
            'label_group_earlyPaymentDiscount2',
            'label_group_paymentTargetDays'
            ],
            mandatoryRequiredProperties: [
            ]
        },
        'STATUS_FINAL_APPROVAL' : {
          formlyFieldConfigs: [
            'workflow_invoice_approval',

            'title_mrba_verifyData',
            'label_group_paymentNetGrossVerified',
            'label_mrba_verifiedInboundInvoiceType',
            'label_group_paymentDiscount1',
            'label_group_paymentDiscount2',
            'label_group_paymentDateVerified',

            'title_mrba_documentSummary',
            'label_group_invoiceType_archiveDate',
            'label_group_companyDetails',
            'label_group_costCarrierDetails',
            'label_group_reviewDays',
            'label_group_earlyPaymentDiscount1',
            'label_group_earlyPaymentDiscount2',
            'label_group_paymentTargetDays'
          ],
          mandatoryRequiredProperties: [
          ]
        },
        'STATUS_ACCOUNTING' : {
          formlyFieldConfigs: [
            'mrba_accountingId',

            'label_ignore_warning_rk',

            'title_mrba_verifyData',
            'label_group_paymentNetGrossVerified',
            'label_mrba_verifiedInboundInvoiceType',
            'label_group_paymentDiscount1',
            'label_group_paymentDiscount2',
            'label_group_paymentDateVerified',

            'title_mrba_documentSummary',
            'label_group_invoiceType_archiveDate',
            'label_group_companyDetails',
            'label_group_costCarrierDetails',
            'label_group_reviewDays',
            'label_group_earlyPaymentDiscount1',
            'label_group_earlyPaymentDiscount2',
            'label_group_paymentTargetDays'
          ],
          mandatoryRequiredProperties: [
            'mrba:accountingId',
          ]
        },
        'STATUS_INTERNAL_INVOICE_VIEW' : {
          formlyFieldConfigs: [
            'workflow_internal_invoice_view_form',
            'title_mrba_verifyData',
            'label_group_paymentNetGrossVerified',
            'label_mrba_verifiedInboundInvoiceType',
            'title_mrba_documentSummary',
            'label_group_invoiceType_archiveDate',
            'label_group_companyDetails',
            'label_group_costCarrierDetails',
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
      title: "Rechnungs-Prüfblatt",
      name : "mrba:invoiceReviewSheet",
      //parent : "mrba:archiveDocument",
      //mandatoryAspects : [
      //  "mrba:companyIdentifiers"
      //  "mrba:costCarrierDetails"
      //  "mrba:documentIdentityDetails"
      //  "mrba:invoiceReference"
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
          nextState : () => new Promise<IMRBauTaskStatusAndUser>(resolve => resolve({state:EMRBauTaskStatus.STATUS_METADATA_EXTRACT_2})),
          prevState : () => new Promise<IMRBauTaskStatusAndUser>(resolve => resolve({state:EMRBauTaskStatus.STATUS_METADATA_EXTRACT_1}))},
        {state : EMRBauTaskStatus.STATUS_METADATA_EXTRACT_2,
          nextState : (data) => new Promise<IMRBauTaskStatusAndUser>((resolve, reject) => {
            this.mrbauWorkflowService.performDuplicateCheck(data)
            .then( (duplicatedData) =>
            {
              resolve( duplicatedData ? {state:EMRBauTaskStatus.STATUS_DUPLICATE} : {state:EMRBauTaskStatus.STATUS_ALL_SET});
            })
            .catch( (error) => reject(error))
          }),
          prevState : () => new Promise<IMRBauTaskStatusAndUser>(resolve => resolve({state:EMRBauTaskStatus.STATUS_METADATA_EXTRACT_1})),
          onEnterAction : (data) => this.mrbauWorkflowService.cloneMetadataFromLinkedDocuments(data)
        },
        {state : EMRBauTaskStatus.STATUS_DUPLICATE,
          nextState : (data) => new Promise<IMRBauTaskStatusAndUser>((resolve, reject) => {
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
              resolve({state:newState});
            })
            .catch( (error) => reject(error))
          }),
          prevState : () => new Promise<IMRBauTaskStatusAndUser>(resolve => resolve({state:EMRBauTaskStatus.STATUS_METADATA_EXTRACT_2})),
        },
        {state : EMRBauTaskStatus.STATUS_ALL_SET,
          nextState : () => new Promise<IMRBauTaskStatusAndUser>(resolve => resolve({state:EMRBauTaskStatus.STATUS_FINISHED})),
          prevState : () => new Promise<IMRBauTaskStatusAndUser>(resolve => resolve({state:EMRBauTaskStatus.STATUS_METADATA_EXTRACT_2}))},
        {state : EMRBauTaskStatus.STATUS_FINISHED,
          nextState : () => new Promise<IMRBauTaskStatusAndUser>(resolve => resolve({state:EMRBauTaskStatus.STATUS_FINISHED})),
          prevState : () => new Promise<IMRBauTaskStatusAndUser>(resolve => resolve({state:EMRBauTaskStatus.STATUS_ALL_SET}))},
      ]},
      mrbauFormDefinitions : {
        'STATUS_METADATA_EXTRACT_1' : {
          formlyFieldConfigs: METADATA_EXTRACT_1_FORM_DEFINITION,
          mandatoryRequiredProperties: [
            'mrba:companyId',
            'mrba:organisationPosition',
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
      //  "mrba:costCarrierDetails",
      //],
      category: EMRBauDocumentCategory.OTHER_BILL,
      folder: "99 Sonstige Belege",
      group : DocumentCategoryGroups.get(EMRBauDocumentCategoryGroup.BILLS),
      mrbauWorkflowDefinition: {states : [
        {state : EMRBauTaskStatus.STATUS_METADATA_EXTRACT_1,
          nextState : () => new Promise<IMRBauTaskStatusAndUser>(resolve => resolve({state:EMRBauTaskStatus.STATUS_METADATA_EXTRACT_2})),
          prevState : () => new Promise<IMRBauTaskStatusAndUser>(resolve => resolve({state:EMRBauTaskStatus.STATUS_METADATA_EXTRACT_1}))},
        {state : EMRBauTaskStatus.STATUS_METADATA_EXTRACT_2,
          nextState : (data) => new Promise<IMRBauTaskStatusAndUser>((resolve, reject) => {
            this.mrbauWorkflowService.performDuplicateCheck(data)
            .then( (duplicatedData) =>
            {
              resolve( duplicatedData ? {state:EMRBauTaskStatus.STATUS_DUPLICATE} : {state:EMRBauTaskStatus.STATUS_ALL_SET});
            })
            .catch( (error) => reject(error))
          }),
          prevState : () => new Promise<IMRBauTaskStatusAndUser>(resolve => resolve({state:EMRBauTaskStatus.STATUS_METADATA_EXTRACT_1})),
          onEnterAction : (data) => this.mrbauWorkflowService.cloneMetadataFromLinkedDocuments(data)
        },
        {state : EMRBauTaskStatus.STATUS_DUPLICATE,
          nextState : (data) => new Promise<IMRBauTaskStatusAndUser>((resolve, reject) => {
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
              resolve({state:newState});
            })
            .catch( (error) => reject(error))
          }),
          prevState : () => new Promise<IMRBauTaskStatusAndUser>(resolve => resolve({state:EMRBauTaskStatus.STATUS_METADATA_EXTRACT_2})),
        },
        {state : EMRBauTaskStatus.STATUS_ALL_SET,
          nextState : () => new Promise<IMRBauTaskStatusAndUser>(resolve => resolve({state:EMRBauTaskStatus.STATUS_FINISHED})),
          prevState : () => new Promise<IMRBauTaskStatusAndUser>(resolve => resolve({state:EMRBauTaskStatus.STATUS_METADATA_EXTRACT_2}))},
        {state : EMRBauTaskStatus.STATUS_FINISHED,
          nextState : () => new Promise<IMRBauTaskStatusAndUser>(resolve => resolve({state:EMRBauTaskStatus.STATUS_FINISHED})),
          prevState : () => new Promise<IMRBauTaskStatusAndUser>(resolve => resolve({state:EMRBauTaskStatus.STATUS_ALL_SET}))},
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
    },
    {
      title: "Mahnung",
      name : "mrba:monition",
      //parent : "mrba:archiveDocument",
      category: EMRBauDocumentCategory.MONITION,
      folder: "08 Mahnungen",
      group : DocumentCategoryGroups.get(EMRBauDocumentCategoryGroup.BILLS),
      mrbauWorkflowDefinition: {states : [
        {state : EMRBauTaskStatus.STATUS_METADATA_EXTRACT_1,
          nextState : () => new Promise<IMRBauTaskStatusAndUser>(resolve => resolve({state:EMRBauTaskStatus.STATUS_METADATA_EXTRACT_2})),
          prevState : () => new Promise<IMRBauTaskStatusAndUser>(resolve => resolve({state:EMRBauTaskStatus.STATUS_METADATA_EXTRACT_1}))},
        {state : EMRBauTaskStatus.STATUS_METADATA_EXTRACT_2,
          nextState : (data) => new Promise<IMRBauTaskStatusAndUser>((resolve, reject) => {
            this.mrbauWorkflowService.performDuplicateCheck(data)
            .then( (duplicatedData) =>
            {
              resolve( duplicatedData ? {state:EMRBauTaskStatus.STATUS_DUPLICATE} : {state:EMRBauTaskStatus.STATUS_ALL_SET});
            })
            .catch( (error) => reject(error))
          }),
          prevState : () => new Promise<IMRBauTaskStatusAndUser>(resolve => resolve({state:EMRBauTaskStatus.STATUS_METADATA_EXTRACT_1})),
          onEnterAction : (data) => this.mrbauWorkflowService.cloneMetadataFromLinkedDocuments(data)
        },
        {state : EMRBauTaskStatus.STATUS_DUPLICATE,
          nextState : (data) => new Promise<IMRBauTaskStatusAndUser>((resolve, reject) => {
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
              resolve({state:newState});
            })
            .catch( (error) => reject(error))
          }),
          prevState : () => new Promise<IMRBauTaskStatusAndUser>(resolve => resolve({state:EMRBauTaskStatus.STATUS_METADATA_EXTRACT_2})),
        },
        {state : EMRBauTaskStatus.STATUS_ALL_SET,
          nextState : () => new Promise<IMRBauTaskStatusAndUser>(resolve => resolve({state:EMRBauTaskStatus.STATUS_FINISHED})),
          prevState : () => new Promise<IMRBauTaskStatusAndUser>(resolve => resolve({state:EMRBauTaskStatus.STATUS_METADATA_EXTRACT_2}))},
        {state : EMRBauTaskStatus.STATUS_FINISHED,
          nextState : () => new Promise<IMRBauTaskStatusAndUser>(resolve => resolve({state:EMRBauTaskStatus.STATUS_FINISHED})),
          prevState : () => new Promise<IMRBauTaskStatusAndUser>(resolve => resolve({state:EMRBauTaskStatus.STATUS_ALL_SET}))},
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
    },
    {
      title: "Haftrücklass",
      name : "mrba:liabilityEscrow",
      //parent : "mrba:guarantee",
      category: EMRBauDocumentCategory.LIABILITY_ESCROW,
      folder: "09 Garantien",
      group : DocumentCategoryGroups.get(EMRBauDocumentCategoryGroup.BILLS),
      mrbauWorkflowDefinition: {states : [
        {state : EMRBauTaskStatus.STATUS_METADATA_EXTRACT_1,
          nextState : () => new Promise<IMRBauTaskStatusAndUser>(resolve => resolve({state:EMRBauTaskStatus.STATUS_LINK_DOCUMENTS})),
          prevState : () => new Promise<IMRBauTaskStatusAndUser>(resolve => resolve({state:EMRBauTaskStatus.STATUS_METADATA_EXTRACT_1}))},
        {state : EMRBauTaskStatus.STATUS_LINK_DOCUMENTS,
          nextState : (data) => new Promise<IMRBauTaskStatusAndUser>((resolve, reject) => {
            this.mrbauWorkflowService.createAssociationsForProposedDocuments(data)
            .then( () =>
            {
              resolve({state:EMRBauTaskStatus.STATUS_METADATA_EXTRACT_2});
            })
            .catch( (error) => reject(error))
            }),
          prevState : () => new Promise<IMRBauTaskStatusAndUser>(resolve => resolve({state:EMRBauTaskStatus.STATUS_METADATA_EXTRACT_1})),},
        {state : EMRBauTaskStatus.STATUS_METADATA_EXTRACT_2,
          nextState : (data) => new Promise<IMRBauTaskStatusAndUser>((resolve, reject) => {
            let invoiceIsER = this.isAuftraggeber(data.taskDetailNewDocument.taskNode.properties['mrba:organisationPosition']);
            let nextState = invoiceIsER ? EMRBauTaskStatus.STATUS_FORMAL_REVIEW : EMRBauTaskStatus.STATUS_ALL_SET;
            this.mrbauWorkflowService.performDuplicateCheck(data)
            .then( (duplicatedData) =>
            {
              resolve( duplicatedData ? {state:EMRBauTaskStatus.STATUS_DUPLICATE} : {state:nextState});
            })
            .catch( (error) => reject(error))
          }),
          prevState : () => new Promise<IMRBauTaskStatusAndUser>(resolve => resolve({state:EMRBauTaskStatus.STATUS_LINK_DOCUMENTS})),
          onEnterAction : (data) => this.mrbauWorkflowService.cloneMetadataFromLinkedDocuments(data)
        },
        {state : EMRBauTaskStatus.STATUS_DUPLICATE,
          nextState : (data) => new Promise<IMRBauTaskStatusAndUser>((resolve, reject) => {
            let invoiceIsER = this.isAuftraggeber(data.taskDetailNewDocument.taskNode.properties['mrba:organisationPosition']);
            let nextState = invoiceIsER ? EMRBauTaskStatus.STATUS_FORMAL_REVIEW : EMRBauTaskStatus.STATUS_ALL_SET
            this.mrbauWorkflowService.resolveDuplicateIssue(data)
            .then( (result) =>
            {
              let newState = EMRBauTaskStatus.STATUS_DUPLICATE;
              switch (result)
              {
                // TODO
                case EMRBauDuplicateResolveResult.IGNORE: newState = nextState; break;
                case EMRBauDuplicateResolveResult.DELETE_SUCCESS: newState = EMRBauTaskStatus.STATUS_FINISHED;break
                case EMRBauDuplicateResolveResult.DELETE_CANCEL: newState = EMRBauTaskStatus.STATUS_DUPLICATE;break;
                case EMRBauDuplicateResolveResult.NEW_VERSION: newState = nextState;break;
              }
              resolve({state:newState});
            })
            .catch( (error) => reject(error))
          }),
          prevState : () => new Promise<IMRBauTaskStatusAndUser>(resolve => resolve({state:EMRBauTaskStatus.STATUS_METADATA_EXTRACT_2})),
        },
        {state : EMRBauTaskStatus.STATUS_FORMAL_REVIEW,
          nextState : (data) => new Promise<IMRBauTaskStatusAndUser>((resolve, reject) => {
            this.mrbauWorkflowService.getNewUserWithDialog(data, EMRBauTaskStatus.STATUS_INVOICE_VERIFICATION)
            .then( (userName) => {
              resolve({state:EMRBauTaskStatus.STATUS_INVOICE_VERIFICATION,userName:userName}); })
            .catch( (error) => reject(error))
          }),
          prevState : () => new Promise<IMRBauTaskStatusAndUser>(resolve => resolve({state:EMRBauTaskStatus.STATUS_METADATA_EXTRACT_2})),
        },
        {state : EMRBauTaskStatus.STATUS_INVOICE_VERIFICATION,
          nextState : () => new Promise<IMRBauTaskStatusAndUser>(resolve => resolve({state:EMRBauTaskStatus.STATUS_INVOICE_REVIEW})),
          prevState : () => new Promise<IMRBauTaskStatusAndUser>(resolve => resolve({state:EMRBauTaskStatus.STATUS_FORMAL_REVIEW})),
          onEnterAction : (data) => this.mrbauWorkflowService.invoiceVerificationPrefillValues(data)
        },
        {state : EMRBauTaskStatus.STATUS_INVOICE_REVIEW,
          nextState : (data) => new Promise<IMRBauTaskStatusAndUser>((resolve, reject) => {
            this.mrbauWorkflowService.getNewElevatedUserWithDialog(data, EMRBauTaskStatus.STATUS_FINAL_APPROVAL)
            .then( (userName) => {resolve({state:EMRBauTaskStatus.STATUS_FINAL_APPROVAL, userName:userName}); })
            .catch( (error) => { reject(error)})
          }),
          prevState : () => new Promise<IMRBauTaskStatusAndUser>(resolve => resolve({state:EMRBauTaskStatus.STATUS_INVOICE_VERIFICATION})),
        },
        {state : EMRBauTaskStatus.STATUS_FINAL_APPROVAL,
          nextState : (data) => new Promise<IMRBauTaskStatusAndUser>((resolve, reject) => {
            this.mrbauWorkflowService.getNewUserWithDialog(data, EMRBauTaskStatus.STATUS_ACCOUNTING)
            .then( (userName) => { resolve({state:EMRBauTaskStatus.STATUS_ACCOUNTING, userName: userName}); })
            .catch( (error) => reject(error))
          }),
          prevState : () => new Promise<IMRBauTaskStatusAndUser>(resolve => resolve({state:EMRBauTaskStatus.STATUS_INVOICE_VERIFICATION})),
        },
        {state : EMRBauTaskStatus.STATUS_ACCOUNTING,
          nextState : () => new Promise<IMRBauTaskStatusAndUser>(resolve => resolve({state:EMRBauTaskStatus.STATUS_ALL_SET})),
          prevState : () => new Promise<IMRBauTaskStatusAndUser>(resolve => resolve({state:EMRBauTaskStatus.STATUS_INVOICE_VERIFICATION})),
        },
        {state : EMRBauTaskStatus.STATUS_ALL_SET,
          nextState : () => new Promise<IMRBauTaskStatusAndUser>(resolve => resolve({state:EMRBauTaskStatus.STATUS_FINISHED})),
          prevState : (data) => new Promise<IMRBauTaskStatusAndUser>(resolve => {
            let invoiceIsER = this.isAuftraggeber(data.taskDetailNewDocument.taskNode.properties['mrba:organisationPosition']);
            let prev = invoiceIsER ? EMRBauTaskStatus.STATUS_ACCOUNTING : EMRBauTaskStatus.STATUS_METADATA_EXTRACT_2
            resolve({state:prev})
            }
            )},
        {state : EMRBauTaskStatus.STATUS_FINISHED,
          nextState : () => new Promise<IMRBauTaskStatusAndUser>(resolve => resolve({state:EMRBauTaskStatus.STATUS_FINISHED})),
          prevState : () => new Promise<IMRBauTaskStatusAndUser>(resolve => resolve({state:EMRBauTaskStatus.STATUS_ALL_SET}))},
      ]},
      mrbauFormDefinitions : {
        'STATUS_METADATA_EXTRACT_1' : {
          formlyFieldConfigs: METADATA_EXTRACT_1_FORM_DEFINITION,
          mandatoryRequiredProperties: [
            'mrba:companyId',
            'mrba:organisationPosition',
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
            'title_mrba_invoiceType',
            'element_mrba_invoiceType',
            'title_mrba_documentIdentityDetails',
            'aspect_mrba_documentIdentityDetails',
            'title_mrba_amountDetails_mrba_taxRate',
            'aspect_mrba_amountDetails_mrba_taxRate',
            'title_mrba_verifiedInboundInvoiceType',
            'element_mrba_verifiedInboundInvoiceType',
            'title_mrba_paymentConditionDetails',
            'aspect_mrba_paymentConditionDetails',
          ],
          mandatoryRequiredProperties: [
            'mrba:invoiceType',
            'mrba:documentNumber',
            'mrba:documentDateValue',
            'mrba:netAmount',
            'mrba:grossAmount',
            'mrba:taxRate',
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
            'label_group_invoiceType_archiveDate',
            'label_mrba_verifiedInboundInvoiceType',
            'label_group_netgrossPayment',
            'label_group_reviewDays',
            'label_group_earlyPaymentDiscount1',
            'label_group_earlyPaymentDiscount2',
            'label_group_paymentTargetDays'
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

            'title_mrba_documentSummary_large',
            'label_group_invoiceType_archiveDate',
            'label_group_netgrossPayment',
            'title_mrba_costCarrierDetails',
            'aspect_mrba_costCarrierDetails',
            'title_mrba_taxRate',
            'aspect_mrba_taxRate',
            'title_mrba_verifiedInboundInvoiceType',
            'element_mrba_verifiedInboundInvoiceType',
            'title_mrba_paymentConditionDetails',
            'aspect_mrba_paymentConditionDetails',
          ],
          mandatoryRequiredProperties: [
            'mrba:costCarrierNumber', //d:int
            'mrba:projectName',
            'mrba:grossAmountVerified',
            'mrba:verifyDateValue',
            'mrba:paymentDateNetValue',
            'mrba:taxRate',
          ]
        },
        'STATUS_INVOICE_REVIEW' : {
          formlyFieldConfigs: [
            'workflow_invoice_review',

            'title_mrba_verifyData',
            'label_group_paymentNetGrossVerified',
            'label_mrba_verifiedInboundInvoiceType',
            'label_group_paymentDiscount1',
            'label_group_paymentDiscount2',
            'label_group_paymentDateVerified',

            'title_mrba_documentSummary',
            'label_group_invoiceType_archiveDate',
            'label_group_companyDetails',
            'label_group_costCarrierDetails',
            'label_group_reviewDays',
            'label_group_earlyPaymentDiscount1',
            'label_group_earlyPaymentDiscount2',
            'label_group_paymentTargetDays'
            ],
            mandatoryRequiredProperties: [
            ]
        },
        'STATUS_FINAL_APPROVAL' : {
          formlyFieldConfigs: [
            'workflow_invoice_approval',

            'title_mrba_verifyData',
            'label_group_paymentNetGrossVerified',
            'label_mrba_verifiedInboundInvoiceType',
            'label_group_paymentDiscount1',
            'label_group_paymentDiscount2',
            'label_group_paymentDateVerified',

            'title_mrba_documentSummary',
            'label_group_invoiceType_archiveDate',
            'label_group_companyDetails',
            'label_group_costCarrierDetails',
            'label_group_reviewDays',
            'label_group_earlyPaymentDiscount1',
            'label_group_earlyPaymentDiscount2',
            'label_group_paymentTargetDays'
          ],
          mandatoryRequiredProperties: [
          ]
        },
        'STATUS_ACCOUNTING' : {
          formlyFieldConfigs: [
            'mrba_accountingId',

            'title_mrba_verifyData',
            'label_group_paymentNetGrossVerified',
            'label_mrba_verifiedInboundInvoiceType',
            'label_group_paymentDiscount1',
            'label_group_paymentDiscount2',
            'label_group_paymentDateVerified',

            'title_mrba_documentSummary',
            'label_group_invoiceType_archiveDate',
            'label_group_companyDetails',
            'label_group_costCarrierDetails',
            'label_group_reviewDays',
            'label_group_earlyPaymentDiscount1',
            'label_group_earlyPaymentDiscount2',
            'label_group_paymentTargetDays'
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
      title: "Deckungsrücklass",
      name : "mrba:financialRetention",
      //parent : "mrba:guarantee",
      category: EMRBauDocumentCategory.FINANCIAL_RETENTION,
      folder: "09 Garantien",
      group : DocumentCategoryGroups.get(EMRBauDocumentCategoryGroup.BILLS),
      mrbauWorkflowDefinition: {states : [
        {state : EMRBauTaskStatus.STATUS_METADATA_EXTRACT_1,
          nextState : () => new Promise<IMRBauTaskStatusAndUser>(resolve => resolve({state:EMRBauTaskStatus.STATUS_METADATA_EXTRACT_2})),
          prevState : () => new Promise<IMRBauTaskStatusAndUser>(resolve => resolve({state:EMRBauTaskStatus.STATUS_METADATA_EXTRACT_1}))},
        {state : EMRBauTaskStatus.STATUS_METADATA_EXTRACT_2,
          nextState : (data) => new Promise<IMRBauTaskStatusAndUser>((resolve, reject) => {
            this.mrbauWorkflowService.performDuplicateCheck(data)
            .then( (duplicatedData) =>
            {
              resolve( duplicatedData ? {state:EMRBauTaskStatus.STATUS_DUPLICATE} : {state:EMRBauTaskStatus.STATUS_ALL_SET});
            })
            .catch( (error) => reject(error))
          }),
          prevState : () => new Promise<IMRBauTaskStatusAndUser>(resolve => resolve({state:EMRBauTaskStatus.STATUS_METADATA_EXTRACT_1})),
          onEnterAction : (data) => this.mrbauWorkflowService.cloneMetadataFromLinkedDocuments(data)
        },
        {state : EMRBauTaskStatus.STATUS_DUPLICATE,
          nextState : (data) => new Promise<IMRBauTaskStatusAndUser>((resolve, reject) => {
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
              resolve({state:newState});
            })
            .catch( (error) => reject(error))
          }),
          prevState : () => new Promise<IMRBauTaskStatusAndUser>(resolve => resolve({state:EMRBauTaskStatus.STATUS_METADATA_EXTRACT_2})),
        },
        {state : EMRBauTaskStatus.STATUS_ALL_SET,
          nextState : () => new Promise<IMRBauTaskStatusAndUser>(resolve => resolve({state:EMRBauTaskStatus.STATUS_FINISHED})),
          prevState : () => new Promise<IMRBauTaskStatusAndUser>(resolve => resolve({state:EMRBauTaskStatus.STATUS_METADATA_EXTRACT_2}))},
        {state : EMRBauTaskStatus.STATUS_FINISHED,
          nextState : () => new Promise<IMRBauTaskStatusAndUser>(resolve => resolve({state:EMRBauTaskStatus.STATUS_FINISHED})),
          prevState : () => new Promise<IMRBauTaskStatusAndUser>(resolve => resolve({state:EMRBauTaskStatus.STATUS_ALL_SET}))},
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
    },
    {
      title: "Erfüllungsgarantie",
      name : "mrba:contractGuarantee",
      //parent : "mrba:guarantee",
      category: EMRBauDocumentCategory.CONTRACT_GUARANTEE,
      folder: "09 Garantien",
      group : DocumentCategoryGroups.get(EMRBauDocumentCategoryGroup.BILLS),
      mrbauWorkflowDefinition: {states : [
        {state : EMRBauTaskStatus.STATUS_METADATA_EXTRACT_1,
          nextState : () => new Promise<IMRBauTaskStatusAndUser>(resolve => resolve({state:EMRBauTaskStatus.STATUS_METADATA_EXTRACT_2})),
          prevState : () => new Promise<IMRBauTaskStatusAndUser>(resolve => resolve({state:EMRBauTaskStatus.STATUS_METADATA_EXTRACT_1}))},
        {state : EMRBauTaskStatus.STATUS_METADATA_EXTRACT_2,
          nextState : (data) => new Promise<IMRBauTaskStatusAndUser>((resolve, reject) => {
            this.mrbauWorkflowService.performDuplicateCheck(data)
            .then( (duplicatedData) =>
            {
              resolve( duplicatedData ? {state:EMRBauTaskStatus.STATUS_DUPLICATE} : {state:EMRBauTaskStatus.STATUS_ALL_SET});
            })
            .catch( (error) => reject(error))
          }),
          prevState : () => new Promise<IMRBauTaskStatusAndUser>(resolve => resolve({state:EMRBauTaskStatus.STATUS_METADATA_EXTRACT_1})),
          onEnterAction : (data) => this.mrbauWorkflowService.cloneMetadataFromLinkedDocuments(data)
        },
        {state : EMRBauTaskStatus.STATUS_DUPLICATE,
          nextState : (data) => new Promise<IMRBauTaskStatusAndUser>((resolve, reject) => {
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
              resolve({state:newState});
            })
            .catch( (error) => reject(error))
          }),
          prevState : () => new Promise<IMRBauTaskStatusAndUser>(resolve => resolve({state:EMRBauTaskStatus.STATUS_METADATA_EXTRACT_2})),
        },
        {state : EMRBauTaskStatus.STATUS_ALL_SET,
          nextState : () => new Promise<IMRBauTaskStatusAndUser>(resolve => resolve({state:EMRBauTaskStatus.STATUS_FINISHED})),
          prevState : () => new Promise<IMRBauTaskStatusAndUser>(resolve => resolve({state:EMRBauTaskStatus.STATUS_METADATA_EXTRACT_2}))},
        {state : EMRBauTaskStatus.STATUS_FINISHED,
          nextState : () => new Promise<IMRBauTaskStatusAndUser>(resolve => resolve({state:EMRBauTaskStatus.STATUS_FINISHED})),
          prevState : () => new Promise<IMRBauTaskStatusAndUser>(resolve => resolve({state:EMRBauTaskStatus.STATUS_ALL_SET}))},
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
    },
    {
      title: "Bescheid",
      name : "mrba:noteDocument",
      //parent : "mrba:archiveDocument",
      category: EMRBauDocumentCategory.NOTE_DOCUMENT,
      folder: "10 Bescheide",
      group : DocumentCategoryGroups.get(EMRBauDocumentCategoryGroup.BILLS),
      mrbauWorkflowDefinition: {states : [
        {state : EMRBauTaskStatus.STATUS_METADATA_EXTRACT_1,
          nextState : () => new Promise<IMRBauTaskStatusAndUser>(resolve => resolve({state:EMRBauTaskStatus.STATUS_METADATA_EXTRACT_2})),
          prevState : () => new Promise<IMRBauTaskStatusAndUser>(resolve => resolve({state:EMRBauTaskStatus.STATUS_METADATA_EXTRACT_1}))},
        {state : EMRBauTaskStatus.STATUS_METADATA_EXTRACT_2,
          nextState : (data) => new Promise<IMRBauTaskStatusAndUser>((resolve, reject) => {
            this.mrbauWorkflowService.performDuplicateCheck(data)
            .then( (duplicatedData) =>
            {
              resolve( duplicatedData ? {state:EMRBauTaskStatus.STATUS_DUPLICATE} : {state:EMRBauTaskStatus.STATUS_ALL_SET});
            })
            .catch( (error) => reject(error))
          }),
          prevState : () => new Promise<IMRBauTaskStatusAndUser>(resolve => resolve({state:EMRBauTaskStatus.STATUS_METADATA_EXTRACT_1})),
          onEnterAction : (data) => this.mrbauWorkflowService.cloneMetadataFromLinkedDocuments(data)
        },
        {state : EMRBauTaskStatus.STATUS_DUPLICATE,
          nextState : (data) => new Promise<IMRBauTaskStatusAndUser>((resolve, reject) => {
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
              resolve({state:newState});
            })
            .catch( (error) => reject(error))
          }),
          prevState : () => new Promise<IMRBauTaskStatusAndUser>(resolve => resolve({state:EMRBauTaskStatus.STATUS_METADATA_EXTRACT_2})),
        },
        {state : EMRBauTaskStatus.STATUS_ALL_SET,
          nextState : () => new Promise<IMRBauTaskStatusAndUser>(resolve => resolve({state:EMRBauTaskStatus.STATUS_FINISHED})),
          prevState : () => new Promise<IMRBauTaskStatusAndUser>(resolve => resolve({state:EMRBauTaskStatus.STATUS_METADATA_EXTRACT_2}))},
        {state : EMRBauTaskStatus.STATUS_FINISHED,
          nextState : () => new Promise<IMRBauTaskStatusAndUser>(resolve => resolve({state:EMRBauTaskStatus.STATUS_FINISHED})),
          prevState : () => new Promise<IMRBauTaskStatusAndUser>(resolve => resolve({state:EMRBauTaskStatus.STATUS_ALL_SET}))},
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
    },
  ];

  readonly CONTRACT_DEFAULT_WORKFLOW_DEFINITION = {
    states : [
      {state : EMRBauTaskStatus.STATUS_METADATA_EXTRACT_1,
        nextState : () => new Promise<IMRBauTaskStatusAndUser>(resolve => resolve({state:EMRBauTaskStatus.STATUS_METADATA_EXTRACT_2})),
        prevState : () => new Promise<IMRBauTaskStatusAndUser>(resolve => resolve({state:EMRBauTaskStatus.STATUS_METADATA_EXTRACT_1}))},
      {state : EMRBauTaskStatus.STATUS_METADATA_EXTRACT_2,
        onEnterAction : (data) => this.mrbauWorkflowService.cloneMetadataFromLinkedDocuments(data),
        nextState : (data) => new Promise<IMRBauTaskStatusAndUser>((resolve, reject) => {
          this.mrbauWorkflowService.performDuplicateCheck(data)
          .then( (duplicatedData) =>
          {
            resolve( duplicatedData ? {state:EMRBauTaskStatus.STATUS_DUPLICATE} : {state:EMRBauTaskStatus.STATUS_ALL_SET});
          })
          .catch( (error) => reject(error))
        }),
        prevState : () => new Promise<IMRBauTaskStatusAndUser>(resolve => resolve({state:EMRBauTaskStatus.STATUS_METADATA_EXTRACT_1})),
      },
      {state : EMRBauTaskStatus.STATUS_DUPLICATE,
        nextState : (data) => new Promise<IMRBauTaskStatusAndUser>((resolve, reject) => {
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
            resolve({state:newState});
          })
          .catch( (error) => reject(error))
        }),
        prevState : () => new Promise<IMRBauTaskStatusAndUser>(resolve => resolve({state:EMRBauTaskStatus.STATUS_METADATA_EXTRACT_2})),
      },
      {state : EMRBauTaskStatus.STATUS_ALL_SET,
        nextState : () => new Promise<IMRBauTaskStatusAndUser>(resolve => resolve({state:EMRBauTaskStatus.STATUS_FINISHED})),
        prevState : () => new Promise<IMRBauTaskStatusAndUser>(resolve => resolve({state:EMRBauTaskStatus.STATUS_METADATA_EXTRACT_2}))},
      {state : EMRBauTaskStatus.STATUS_FINISHED,
        nextState : () => new Promise<IMRBauTaskStatusAndUser>(resolve => resolve({state:EMRBauTaskStatus.STATUS_FINISHED})),
        prevState : () => new Promise<IMRBauTaskStatusAndUser>(resolve => resolve({state:EMRBauTaskStatus.STATUS_ALL_SET}))},
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
