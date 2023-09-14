import { Injectable } from '@angular/core';
import { Node, NodeAssociation, NodeAssociationEntry, NodePaging, SearchRequest } from '@alfresco/js-api';
import { EMRBauTaskStatus } from '../mrbau-task-declarations';
import { MrbauCommonService } from './mrbau-common.service';
import { MrbauConventionsService } from './mrbau-conventions.service';
import { MRBauWorkflowStateCallbackData } from '../mrbau-doc-declarations';
import { EMRBauDuplicateResolveOptions, EMRBauDuplicateResolveResult } from '../form/mrbau-formly-duplicated-document.component';
import { MrbauActionService } from './mrbau-action.service';
import { CONST } from '../mrbau-global-declarations';
import { MrbauConfirmTaskDialogComponent } from '../dialogs/mrbau-confirm-task-dialog/mrbau-confirm-task-dialog.component';
import { Observable } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';

@Injectable({
  providedIn: 'root'
})
export class MrbauWorkflowService {

  constructor(
    private mrbauActionService: MrbauActionService,
    private mrbauCommonService: MrbauCommonService,
    private mrbauConventionsService: MrbauConventionsService,
    private dialog: MatDialog,
    ) { }

  getNewUserWithDialog(data:MRBauWorkflowStateCallbackData, status: EMRBauTaskStatus) : Promise<string> {
    data;
    return new Promise<string>((resolve, reject) => {
      this.mrbauConventionsService.getTaskDefaultAssignedUserIdForStatus(data, status)
      .then((assignedUserName) => {
        this.mrbauCommonService.progressWithNewUserConfirmDialog(assignedUserName)
        .then((name) => {
          resolve(name);
        })
        .catch((error) => reject(error));
      })
      .catch((error) => reject(error));
    });
  }

  getNewElevatedUserWithDialog(data:MRBauWorkflowStateCallbackData, status: EMRBauTaskStatus) : Promise<string> {
    return new Promise<string>((resolve, reject) => {
      this.mrbauConventionsService.getTaskDefaultAssignedUserIdForStatus(data, status)
      .then((assignedUserName) => {
        /*if (assignedUserName) {
          resolve(assignedUserName);
          return;
        }*/
        this.mrbauCommonService.progressWithElevatedAuditorsConfirmDialog(assignedUserName)
        .then((name) => {
          resolve(name);
        })
        .catch((error) => reject(error));
      })
      .catch((error) => reject(error));
    });
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
    const nodeTypesForDuplicateCheck : string[] = [
      "mrba:offer",
      "mrba:order",
      "mrba:frameworkContract",
      "mrba:deliveryNote",
      "mrba:invoice",
      "mrba:orderNegotiationProtocol",
      "mrba:miscellaneousDocument",

      "mrba:rentContract",
      "mrba:contractCancellationWaiver",
      "mrba:maintenanceContract",
      "mrba:allInContract",
      "mrba:licenseContract",
      "mrba:financingContract",
      "mrba:workContract",
      "mrba:contractCancellation",
      "mrba:miscellaneousContractDocument",
    ];
    const node = data.taskDetailNewDocument.taskNode;
    if (nodeTypesForDuplicateCheck.indexOf(node.nodeType) < 0)
    {
      return new Promise((resolve) => resolve(null));
    }
    let query : SearchRequest = {
      query: {
        query: '*',
        language: 'afts'
      },
      filterQueries: [
        { query: `=TYPE:"${node.nodeType}"`},
        { query: `=mrba:organisationUnit:"${node.properties['mrba:organisationUnit']}"`},
        { query: `=mrba:companyId:"${node.properties['mrba:companyId']}"`},
        { query: `=mrba:documentNumber:"${node.properties['mrba:documentNumber']}"`},
        { query: `=mrba:organisationPosition:"${node.properties['mrba:organisationPosition']}"`},
        { query: '!ASPECT:"mrba:discardedDocument"'}, // ignore discarded documents
        //{ query: '!EXISTS:"mrba:discardDate"'}, // ignore discarded documents - NOT SUPPORTED WITH TMDQ
        //{ query: `!ID:'workspace://SpacesStore/${node.id}'`}, // exclude the current document - NOT SUPPORTED WITH TMDQ
        // { query: '=SITE:belegsammlung'}, // NOT SUPPORTED WITH TMDQ
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
      include: ['properties', 'path', 'allowableOperations']
    };
    return new Promise((resolve, reject) => {
      this.mrbauCommonService.queryNodes(query)
      .then((result) => {
        const filteredResult = result.list.entries.filter(data => data.entry.id != node.id); // exclude the current document
        if (filteredResult.length > 0)
        {
          data.taskDetailNewDocument.duplicateNode = filteredResult[0].entry as Node;
          resolve(filteredResult[0].entry);
        }
        else
        {
          data.taskDetailNewDocument.duplicateNode = undefined;
          resolve(null);
        }
      })
      .catch((error) => reject(error));
    });
  }

  resolveDuplicateIssue(data:MRBauWorkflowStateCallbackData) : Promise<any>
  {
    const resolveSelection = data.taskDetailNewDocument.model['ignore:mrbauFormlyDuplicatedDocument'];
    if (resolveSelection!=null)
    {
      const nodeId = data.taskDetailNewDocument.taskNode.id;
      if (data.taskDetailNewDocument.taskNode.properties['mrba:discardDate'])
      {
        // already discarded
        console.log("Document already discarded: "+data.taskDetailNewDocument.taskNode.properties['mrba:discardDate']);
        return Promise.resolve(EMRBauTaskStatus.STATUS_FINISHED);
      }
      switch (resolveSelection)
      {
        default:
        case EMRBauDuplicateResolveOptions.IGNORE:
          return Promise.resolve(EMRBauDuplicateResolveResult.IGNORE);
        case EMRBauDuplicateResolveOptions.DELETE:
          return new Promise((resolve, reject) =>
            {
              this.mrbauCommonService.discardDocumentWithConfirmDialog(nodeId)
              .then(
              (result) => {
                  // successfully deleted or canceled
                  const stat = (result === true) ? EMRBauDuplicateResolveResult.DELETE_SUCCESS : EMRBauDuplicateResolveResult.DELETE_CANCEL
                  return resolve(stat);
              })
              .catch((error) => reject(error));
            }
          );
        case EMRBauDuplicateResolveOptions.NEW_VERSION:
          const duplicateNode = data.taskDetailNewDocument.duplicateNode;
          if (!duplicateNode)
          {
            return Promise.reject('Error: duplicate node not set');
          }
          return new Promise((resolve, reject) =>
          {
            //this.mrbauActionService.mrbauUseAsNewVersionActionApi(nodeId, duplicateNode.id, 'Neue Dokument Version von Dublettenprüfung (Node ID '+duplicateNode.id+', Task ID '+data.taskDetailNewDocument.task.id+')')
            this.mrbauActionService.mrbauUseAsNewVersionWebScript(nodeId, duplicateNode.id, 'Neue Dokument Version von Dublettenprüfung (Node ID '+duplicateNode.id+', Task ID '+data.taskDetailNewDocument.task.id+')')
            .then(() => {
              // Notification Message
              this.mrbauCommonService.showInfo("Dokument als neue Version hinzugefügt.");
              // add new document to task
              console.log('add new document to task');
              return this.mrbauCommonService.addAssociatedDocumentFromTask(data.taskDetailNewDocument.task.id, [duplicateNode.id])
            })
            .then(() => {
              data.taskDetailNewDocument.reloadTaskRequiredFlag = true;
              return resolve(EMRBauDuplicateResolveResult.NEW_VERSION);
            })
            .catch((error) => {return reject(error)});
          });
      }
    }
    return Promise.reject('Unknown Resolve Selection');
  }

  private getResetArchiveTypeFormlyOptions(): Observable<any[]> {
    return new Observable((observer) => {
      this.mrbauActionService.mrbauResetArchiveTypeGetFormDefinition()
      .then(result => {
        const fields = result.data.definition.fields.filter(val => val.name=="newType");
        if (fields?.length > 0 && fields[0].constraints[0].parameters.allowedValues)
        {
          const results = fields[0].constraints[0].parameters.allowedValues.map(val => {const split=val.split('|'); return {id:split[0], name:split[1]}});
          observer.next(results);
          observer.complete();
        }
        else
        {
          observer.next([]);
          observer.complete();
        }
      })
      .catch(error => observer.error(error))
    });

  }

  resetArchiveTypeWithConfirmDialog(nodeId : string) : Promise<string>
  {
    return new Promise((resolve, reject) =>
      {
        // dialog
        const dialogRef = this.dialog.open(MrbauConfirmTaskDialogComponent, {
          data: {
            dialogTitle: 'Neuen Dokumenttyp zuweisen',
            dialogMsg: 'Neuen Dokumenttyp zuweisen?',
            dialogButtonOK: 'ZUWEISEN',
            callQueryData: false,
            fieldsMain: [
              {
                fieldGroupClassName: 'flex-container-min-width',
                fieldGroup: [
                  {
                    className: 'flex-2',
                    key: 'comment',
                    type: 'textarea',
                    props: {
                      label: 'Optionaler Kommentar',
                      description: 'Kommentar',
                      maxLength: CONST.MAX_LENGTH_COMMENT,
                      required: false,
                    },
                  }
                ]
              },
              {
                fieldGroupClassName: 'flex-container-min-width',
                fieldGroup: [
                  {
                    className: 'flex-2',
                    key: 'newArchiveType',
                    type: 'select',
                    props: {
                      label: 'Neuer Dokument Typ',
                      description: 'Neuer Dokument Typ',
                      required: true,
                      options: this.getResetArchiveTypeFormlyOptions(),
                      valueProp: 'id',
                      labelProp: 'name',
                    },
                  },
                ]
              }
            ],
            payload: null
          }
        });

        dialogRef.afterClosed().subscribe((result) => {
          if (result)
          {
            const newArchiveType = result.newArchiveType
            this.mrbauCommonService.addComment(nodeId, result.comment)
            .then( () => {return this.mrbauActionService.mrbauResetArchiveTypeWebscript(nodeId, newArchiveType);})
            .then(() =>
            {
              //Notification Message
              this.mrbauCommonService.showInfo("Dokument-Type erfolgreich geändert.");
              return resolve(newArchiveType);
            })
            .catch((error) => reject(error));
          }
          else
          {
            return resolve(null);
          }
        });
      }
    )
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
    if (propertyCount > 0)
    {
      this.mrbauCommonService.showInfo(propertyCount+" Eigenschaften von "+documentCount+" Dokumenten übertragen");
    }
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
      "mrba:taxRateMixedRate",
    ];
    for (const property of fieldList)
    {
      if (data.taskDetailNewDocument.model[property] === null || data.taskDetailNewDocument.model[property] === undefined || data.taskDetailNewDocument.model[property] === "")
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
    if (weekendOffset > 0) {
      date.setDate(date.getDate() + weekendOffset);
    }
  }

  private addDays(date: Date, days: number) : Date {
    let result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  };

  invoiceVerificationPrefillValues(data:MRBauWorkflowStateCallbackData) : Promise<any> {
    const props = data.taskDetailNewDocument.taskNode.properties;
    if (data.taskDetailNewDocument.model['mrba:netAmountVerified'] == null) // null or undefined
    {
      data.taskDetailNewDocument.model['mrba:netAmountVerified'] = props['mrba:netAmount'];
    }

    let reviewDate = new Date(props['mrba:archivedDateValue']);
    reviewDate = this.addDays(reviewDate, 1); // Prüffrist starts on next day

    if (data.taskDetailNewDocument.model['mrba:verifyDateValue'] == null)
    {
      const reviewDays = props['mrba:invoiceType'] == 'Teilrechnung' ? props['mrba:reviewDaysPartialInvoice'] : props['mrba:reviewDaysFinalInvoice'];
      reviewDate = this.addDays(reviewDate, reviewDays);
      this.correctWeekend(reviewDate);
      data.taskDetailNewDocument.model['mrba:verifyDateValue'] = this.mrbauCommonService.getFormDateValue(reviewDate);
    }

    if (data.taskDetailNewDocument.model['mrba:paymentDateNetValue'] == null && props['mrba:paymentTargetDays'])
    {
      let date = this.addDays(reviewDate, props['mrba:paymentTargetDays'])
      this.correctWeekend(date);
      data.taskDetailNewDocument.model['mrba:paymentDateNetValue'] = this.mrbauCommonService.getFormDateValue(date);
    }

    if (data.taskDetailNewDocument.model['mrba:paymentDateDiscount1Value'] == null && props['mrba:earlyPaymentDiscountDays1'])
    {
      let date = this.addDays(reviewDate, props['mrba:earlyPaymentDiscountDays1'])
      this.correctWeekend(date);
      data.taskDetailNewDocument.model['mrba:paymentDateDiscount1Value'] = this.mrbauCommonService.getFormDateValue(date);
    }

    if (data.taskDetailNewDocument.model['mrba:paymentDateDiscount2Value'] == null && props['mrba:earlyPaymentDiscountDays2'])
    {
      let date = this.addDays(reviewDate, props['mrba:earlyPaymentDiscountDays2'])
      this.correctWeekend(date);
      data.taskDetailNewDocument.model['mrba:paymentDateDiscount2Value'] = this.mrbauCommonService.getFormDateValue(date);
    }

    return new Promise((resolve) => resolve(null));
  }

  queryProposedDocuments(node: Node) : Promise<NodePaging>
  {
    // query: '*',  - NOT SUPPORTED WITH TMDQ
    // { query: '=SITE:belegsammlung'}, // NOT SUPPORTED WITH TMDQ
    // { query: `!ID:'workspace://SpacesStore/${node.id}'`}, // exclude the current document - NOT SUPPORTED WITH TMDQ
    // sort // NOT SUPPORTED WITH TMDQ
    // OR (=TYPE:"mrba:frameworkContract" AND cm:created:[NOW/DAY-1095DAYS TO NOW/DAY+1DAY]) // DATE INTERVAL NOT SUPPORTED WITH TMDQ
    let query : SearchRequest;
    if (node != null)
    {
      query = {
        query: {
          query: 'TYPE:"cm:content"',
          language: 'afts'
        },
        filterQueries: [
          //{ query: '=SITE:belegsammlung'}, // NOT SUPPORTED WITH TMDQ
          { query: `=mrba:companyName:"${node.properties['mrba:companyName']}"`},
          { query: `=mrba:organisationUnit:"${node.properties['mrba:organisationUnit']}"`},
          { query: '!ASPECT:"mrba:discardedDocument"'}, // ignore discarded documents
          { query: `!ID:'workspace://SpacesStore/${node.id}'`}, // exclude the current document - NOT SUPPORTED WITH TMDQ
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
        include: ['properties', 'path', 'allowableOperations'],
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
          }
        ]
      };
    }
    if (node.nodeType == 'mrba:order' || node.nodeType == 'mrba:orderNegotiationProtocol')
    {
      query.filterQueries.push({ query: `(=TYPE:"mrba:offer" AND cm:created:[NOW/DAY-120DAYS TO NOW/DAY+1DAY]) OR (=TYPE:"mrba:frameworkContract" AND cm:created:[NOW/DAY-1095DAYS TO NOW/DAY+1DAY])`});
    }
    else if (node.nodeType == 'mrba:invoice')
    {
      query.filterQueries.push({ query: `
      ((=TYPE:"mrba:order" OR =TYPE:"mrba:invoice" OR =TYPE:"mrba:orderNegotiationProtocol") AND (=mrba:costCarrierNumber:"${node.properties['mrba:costCarrierNumber']}" OR =mrba:costCarrierNumber:"0000"))
      OR (=TYPE:"mrba:frameworkContract" AND cm:created:[NOW/DAY-1095DAYS TO NOW/DAY+1DAY])
      OR (=TYPE:"mrba:deliveryNote" AND (=mrba:costCarrierNumber:"${node.properties['mrba:costCarrierNumber']}" OR =mrba:costCarrierNumber:"0000") AND (!ASPECT:"mrba:referencedDeliveryNote" OR =mrba:deliveryNoteBeingReferencedCount:0))
      `}); // date interval NOT SUPPORTED WITH TMDQ
    }
    else if (node.nodeType == 'mrba:invoiceReviewSheet')
    {
      query.filterQueries.push({ query: `=TYPE:"mrba:invoice" AND =mrba:costCarrierNumber:"${node.properties['mrba:costCarrierNumber']}"`});
    }
    else if (node.nodeType == 'mrba:frameworkContract' || node.nodeType == 'mrba:deliveryNote' || node.nodeType == 'mrba:miscellaneousDocument' || node.nodeType == 'mrba:offer' )
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
