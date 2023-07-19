import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

export const environment = {
  production: false,
  serverUrl: 'http://localhost:5000'
};

// SERVICE
@Injectable({
  providedIn: 'root'
})
export class MrbauDbService {
  constructor(private http: HttpClient)
  {
  }

  private async request(method: string, url: string, data?: any) : Promise<any>{
    const result = this.http.request(method, url, {
      body: data,
      responseType: 'json',
      observe: 'body',
      headers: {
      }
    });
    return new Promise((resolve, reject) => {
      result.subscribe(resolve, reject);
    });
  }

  getVendors() : Promise<any>{
    return this.request('GET', `${environment.serverUrl}/mrba_vendor`);
  }

  addVendor(data:string) : Promise<any>{
    return this.request('POST', `${environment.serverUrl}/mrba_vendor/new`, data);
  }

}
