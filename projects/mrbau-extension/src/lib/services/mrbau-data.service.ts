import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

export enum EDataServiceEvents {
  PDF_VIEWER_EVENT = "PDF_VIEWER_EVENT",
}

export enum EPDFEventCommands {
  ADD_PAGE_FIRST = "ADD_PAGE_FIRST",
}

export interface IEventData {
  eventType : EDataServiceEvents,
  eventCommand : EPDFEventCommands,
  eventData : any,
  [key:string]: any,
}

export interface IPDFViewerEventReceiver {
  executePDFViewerEvent: (data:IEventData) => Observable<boolean> | Promise<boolean> | boolean;
}

@Injectable({ providedIn: 'root' })
export class MrbauDataService {
  // Event bus
  private pdfViewerEventSource = new Subject<any>();
  pdfViewerEvents$ = this.pdfViewerEventSource.asObservable();
  // Method for senders to call
  emitPDFViewerEvent(data: IEventData) {
    this.pdfViewerEventSource.next(data);
  }
}

