import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MrbauExtensionService {
  mrbauExtensionEnabled() {
    return true;
  }

  constructor() { }
}
