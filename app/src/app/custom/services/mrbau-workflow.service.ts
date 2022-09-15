import { Injectable } from '@angular/core';
import { EMRBauTaskStatus, MRBauWorkflowStateCallbackData } from '../mrbau-task-declarations';
import { MrbauCommonService } from './mrbau-common.service';
import { MrbauConventionsService } from './mrbau-conventions.service';

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
    data.task.assignedUserName = this.mrbauConventionsService.getTaskDefaultAssignedUserIdForStatus(data, status);
    return this.mrbauCommonService.updateTaskAssignNewUser(data.task.id, data.task.assignedUserName);
  }

  performDuplicateCheck(data:MRBauWorkflowStateCallbackData) : Promise<any> {
    data;
    console.log("performDuplicateCheck 1");
    return new Promise((resolve) => {
      setTimeout(this.dummyDuplicateCheck, 1000, resolve)});
  }

  dummyDuplicateCheck(resolve)
  {
    console.log("performDuplicateCheck 2");
    resolve(null);
  }

  cloneMetadataFromLinkedDocuments(data:MRBauWorkflowStateCallbackData) : Promise<any> {
    data;
    console.log("cloneMetadataFromLinkedDocuments 1");
    return new Promise((resolve) => {
      setTimeout(this.dummyCloneMetadataFromLinkedDocuments, 1000, resolve)});
  }

  dummyCloneMetadataFromLinkedDocuments(resolve)
  {
    console.log("cloneMetadataFromLinkedDocuments 2");
    resolve(null);
  }

  private correctWeekend(date : Date) {
    let weekendOffset = 0;
    if (date.getDay() == 6) weekendOffset = 2;
    if (date.getDay() == 0) weekendOffset = 1;
    date.setDate(date.getDate() + weekendOffset);
  }

  invoiceVerificationPrefillValues(data:MRBauWorkflowStateCallbackData) : Promise<any> {
    const props = data.node.properties;
    if (data.model['mrba:netAmountVerified'] == null) // null or undefined
    {
      data.model['mrba:netAmountVerified'] = props['mrba:netAmount'];
    }

    let reviewDate = new Date(props['mrba:archivedDateValue']);
    if (data.model['mrba:verifyDateValue'] == null)
    {
      const reviewDays = props['mrba:inboundInvoiceType'] == 'Anzahlung' ? props['mrba:reviewDaysPartialInvoice'] : props['mrba:reviewDaysFinalInvoice'];
      reviewDate.setDate(reviewDate.getDate() + reviewDays);
      this.correctWeekend(reviewDate);
      data.model['mrba:verifyDateValue'] = this.mrbauCommonService.getFormDateValue(reviewDate);
    }

    if (data.model['mrba:paymentDateNet'] == null && props['mrba:paymentTargetDays'])
    {
      let date = new Date();
      date.setDate(reviewDate.getDate() + props['mrba:paymentTargetDays']);
      this.correctWeekend(date);
      data.model['mrba:paymentDateNet'] = this.mrbauCommonService.getFormDateValue(date);
    }

    if (data.model['mrba:paymentDateDiscount1'] == null && props['mrba:earlyPaymentDiscountDays1'])
    {
      let date = new Date();
      date.setDate(reviewDate.getDate() + props['mrba:earlyPaymentDiscountDays1']);
      this.correctWeekend(date);
      data.model['mrba:paymentDateDiscount1'] = this.mrbauCommonService.getFormDateValue(date);
    }

    if (data.model['mrba:paymentDateDiscount2'] == null && props['mrba:earlyPaymentDiscountDays2'])
    {
      let date = new Date();
      date.setDate(reviewDate.getDate() + props['mrba:earlyPaymentDiscountDays2']);
      this.correctWeekend(date);
      data.model['mrba:paymentDateDiscount2'] = this.mrbauCommonService.getFormDateValue(date);
    }

    return new Promise((resolve) => resolve(null));
  }
}
