//https://github.com/mr-bau/alfresco-customisations/blob/default/mrbau-alfresco-platform/src/main/resources/alfresco/module/mrbau-alfresco-platform/model/archiveModel.xml
//https://github.com/mr-bau/alfresco-customisations/blob/default/mrbau-alfresco-platform/src/main/resources/alfresco/module/mrbau-alfresco-platform/messages/archiveModel.properties

import { EMRBauTaskStatus, IMRBauWorkflowState, MRBauWorkflowStateCallbackData } from './mrbau-task-declarations';
import { MrbauWorkflowService } from './services/mrbau-workflow.service';

export interface IMRBauDocumentAspect {
  name: string,
  properties?: string[],
  associations?: string[]
}

export const enum EMRBauDocumentCategory {
  // BILLS
  ARCHIVE_DOCUMENT,
  OFFER,
  ORDER,
  ADDON_ORDER,
  ORDER_NEGOTIATION_PROTOCOL,
  DELIVERY_NOTE,
  ER,
  PAYMENT_TERMS,
  OTHER_BILL,
  // CONTRACTS
  /*
  LEASE_CONTRACT,
  WAIVE_TERMINATION_RIGHT,
  MAINTENANCE_CONTRACT,
  ALL_IN_CONTRACT,
  LICENSE_CONTRACT,
  TERMINATION,
  FUEL_CARD,
  OTHER_CONTRACT*/
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

// COMMONLY USED DEFINITIONS
const METADATA_EXTRACT_1_FORM_DEFINITION = [
    'title_mrba_companyId',
    'element_mrba_companyId',
    'title_mrba_costCarrierDetails',
    'aspect_mrba_costCarrierDetails',
  ];

// ARCHIVE MODEL
export class MrbauArchiveModel {
  constructor(
    private mrbauWorkflowService : MrbauWorkflowService,
    ){}

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

  getWorkFlowStateFromNodeType(data:MRBauWorkflowStateCallbackData) : IMRBauWorkflowState {
    const state = data.task.status;
    const nodeType = data.node.nodeType;
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
    return (workflowState) ? workflowState.nextState(data) : new Promise<EMRBauTaskStatus>(resolve => resolve(data.task.status));
  }

  getPrevTaskStateFromNodeType(data:MRBauWorkflowStateCallbackData) : Promise<EMRBauTaskStatus> {
    const workflowState = this.getWorkFlowStateFromNodeType(data);
    return (workflowState) ? workflowState.prevState(data) : new Promise<EMRBauTaskStatus>(resolve => resolve(data.task.status));
  }

  readonly mrbauArchiveModelTypes : IMRBauDocumentType[] = [
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
      folder: "99 doc",
      group : DocumentCategoryGroups.get(EMRBauDocumentCategoryGroup.BILLS),
      mrbauFormDefinitions : { },
      mrbauWorkflowDefinition: {states : []},
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
          nextState : () => new Promise<EMRBauTaskStatus>(resolve => resolve(EMRBauTaskStatus.STATUS_ALL_SET)),
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
            'title_mrba_orderType',
            'element_mrba_orderType',
            'title_mrba_documentIdentityDetails',
            'aspect_mrba_documentIdentityDetails',
            'title_mrba_amountDetails_mrba_taxRate',
            'aspect_mrba_amountDetails_mrba_taxRate',
          ],
          mandatoryRequiredProperties: [
            'mrba:documentNumber',
            'mrba:documentDateValue',
            'mrba:orderType',
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
          nextState : () => new Promise<EMRBauTaskStatus>(resolve => resolve(EMRBauTaskStatus.STATUS_ALL_SET)),
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
          nextState : () => new Promise<EMRBauTaskStatus>(resolve => resolve(EMRBauTaskStatus.STATUS_ALL_SET)),
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
          nextState : () => new Promise<EMRBauTaskStatus>(resolve => resolve(EMRBauTaskStatus.STATUS_ALL_SET)),
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
        }
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
      mrbauFormDefinitions : { },
      mrbauWorkflowDefinition: {states : []},
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
          nextState : () => new Promise<EMRBauTaskStatus>(resolve => resolve(EMRBauTaskStatus.STATUS_ALL_SET)),
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
          nextState : () => new Promise<EMRBauTaskStatus>(resolve => resolve(EMRBauTaskStatus.STATUS_ALL_SET)),
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
}

/*
export const MRBauArchiveModelAspects : IMRBauDocumentAspect[] = [
  {
    name :"mrba:archiveDates",
    properties: [
      "mrba:archivedDate",
      "mrba:archivedDateValue", // date value - kept in sync with mrba:archivedDate and set at 00:00 using Europe/Vienna as timezone
      "mrba:archiveDurationYears", // default 7
      "mrba:fiscalYear",
    ],
  },
  {
    name :"mrba:archiveIdentifiers",
    properties: [
      "mrba:mrBauId",
      "mrba:organisationUnit",
    ],
  },
  {
    name :"mrba:documentIdentityDetails",
    properties: [
      "mrba:documentTopic",
      "mrba:documentNumber",
      "mrba:documentDate", // d:text
      "mrba:documentDateValue" // d:date - date value - kept in sync with mrba:documentDate and set at 00:00 using Europe/Vienna as timezone
    ],
  },
  {
    name :"mrba:addonOrderDetails",
    properties: [
      "mrba:addonOrderNumber",
    ],
  },
  {
    name :"mrba:paymentConditionDetails",
    properties: [
      "mrba:reviewDaysPartialInvoice",
      "mrba:reviewDaysFinalInvoice",
      "mrba:paymentTargetDays",
      "mrba:earlyPaymentDiscountDays1",
      "mrba:earlyPaymentDiscountPercent1",
      "mrba:earlyPaymentDiscountPercentNumericValue1",
      "mrba:earlyPaymentDiscountDays2",
      "mrba:earlyPaymentDiscountPercent2",
      "mrba:earlyPaymentDiscountPercentNumericValue2",
    ],
  },
  {
    name :"mrba:amountDetails",
    properties: [
      "mrba:netAmountCents", // kept in sync with mrba:netAmount
      "mrba:netAmount",
      "mrba:grossAmountCents", // kept in sync with mrba:netAmount
      "mrba:grossAmount",
    ],
  },
  {
    name :"mrba:offerReference",
    associations: [
      "mrba:offer"
    ],
  },
  {
    name :"mrba:orderReference",
    associations: [
      "mrba:order"
    ],
  },
  {
    name :"mrba:frameworkContractReference",
    associations: [
      "mrba:frameworkContract"
    ],
  },
  {
    name :"mrba:deliveryNoteReference",
    associations: [
      "mrba:deliveryNote"
    ],
  },
  {
    name :"mrba:inboundInvoiceReference",
    associations: [
      "mrba:inboundInvoice"
    ],
  },
  {
    name :"mrba:inboundPartialInvoiceReference",
    associations: [
      "mrba:inboundInvoice"
    ],
  },
  {
    name :"mrba:taxRate",
    properties: [
      "mrba:taxRate",
      "mrba:taxRatePercent", // kept in sync with mrba:taxRate
      "mrba:taxRateComment",
    ],
  },
  {
    name :"mrba:companyIdentifiers",
    properties: [
      "mrba:companyId",
      "mrba:companyName",
      "mrba:companyVatID",
      "mrba:companyStreet",
      "mrba:companyZipCode",
      "mrba:companyCity",
      "mrba:companyCountryCode",
    ],
  },
  {
    name :"mrba:costCarrierDetails",
    properties: [
      "mrba:costCarrierNumber",
      "mrba:projectName",
    ],
  },
  {
    name:"mrba:fiscalYearDetails",
    properties: [
    "mrba:fiscalYear",
    "mrba:projectName",
  ],
  },
  {
    name : "mrba:inboundInvoiceDetails",
    properties: [
    "mrba:inboundInvoiceType",
    "mrba:revokedInvoiceNumber",
    "mrba:partialInvoiceNumber",
    ]
  },
  {
    name : "mrba:inboundRevokedInvoiceReference",
    properties: [
    "mrba:inboundRevokedInvoice"
    ]
  }
];

export const MRBauArchiveModelConstraints = [
  "mrba:datePattern",
  "mrba:nonNegative",
  "mrba:germanDecimalOneDecimalPlace",
  "mrba:germanDecimalTwoDecimalPlaces",
];
*/
