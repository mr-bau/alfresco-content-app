import { Component, OnInit } from '@angular/core';
import { MrbauConventionsService } from '../services/mrbau-conventions.service';
import { MrbauCommonService } from '../services/mrbau-common.service';
import { MrbauDbService } from '../services/mrbau-db.service';
import { NodeBodyUpdate, ResultSetPaging, SearchRequest } from '@alfresco/js-api';

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
          <button mat-raised-button type="button" class="mat-flat-button mat-button-base mat-primary" color="primary" (click)="massReplaceAuditor2()" matTooltip="massReplaceAuditor2">massReplaceAuditor2</button>

          <button mat-raised-button type="button" class="mat-flat-button mat-button-base mat-primary" color="primary" (click)="replaceCompanyInfo()" matTooltip="ReplaceCompanyInfo">ReplaceCompanyInfo</button>

          <button mat-raised-button type="button" class="mat-flat-button mat-button-base mat-primary" color="primary" (click)="buttonMassReplaceSpecific()" matTooltip="Mass Replace Specific">Mass Replace Specific</button>

          <button mat-raised-button type="button" class="mat-flat-button mat-button-base mat-primary" color="primary" (click)="buttonFixDocumentNameByCompanyProperty()" matTooltip="Fix Document Name By Company Property">Fix Document Name By Company Property</button>

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

  private escapeName(val : string) : string {
    return val.replace(/["/]/g,'_');
  }

  async buttonFixDocumentNameByCompanyProperty() {
     let query : SearchRequest = {
      query: {
        query: 'TYPE:"cm:content"',
        language: 'afts'
      },
      paging: {
        maxItems:99,
        skipCount:0
      },
      filterQueries: [
        { query: '=SITE:belegsammlung'},
      ],
      fields: [
        // ATTENTION make sure to request all mandatory fields for Node (vs ResultNode!)
        'id',
        'name',
        'nodeType',
        'isFolder',
        'isFile',
        'modifiedAt',
        'modifiedByUser',
        'createdAt',
        'createdByUser',
      ],
      include: ['properties', 'path', 'allowableOperations'],
      sort: []
    };
    let count = 0;
    try {
      let result : ResultSetPaging = null;
      while (result == null || result.list.pagination.hasMoreItems) {
        result = await this.mrbauCommonService.queryNodes(query);
        console.log('Pagination '+result.list.pagination.skipCount+' '+result.list.pagination.count);
        for (let i=0; i< result.list.entries.length; i++) {
          const item = result.list.entries[i];
          const entry = item.entry;
          if (entry.properties && entry.properties['mrba:companyName'] && entry.name.indexOf(this.escapeName(entry.properties['mrba:companyName'])) < 0) {
            console.log(entry.id+' '+entry.name+' '+entry.properties['mrba:companyName']);
            let nodeBodyUpdate : NodeBodyUpdate = {"properties": {"mrba:companyName": entry.properties['mrba:companyName']+'_'}};
            await this.mrbauCommonService.updateNode(entry.id, nodeBodyUpdate);
            nodeBodyUpdate = {"properties": {"mrba:companyName": entry.properties['mrba:companyName']}};
            await this.mrbauCommonService.updateNode(entry.id, nodeBodyUpdate);
            count++;
            if (count > 10) {
              console.log('limit reached');
              return;
            }
          }
        }
        query.paging.skipCount += result.list.pagination.count;
      }
    }
    catch(error) {
       console.log(error);
    }
    console.log('fin');
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

  async massReplaceAuditor2() {
    alert('disabled');
    /*
    const accountant = 'Pichlkastner';
    const newProjects =
    [
        {"kt": "11-200-1"},
        {"kt": "11-200-2"},
        {"kt": "11-200-3"},
        {"kt": "11-200-4"},
        {"kt": "11-200-5"},
        {"kt": "11-200-6"},
        {"kt": "11-210-1"},
        {"kt": "11-210-2"},
        {"kt": "11-210-3"},
        {"kt": "11-210-4"},
        {"kt": "11-210-5"},
        {"kt": "11-210-6"},
        {"kt": "11-210-7"},
        {"kt": "11-210-8"},
        {"kt": "11-210-9"},
        {"kt": "11-210-10"},
        {"kt": "11-210-11"},
        {"kt": "11-210-12"},
        {"kt": "11-210-13"},
        {"kt": "11-210-14"},
        {"kt": "11-210-15"},
        {"kt": "11-210-16"},
        {"kt": "11-210-17"},
        {"kt": "11-210-18"},
        {"kt": "11-210-19"},
        {"kt": "11-210-20"},
        {"kt": "11-210-21"},
        {"kt": "11-210-22"},
        {"kt": "11-210-23"},
        {"kt": "11-210-24"},
        {"kt": "11-210-25"},
        {"kt": "11-210-26"},
        {"kt": "11-210-27"},
        {"kt": "11-210-28"},
        {"kt": "11-210-29"},
        {"kt": "11-210-30"},
        {"kt": "11-210-31"},
        {"kt": "11-210-32"},
        {"kt": "11-210-33"},
        {"kt": "11-210-34"},
        {"kt": "11-210-35"},
        {"kt": "11-210-36"},
        {"kt": "11-500-1"},
        {"kt": "11-510-1"},
        {"kt": "11-510-2"},
        {"kt": "11-510-3"},
        {"kt": "11-510-4"},
        {"kt": "11-510-5"},
        {"kt": "11-510-6"},
        {"kt": "11-510-7"},
        {"kt": "11-520-1"},
        {"kt": "11-520-2"},
        {"kt": "11-520-3"},
        {"kt": "11-520-4"},
        {"kt": "11-520-5"},
        {"kt": "11-520-6"},
        {"kt": "11-520-7"},
        {"kt": "11-520-8"},
        {"kt": "11-520-9"},
        {"kt": "11-520-10"},
        {"kt": "11-521"},
        {"kt": "11-522"},
        {"kt": "11-523"},
        {"kt": "11-524"},
        {"kt": "11-525"},
        {"kt": "12-200-1"},
        {"kt": "12-200-2"},
        {"kt": "12-200-3"},
        {"kt": "12-200-4"},
        {"kt": "12-200-5"},
        {"kt": "12-200-6"},
        {"kt": "12-200-7"},
        {"kt": "12-200-8"},
        {"kt": "12-210-1"},
        {"kt": "12-210-2"},
        {"kt": "12-210-3"},
        {"kt": "12-210-4"},
        {"kt": "12-210-5"},
        {"kt": "12-210-6"},
        {"kt": "12-210-7"},
        {"kt": "12-210-8"},
        {"kt": "12-210-9"},
        {"kt": "12-210-10"},
        {"kt": "12-210-11"},
        {"kt": "12-210-12"},
        {"kt": "12-210-13"},
        {"kt": "12-210-14"},
        {"kt": "12-210-15"},
        {"kt": "12-210-16"},
        {"kt": "12-210-17"},
        {"kt": "12-210-18"},
        {"kt": "12-210-19"},
        {"kt": "12-500-1"},
        {"kt": "12-500-2"},
        {"kt": "12-500-3"},
        {"kt": "12-500-4"},
        {"kt": "12-510-1"},
        {"kt": "12-510-2"},
        {"kt": "12-510-3"},
        {"kt": "12-520-1"},
        {"kt": "12-520-2"},
        {"kt": "12-520-3"},
        {"kt": "12-521"},
        {"kt": "21-200-1"},
        {"kt": "21-200-2"},
        {"kt": "21-200-3"},
        {"kt": "21-200-5"},
        {"kt": "21-200-6"},
        {"kt": "22-200-1"},
        {"kt": "22-200-2"},
        {"kt": "22-200-3"},
        {"kt": "22-200-4"},
        {"kt": "22-200-5"},
        {"kt": "31-200-1"},
        {"kt": "41-200-1"},
        {"kt": "41-210-1"},
        {"kt": "41-210-2"},
        {"kt": "41-210-3"},
        {"kt": "41-210-4"},
        {"kt": "41-210-5"},
        {"kt": "41-210-6"},
        {"kt": "41-210-7"},
        {"kt": "41-520-1"},
        {"kt": "41-520-2"},
        {"kt": "41-521"},
        {"kt": "71-200-1"},
        {"kt": "99-200-1"},
        {"kt": "92-200-1"},
        {"kt": "92-200-2"},
        {"kt": "95-200-1"},
        {"kt": "99-210-1"}
    ];

    try {
      const projects = await this.mrbauDbService.getProjects().toPromise();
      let counter = 0;
      for (let i = 0; i< projects.length; i++) {
        const prj = projects[i] as ICostCarrier;
        const data = newProjects.filter(item => item.kt == prj['mrba:costCarrierNumber']);
        if (data.length > 0 && prj.accountant != accountant) {
          console.log(prj);
          let val = {
            mrba_projectId : prj['mrba:projectId'],
            mrba_costCarrierNumber: prj['mrba:costCarrierNumber'],
            mrba_projectName: prj['mrba:projectName'],
            auditor1: prj['auditor1'],
            auditor2: prj['auditor2'],
            accountant: accountant,
          }
          console.log(val);
          await this.mrbauDbService.updateProject(val).toPromise();
          counter++;
        }
      }
      console.log('replace count: '+counter);
    } catch (error ) {
      console.log(error);
    }*/
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
