import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of  } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ICostCarrier, IVendor } from './mrbau-conventions.service';


export const environment = {
  production: true,
  //serverUrl: 'http://localhost:5000'
  serverUrl: 'https://mrdms01.mrbau.at/mysql-db'
};

export interface IMrbauDbService_mrba_vendor {
  mrba_companyId?: number,
  mrba_companyName: string,
  mrba_companyStreet: string,
  mrba_companyZipCode:  string,
  mrba_companyCity:  string,
  mrba_companyVatID?: string,
  mrba_companyEmail?: string,
  mrba_companyPhone?: string
}

export interface IMrbauDbService_mrba_project {
  mrba_projectId?: number,
  mrba_costCarrierNumber: string,
  mrba_projectName : string,
  auditor1?:string
  auditor2?:string,
  accountant?:string;
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
    })
    return result;
  }

  private getErrorMessage(error: HttpErrorResponse) : string {
    if (error.status === 0) {
      // A client-side or network error occurred. Handle it accordingly.
      return (error.message) ? error.message : 'Unbekannter Netzwerk Fehler';
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong.
      console.error(error);
      return (error.message) ? error.message : `Unbekannter Backend Fehler - status ${error.status}`;
    }
  }

  getVendor(id:number) : Observable<string | IVendor> {
    return this.request('GET', `${environment.serverUrl}/mrba_vendor/get/${id}`)
    .pipe(
      map((result) =>
        {
          let vendor : IMrbauDbService_mrba_vendor = result.mrba_vendor;
          return {
            "mrba:companyId" : vendor.mrba_companyId.toString(),
            "mrba:companyName" : vendor.mrba_companyName,
            "mrba:companyStreet" : vendor.mrba_companyStreet,
            "mrba:companyZipCode" : vendor.mrba_companyZipCode,
            "mrba:companyCity" : vendor.mrba_companyCity,
            "mrba:companyVatID" : vendor.mrba_companyVatID,
            "mrba:companyEmail" : vendor.mrba_companyEmail,
            "mrba:companyPhone" : vendor.mrba_companyPhone
          } as IVendor
        }
      ),
      catchError(val => {
        return of(this.getErrorMessage(val))}
      )
    );
  }

  searchVendors(searchValue:string) : Observable<string | IVendor[]>{
    return this.request('GET', `${environment.serverUrl}/mrba_vendor/search?name=${searchValue}`).pipe(
      map((result) =>
        { return (result.mrba_vendors as IMrbauDbService_mrba_vendor[]).map(vendor =>
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
      ),
      catchError(val => {
        return of(this.getErrorMessage(val))}
      )
    );
  }
/*
  getVendors() : Observable<string | IVendor[]>{
    return this.request('GET', `${environment.serverUrl}/mrba_vendor`).pipe(
      map((result) =>
        { return (result.mrba_vendors as IMrbauDbService_mrba_vendor[]).map(vendor =>
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
      ),
      catchError(val => {
        return of(this.getErrorMessage(val))}
      )
    );
  }*/

  addVendor(data:IMrbauDbService_mrba_vendor) : Observable<any>{
    return this.request('POST', `${environment.serverUrl}/mrba_vendor/new`, data).pipe(
      map((result) => result),
      catchError(val => of(this.getErrorMessage(val)))
    );
  }

  getProject(costCarrierNumber:string) : Observable<string | ICostCarrier> {
    return this.request('GET', `${environment.serverUrl}/mrba_project/get/${costCarrierNumber}`)
    .pipe(
      map((result) =>
        {
          //console.log(result);
          let project : IMrbauDbService_mrba_project = result.mrba_project;
          if (!project) {
            return null;
          }
          return {
            "mrba:costCarrierNumber" : project.mrba_costCarrierNumber,
            "mrba:projectName" : project.mrba_projectName,
            "auditor1" : project.auditor1,
            "auditor2" : project.auditor2,
            "accountant" : project.accountant,
          } as ICostCarrier;
        }
      ),
      catchError(val => {
        return of(this.getErrorMessage(val))}
      )
    );
  }

  addProject(data:IMrbauDbService_mrba_project) : Observable<any>{
    return this.request('POST', `${environment.serverUrl}/mrba_project/new`, data).pipe(
      map((result) => result),
      catchError(val => of(this.getErrorMessage(val)))
    );
  }

  searchProjects(searchValue:string) : Observable<string | ICostCarrier[]>{
    return this.request('GET', `${environment.serverUrl}/mrba_project/search?name=${searchValue}`).pipe(
      map((result) =>
        { return (result.mrba_projects as IMrbauDbService_mrba_project[]).map(project =>
          { return {
            "mrba:costCarrierNumber" : project.mrba_costCarrierNumber,
            "mrba:projectName" : project.mrba_projectName,
            "auditor1" : project.auditor1,
            "auditor2" : project.auditor2,
            "accountant":project.accountant
            } as ICostCarrier
          })
        }
      ),
      catchError(val => {
        return of(this.getErrorMessage(val))}
      )
    );
  }
}
