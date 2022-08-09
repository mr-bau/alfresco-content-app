import { Injectable } from '@angular/core';
import { MRBauWorkflowStateCallbackData } from '../mrbau-task-declarations';

@Injectable({
  providedIn: 'root'
})
export class MrbauWorkflowService {

  constructor() { }

  performDuplicateCheck(data:MRBauWorkflowStateCallbackData) : Promise<any> {
    data;
    //console.log("performDuplicateCheck 1");
    return new Promise((resolve) => {
      setTimeout(this.dummyDuplicateCheck, 1000, resolve)});
  }

  dummyDuplicateCheck(resolve)
  {
    //console.log("performDuplicateCheck 2");
    resolve(null);
  }
}
