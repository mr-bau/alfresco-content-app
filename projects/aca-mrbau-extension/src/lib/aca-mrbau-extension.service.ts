import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AcaMrbauExtensionService {
  mySmartViewerEnabled()
  {
    return true;
  }
  constructor() { }
}
