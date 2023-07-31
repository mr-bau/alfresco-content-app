import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { IVendor } from './mrbau-conventions.service';


export const environment = {
  production: false,
  serverUrl: 'http://localhost:5000'
};

interface IMrbauDbService_mrba_vendors {
  mrba_companyId: number,
  mrba_companyName: string,
  mrba_companyStreet: string,
  mrba_companyZipCode:  string,
  mrba_companyCity:  string,
  mrba_companyVatID?: string,
  mrba_companyEmail: string,
  mrba_companyPhone?: string
}

// SERVICE
@Injectable({
  providedIn: 'root'
})
export class MrbauDbService {
  constructor(private http: HttpClient)
  {
  }

  private request(method: string, url: string, data?: any) : Observable<any>{
    const result = this.http.request(method, url, {
      body: data,
      responseType: 'json',
      observe: 'body',
      headers: {
      }
    });
    return result;
  }

  searchVendors(searchValue:string) : Observable<IVendor[]>{
    return this.request('GET', `${environment.serverUrl}/mrba_vendor/search?name=${searchValue}`).pipe(
      map((result) =>
        { return (result.mrba_vendors as IMrbauDbService_mrba_vendors[]).map(vendor =>
          { return {
            "mrba:companyId" : vendor.mrba_companyId.toString(),
            "mrba:companyName" : vendor.mrba_companyName,
            "mrba:companyStreet" : vendor.mrba_companyStreet,
            "mrba:companyZipCode" : vendor.mrba_companyZipCode,
            "mrba:companyCity" : vendor.mrba_companyCity,
            "mrba:companyVatID" : vendor.mrba_companyVatID,
            "mrba:companyEmail" : vendor.mrba_companyEmail,
            "mrba:companyPhone" : vendor.mrba_companyPhone
            } as IVendor
          })
        }
      )
    );
  }

  getVendors() : Observable<IVendor[]>{
    return this.request('GET', `${environment.serverUrl}/mrba_vendor`).pipe(
      map((result) =>
        { return (result.mrba_vendors as IMrbauDbService_mrba_vendors[]).map(vendor =>
          { return {
            "mrba:companyId" : vendor.mrba_companyId.toString(),
            "mrba:companyName" : vendor.mrba_companyName,
            "mrba:companyStreet" : vendor.mrba_companyStreet,
            "mrba:companyZipCode" : vendor.mrba_companyZipCode,
            "mrba:companyCity" : vendor.mrba_companyCity,
            "mrba:companyVatID" : vendor.mrba_companyVatID,
            "mrba:companyEmail" : vendor.mrba_companyEmail,
            "mrba:companyPhone" : vendor.mrba_companyPhone
            } as IVendor
          })
        }
      )
    );
  }

  addVendor(data:string) : Observable<any>{
    return this.request('POST', `${environment.serverUrl}/mrba_vendor/new`, data);
  }

}
