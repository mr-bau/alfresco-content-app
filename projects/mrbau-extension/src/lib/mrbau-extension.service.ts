import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MrbauExtensionService {
  mrbauSmartViewerEnabled() {
    return true;
  }

  constructor() { }
}
