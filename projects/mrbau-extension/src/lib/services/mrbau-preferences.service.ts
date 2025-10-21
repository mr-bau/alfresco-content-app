import { Injectable } from '@angular/core';
import { MrbauCommonService } from './mrbau-common.service';

// SERVICE
@Injectable({
  providedIn: 'root'
})
export class MrbauPreferencesService {

  constructor(
    private mrbauCommonService : MrbauCommonService
  ) {
    this.mrbauCommonService;
  }

  private getPrefix() : string {
    return this.mrbauCommonService.getCurrentUserAuthLowerCase()+'.';
  }

  // Set item in local storage
  setItem(key: string, value: any): void {
    try {
      const jsonValue = JSON.stringify(value);
      localStorage.setItem(this.getPrefix()+key, jsonValue);
    } catch (error) {
      console.error('Error saving to local storage', error);
    }
  }
  // Get item from local storage
  getItem<T>(key: string): T | null {
    try {
      const value = localStorage.getItem(this.getPrefix()+key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Error reading from local storage', error);
      return null;
    }
  }
  // Remove item from local storage
  removeItem(key: string): void {
    try {
      localStorage.removeItem(this.getPrefix()+key);
    } catch (error) {
      console.error('Error removing item', error);
    }
  }
  // Clear all local storage
  clearStorage(): void {
      try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing storage', error);
    }
  }
}
