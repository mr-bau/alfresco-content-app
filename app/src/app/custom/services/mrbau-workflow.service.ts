import { Injectable } from '@angular/core';
import { Node, NodeAssociation, NodeAssociationEntry, NodePaging, SearchRequest } from '@alfresco/js-api';
import { EMRBauTaskStatus } from '../mrbau-task-declarations';
import { MrbauCommonService } from './mrbau-common.service';
import { MrbauConventionsService } from './mrbau-conventions.service';
import { MRBauWorkflowStateCallbackData } from '../mrbau-doc-declarations';

@Injectable({
  providedIn: 'root'
})
export class MrbauWorkflowService {

  constructor(
    private mrbauCommonService: MrbauCommonService,
    private mrbauConventionsService: MrbauConventionsService,

    ) { }

  assignNewUser(data:MRBauWorkflowStateCallbackData, status: EMRBauTaskStatus) : Promise<any> {
    data;
    data.taskDetailNewDocument.task.assignedUserName = this.mrbauConventionsService.getTaskDefaultAssignedUserIdForStatus(data, status);
    return this.mrbauCommonService.updateTaskAssignNewUser(data.taskDetailNewDocument.task.id, data.taskDetailNewDocument.task.assignedUserName);
  }

  createAssociationsForProposedDocuments(data:MRBauWorkflowStateCallbackData) : Promise<any> {
    if (data && data.taskDetailNewDocument)
    {
      return data.taskDetailNewDocument.addProposedMatchingDocuments();
    }
    else
    {
      return new Promise((resolve) => resolve(null));
    }
  }

  performDuplicateCheck(data:MRBauWorkflowStateCallbackData) : Promise<any> {
    data;
    console.log("performDuplicateCheck 1");
    return new Promise((resolve) => {
      setTimeout(resolve => resolve(null), 1000, resolve)});
  }

  cloneMetadataFromLinkedDocuments(data:MRBauWorkflowStateCallbackData) : Promise<any> {
    if (data == null || data.taskDetailNewDocument == null || data.taskDetailNewDocument.taskNode == null || data.taskDetailNewDocument.taskNodeAssociations == null)
    {

      return Promise.resolve(null);
    }
    const associations = data.taskDetailNewDocument.taskNodeAssociations;
    let filteredAssociations : NodeAssociationEntry[] = [];
    const nodeTypePriorityList : string[] = [
      "mrba:orderNegotiationProtocol",
      "mrba:order",
      "mrba:frameworkContract",
      "mrba:offer",
    ];
    let documentCount = 0;
    let propertyCount = 0;
    for (const priority of nodeTypePriorityList)
    {
      filteredAssociations = associations.filter((entry) => (entry.entry.nodeType == priority));
      if (filteredAssociations.length > 0)
      {
        propertyCount += this.clonePaymentMetaData(data, filteredAssociations[0].entry);
        documentCount++;
      }
    }
    this.mrbauCommonService.showInfo(propertyCount+" Eigenschaften von "+documentCount+" Dokumenten übertragen");
    return Promise.resolve(null);
  }

  private clonePaymentMetaData(data:MRBauWorkflowStateCallbackData, association: NodeAssociation) : number
  {
    let numPropertiesCopied = 0;
    const fieldList = [
      "mrba:paymentTargetDays",
      "mrba:reviewDaysFinalInvoice",
      "mrba:reviewDaysPartialInvoice",
      "mrba:earlyPaymentDiscountPercent1",
      "mrba:earlyPaymentDiscountDays1",
      "mrba:earlyPaymentDiscountPercent2",
      "mrba:earlyPaymentDiscountDays2",
      "mrba:netAmount",
      "mrba:grossAmount",
      "mrba:taxRate",
      "mrba:taxRateComment",
    ];
    for (const property of fieldList)
    {
      if (data.taskDetailNewDocument.model[property] == null || data.taskDetailNewDocument.model[property] == "")
      {
        if (association.properties[property] != null)
        {
          data.taskDetailNewDocument.model[property] = String(association.properties[property]);
          numPropertiesCopied++;
        }
      }
    }
    return numPropertiesCopied;
  }

  private correctWeekend(date : Date) {
    let weekendOffset = 0;
    if (date.getDay() == 6) weekendOffset = 2;
    if (date.getDay() == 0) weekendOffset = 1;
    date.setDate(date.getDate() + weekendOffset);
  }

  invoiceVerificationPrefillValues(data:MRBauWorkflowStateCallbackData) : Promise<any> {
    const props = data.taskDetailNewDocument.taskNode.properties;
    if (data.taskDetailNewDocument.model['mrba:netAmountVerified'] == null) // null or undefined
    {
      data.taskDetailNewDocument.model['mrba:netAmountVerified'] = props['mrba:netAmount'];
    }

    let reviewDate = new Date(props['mrba:archivedDateValue']);
    if (data.taskDetailNewDocument.model['mrba:verifyDateValue'] == null)
    {
      const reviewDays = props['mrba:inboundInvoiceType'] == 'Anzahlung' ? props['mrba:reviewDaysPartialInvoice'] : props['mrba:reviewDaysFinalInvoice'];
      reviewDate.setDate(reviewDate.getDate() + reviewDays);
      this.correctWeekend(reviewDate);
      data.taskDetailNewDocument.model['mrba:verifyDateValue'] = this.mrbauCommonService.getFormDateValue(reviewDate);
    }

    if (data.taskDetailNewDocument.model['mrba:paymentDateNetValue'] == null && props['mrba:paymentTargetDays'])
    {
      let date = new Date();
      date.setDate(reviewDate.getDate() + props['mrba:paymentTargetDays']);
      this.correctWeekend(date);
      data.taskDetailNewDocument.model['mrba:paymentDateNetValue'] = this.mrbauCommonService.getFormDateValue(date);
    }

    if (data.taskDetailNewDocument.model['mrba:paymentDateDiscount1Value'] == null && props['mrba:earlyPaymentDiscountDays1'])
    {
      let date = new Date();
      date.setDate(reviewDate.getDate() + props['mrba:earlyPaymentDiscountDays1']);
      this.correctWeekend(date);
      data.taskDetailNewDocument.model['mrba:paymentDateDiscount1Value'] = this.mrbauCommonService.getFormDateValue(date);
    }

    if (data.taskDetailNewDocument.model['mrba:paymentDateDiscount2Value'] == null && props['mrba:earlyPaymentDiscountDays2'])
    {
      let date = new Date();
      date.setDate(reviewDate.getDate() + props['mrba:earlyPaymentDiscountDays2']);
      this.correctWeekend(date);
      data.taskDetailNewDocument.model['mrba:paymentDateDiscount2Value'] = this.mrbauCommonService.getFormDateValue(date);
    }

    return new Promise((resolve) => resolve(null));
  }

  queryProposedDocuments(node: Node) : Promise<NodePaging>
  {
    let query : SearchRequest;
    if (node != null)
    {
      query = {
        query: {
          query: '*',
          language: 'afts'
        },
        filterQueries: [
          { query: '=SITE:belegsammlung'},
          { query: `=mrba:companyName:"${node.properties['mrba:companyName']}"`},
        ],
        fields: [
          // ATTENTION make sure to request all mandatory fields for Node (vs ResultNode!)
          'id',
          'name',
          'nodeType',
          'isFolder',
          'isFile',
          'modifiedAt',
          'modifiedByUser',
          'createdAt',
          'createdByUser',
        ],
        //include: ['association'],
        sort: [
          {
            type: 'FIELD',
            field: 'TYPE',
            ascending: false
          },
          {
            type: 'FIELD',
            field: 'cm:name',
            ascending: true
          },
        ]
      };
    }
    if (node.nodeType == 'mrba:offer' || node.nodeType == 'mrba:order')
    {
      query.filterQueries.push({ query: `(=TYPE:"mrba:offer" AND cm:created:[NOW/DAY-120DAYS TO NOW/DAY+1DAY]) OR (=TYPE:"mrba:frameworkContract" AND cm:created:[NOW/DAY-1095DAYS TO NOW/DAY+1DAY])`});
    }
    else if (node.nodeType == 'mrba:orderNegotiationProtocol')
    {
      query.filterQueries.push({ query: `=TYPE:"mrba:order" AND =mrba:costCarrierNumber:"${node.properties['mrba:costCarrierNumber']}"`});
    }
    else if (node.nodeType == 'mrba:inboundInvoice')
    {
      query.filterQueries.push({ query: `((=TYPE:"mrba:order" OR =TYPE:"mrba:deliveryNote" OR =TYPE:"mrba:orderNegotiationProtocol") AND =mrba:costCarrierNumber:"${node.properties['mrba:costCarrierNumber']}") OR (=TYPE:"mrba:frameworkContract" AND cm:created:[NOW/DAY-1095DAYS TO NOW/DAY+1DAY])`});
    }
    else if (node.nodeType == 'mrba:frameworkContract' || node.nodeType == 'mrba:deliveryNote' || node.nodeType == 'mrba:miscellaneousDocument')
    {
      query = null;
    }

    if (query != null)
    {
      return this.mrbauCommonService.queryNodes(query) as Promise<NodePaging>;
    }
    return new Promise((resolve) => resolve(null));
  }
}
