import { Injectable } from '@angular/core';
import { MRBauWorkflowStateCallbackData } from '../mrbau-task-declarations';

@Injectable({
  providedIn: 'root'
})
export class MrbauWorkflowService {

  constructor() { }

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
}
