import { Component, OnInit } from '@angular/core';
import { MrbauConventionsService } from '../services/mrbau-conventions.service';
import { MrbauCommonService } from '../services/mrbau-common.service';
import { MrbauDbService } from '../services/mrbau-db.service';

@Component({
  selector: 'aca-mrbau-settings',
  template: `
    <div id="main" style="margin-left:10px">
      <h2>Administration</h2>
      <div *ngIf="isUserAllowed; else elseBlock">
        <h3>Kunden/Lieferanten</h3>
        <div style="display:flex;gap:10px">
          <button mat-raised-button type="button" class="mat-flat-button mat-button-base mat-primary" color="primary" (click)="buttonNewVendor()" matTooltip="Neue Firma anlegen">Neue Firma anlegen</button>
          <button mat-raised-button type="button" class="mat-flat-button mat-button-base mat-primary" color="primary" (click)="buttonEditVendor()" matTooltip="Firma ändern">Firma ändern</button>
        </div>
        <h3>Projekte</h3>
        <div style="display:flex;gap:10px">
          <button mat-raised-button type="button" class="mat-flat-button mat-button-base mat-primary" color="primary" (click)="buttonNewProject()" matTooltip="Neues Projekt anlegen">Neues Projekt anlegen</button>
          <button mat-raised-button type="button" class="mat-flat-button mat-button-base mat-primary" color="primary" (click)="buttonEditProject()" matTooltip="Projekt ändern">Projekt ändern</button>
        </div>
        <h3>Aufgaben</h3>
        <div style="display:flex;gap:10px">
          <button mat-raised-button type="button" class="mat-flat-button mat-button-base mat-primary" color="primary" (click)="buttonExportOpenTaks()" matTooltip="Neues Projekt anlegen">Offene Aufgaben Exportieren</button>
        </div>
      </div>

      <div *ngIf="isUserAllowedMaintenance; else elseBlock">
        <h3>Zuständige MA für alle Projekte Ändern</h3>
        <div style="display:flex;gap:10px">
          <button mat-raised-button type="button" class="mat-flat-button mat-button-base mat-primary" color="primary" (click)="buttonMassReplaceUserProject()" matTooltip="Mitarbeiter ändern">Mitarbeiter ändern</button>
        </div>
        <aca-maintenance-tasks></aca-maintenance-tasks>
        <h3>Test</h3>
        <div style="display:flex;gap:10px">

          <button mat-raised-button type="button" class="mat-flat-button mat-button-base mat-primary" color="primary" (click)="replaceCompanyInfo()" matTooltip="ReplaceCompanyInfo">ReplaceCompanyInfo</button>

          <button mat-raised-button type="button" class="mat-flat-button mat-button-base mat-primary" color="primary" (click)="buttonMassReplaceSpecific()" matTooltip="Mass Replace Specific">Mass Replace Specific</button>
        </div>

      </div>
      <ng-template #elseBlock>Zugriff nicht erlaubt.</ng-template>
    </div>
  `,
  styleUrls: [],
})
export class MrbauSettingsComponent implements OnInit {
  isUserAllowed = false;
  isUserAllowedMaintenance = false;

  ngOnInit(): void {
    this.isUserAllowed = this.mrbauCommonService.isSettingsUser();
    this.isUserAllowedMaintenance = this.mrbauCommonService.isSuperUser();
  }

  constructor(
    private mrbauConventionsService: MrbauConventionsService,
    private mrbauCommonService: MrbauCommonService,
    private mrbauDbService: MrbauDbService,
    ) {
      this.mrbauDbService;
  }

  buttonNewVendor() {
    this.mrbauConventionsService.addVendor();
  }

  buttonEditVendor() {
    this.mrbauConventionsService.editVendor();
  }

  buttonNewProject() {
    this.mrbauConventionsService.addProject();
  }

  buttonEditProject() {
    this.mrbauConventionsService.editProject();
  }

  buttonMassReplaceUserProject() {
    this.mrbauConventionsService.massReplaceUserProject();
  }

  buttonExportOpenTaks() {
    this.mrbauConventionsService.exportOpenDocumentTasks();
  }

  buttonMassReplaceSpecific() {
    alert('disabled');
    /*
    const sad='daniel';
    const kls = 'strohmayer';
    const newProjects = [
      {kt:'12-210-',auditor1:kls,auditor2:kls,accountant:sad},
      {kt:'12-210-1',auditor1:kls,auditor2:kls,accountant:sad},
      {kt:'12-210-2',auditor1:kls,auditor2:kls,accountant:sad},
      {kt:'12-210-3',auditor1:kls,auditor2:kls,accountant:sad},
      {kt:'12-210-4',auditor1:kls,auditor2:kls,accountant:sad},
      {kt:'12-210-5',auditor1:kls,auditor2:kls,accountant:sad},
      {kt:'12-210-6',auditor1:kls,auditor2:kls,accountant:sad},
      {kt:'12-210-7',auditor1:kls,auditor2:kls,accountant:sad},
      {kt:'12-210-8',auditor1:kls,auditor2:kls,accountant:sad},
      {kt:'12-210-9',auditor1:kls,auditor2:kls,accountant:sad},
      {kt:'12-210-10',auditor1:kls,auditor2:kls,accountant:sad},
      {kt:'12-210-11',auditor1:kls,auditor2:kls,accountant:sad},
      {kt:'12-210-12',auditor1:kls,auditor2:kls,accountant:sad},
      {kt:'12-210-13',auditor1:kls,auditor2:kls,accountant:sad},
      {kt:'12-210-14',auditor1:kls,auditor2:kls,accountant:sad},
      {kt:'12-210-15',auditor1:kls,auditor2:kls,accountant:sad},
      {kt:'12-210-16',auditor1:kls,auditor2:kls,accountant:sad},
      {kt:'12-210-17',auditor1:kls,auditor2:kls,accountant:sad},
      {kt:'12-210-18',auditor1:kls,auditor2:kls,accountant:sad},
      {kt:'12-210-19',auditor1:kls,auditor2:kls,accountant:sad},
      {kt:'12-500-',auditor1:kls,auditor2:kls,accountant:sad},
      {kt:'12-500-1',auditor1:kls,auditor2:kls,accountant:sad},
      {kt:'12-500-2',auditor1:kls,auditor2:kls,accountant:sad},
      {kt:'12-500-3',auditor1:kls,auditor2:kls,accountant:sad},
      {kt:'12-500-4',auditor1:kls,auditor2:kls,accountant:sad},
      {kt:'12-510-',auditor1:kls,auditor2:kls,accountant:sad},
      {kt:'12-510-1',auditor1:kls,auditor2:kls,accountant:sad},
      {kt:'12-510-2',auditor1:kls,auditor2:kls,accountant:sad},
      {kt:'12-510-3',auditor1:kls,auditor2:kls,accountant:sad},
      {kt:'12-520-',auditor1:kls,auditor2:kls,accountant:sad},
      {kt:'12-520-1',auditor1:kls,auditor2:kls,accountant:sad},
      {kt:'12-520-2',auditor1:kls,auditor2:kls,accountant:sad},
      {kt:'12-520-3',auditor1:kls,auditor2:kls,accountant:sad},
      {kt:'12-521',auditor1:kls,auditor2:kls,accountant:sad},
      {kt:'22-200-',auditor1:kls,auditor2:kls,accountant:sad},
      {kt:'22-200-1',auditor1:kls,auditor2:kls,accountant:sad},
      {kt:'22-200-2',auditor1:kls,auditor2:kls,accountant:sad},
      {kt:'22-200-3',auditor1:kls,auditor2:kls,accountant:sad},
      {kt:'22-200-4',auditor1:kls,auditor2:kls,accountant:sad},
      {kt:'22-200-5',auditor1:kls,auditor2:kls,accountant:sad},
      {kt:'22-210-',auditor1:kls,auditor2:kls,accountant:sad},
      {kt:'41-200-',auditor1:kls,auditor2:kls,accountant:sad},
      {kt:'41-200-1',auditor1:kls,auditor2:kls,accountant:sad},
      {kt:'41-210-',auditor1:kls,auditor2:kls,accountant:sad},
      {kt:'41-210-1',auditor1:kls,auditor2:kls,accountant:sad},
      {kt:'41-210-2',auditor1:kls,auditor2:kls,accountant:sad},
      {kt:'41-210-3',auditor1:kls,auditor2:kls,accountant:sad},
      {kt:'41-210-4',auditor1:kls,auditor2:kls,accountant:sad},
      {kt:'41-210-5',auditor1:kls,auditor2:kls,accountant:sad},
      {kt:'41-210-6',auditor1:kls,auditor2:kls,accountant:sad},
      {kt:'41-210-7',auditor1:kls,auditor2:kls,accountant:sad},
      {kt:'41-500-',auditor1:kls,auditor2:kls,accountant:sad},
      {kt:'41-510-',auditor1:kls,auditor2:kls,accountant:sad},
      {kt:'41-520-',auditor1:kls,auditor2:kls,accountant:sad},
      {kt:'41-520-1',auditor1:kls,auditor2:kls,accountant:sad},
      {kt:'41-520-2',auditor1:kls,auditor2:kls,accountant:sad},
      {kt:'41-521',auditor1:kls,auditor2:kls,accountant:sad},
    ];

    this.mrbauDbService.getProjects().toPromise()
    .then(async (projects) => {
      let counter = 0;
      try {
        console.log(projects.length);
        for (let i = 0; i< projects.length; i++) {
          const prj = projects[i] as ICostCarrier;
          const data = newProjects.filter(item => item.kt == prj['mrba:costCarrierNumber']);
          if (data.length > 0) {
            const dataNew = data[0];
            console.log(prj);
            let val = {
              mrba_projectId : prj['mrba:projectId'],
              mrba_costCarrierNumber: prj['mrba:costCarrierNumber'],
              mrba_projectName: prj['mrba:projectName'],
              auditor1: dataNew.auditor1,
              auditor2: dataNew.auditor2,
              accountant: dataNew.accountant,
            }
            console.log(val);
            await this.mrbauDbService.updateProject(val).toPromise();
            counter++;
          }
        }
        console.log('replace count: '+counter);
      }
      catch(error) {
        console.log(error);
      }
    })
    .catch(error => console.log(error));
    */
  }

  replaceCompanyInfo() {
    alert('disabled');
    /*
    this.mrbauConventionsService.replaceCompanyInfoByName(
      [
        {key:'mrba:companyName', old:'Schilowsky Baumarkt und Baustoffe', new:'Schilowsky Baustoffhandel GmbH'},
        {key:'mrba:companyVatID', old:'ATU45606606', new:'ATU79329825'},
      ]
    );*/
  }

}
