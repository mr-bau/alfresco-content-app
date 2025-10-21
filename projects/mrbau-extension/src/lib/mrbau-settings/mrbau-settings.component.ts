import { Component, OnInit } from '@angular/core';
import { ICostCarrier, MrbauConventionsService } from '../services/mrbau-conventions.service';
import { MrbauCommonService } from '../services/mrbau-common.service';
import { IMrbauDbService_mrba_project, MrbauDbService } from '../services/mrbau-db.service';
import { NodeBodyUpdate, ResultSetPaging, SearchRequest } from '@alfresco/js-api';
import { EMRBauTaskCategory, EMRBauTaskStatus, MRBauTask } from '../declaration/mrbau-task-declarations';
import { SearchService } from '@alfresco/adf-content-services';
import { CONST } from '../declaration/mrbau-global-declarations';
import { MrbauArchiveModelService } from '../services/mrbau-archive-model.service';
import { CommonModule } from '@angular/common';
import { ShowNavbarOverlayComponent } from '@mrbau/mrbau-common';
import { MrbauMaintenanceComponent } from './mrbau-maintenance.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  standalone: true,
  imports: [CommonModule,
    ShowNavbarOverlayComponent,
    MrbauMaintenanceComponent,
    MatButtonModule, MatIconModule,
  ],
  selector: 'mrbau-settings',
  template: `

    <div id="main">
      <h1><mrbau-shownavbaroverlay/>Administration</h1>
      <div *ngIf="isUserAllowed; else elseBlock">
        <h2>Kunden/Lieferanten</h2>
        <div style="display:flex;gap:10px">
          <button mat-raised-button type="button" class="mat-flat-button mat-button-base mat-primary" color="primary" (click)="buttonNewVendor()" matTooltip="Neue Firma anlegen">Neue Firma anlegen</button>
          <button mat-raised-button type="button" class="mat-flat-button mat-button-base mat-primary" color="primary" (click)="buttonEditVendor()" matTooltip="Firma ändern">Firma ändern</button>
        </div>
        <h2>Projekte</h2>
        <div style="display:flex;gap:10px">
          <button mat-raised-button type="button" class="mat-flat-button mat-button-base mat-primary" color="primary" (click)="buttonNewProject()" matTooltip="Neues Projekt anlegen">Neues Projekt anlegen</button>
          <button mat-raised-button type="button" class="mat-flat-button mat-button-base mat-primary" color="primary" (click)="buttonEditProject()" matTooltip="Projekt ändern">Projekt ändern</button>
        </div>
        <h2>Aufgaben</h2>
        <div style="display:flex;gap:10px">
          <button mat-raised-button type="button" class="mat-flat-button mat-button-base mat-primary" color="primary" (click)="buttonExportOpenTaks()" matTooltip="Neues Projekt anlegen">Offene Aufgaben Exportieren</button>
        </div>
      </div>

      <div *ngIf="isUserAllowedMaintenance; else elseBlock">
        <h2>Zuständige Mitarbeiter Ändern</h2>
        <div style="display:flex;gap:10px">
          <button mat-raised-button type="button" class="mat-flat-button mat-button-base mat-primary" color="primary" (click)="buttonMassReplaceUserProject()" matTooltip="Mitarbeiter für alle Projekte ändern">Für Projekte ändern</button>
          <button mat-raised-button type="button" class="mat-flat-button mat-button-base mat-primary" color="primary" (click)="buttonMassReplaceUserTasks()" matTooltip="Mitarbeiter für alle Aufgaben ändern (requires Admin)">Für Aufgaben ändern (ADMIN)</button>
        </div>
        <mrbau-maintenance-tasks/>
        <h2>Test</h2>
        <div style="display:flex;gap:10px">
          <button mat-raised-button type="button" class="mat-flat-button mat-button-base mat-primary" color="primary" (click)="massReplaceAuditor()" matTooltip="massReplaceAuditor">massReplaceAuditor</button>

          <button mat-raised-button type="button" class="mat-flat-button mat-button-base mat-primary" color="primary" (click)="replaceCompanyInfo()" matTooltip="ReplaceCompanyInfo">ReplaceCompanyInfo</button>

          <button mat-raised-button type="button" class="mat-flat-button mat-button-base mat-primary" color="primary" (click)="buttonMassReplaceSpecific()" matTooltip="Mass Replace Specific">Mass Replace Specific</button>

          <button mat-raised-button type="button" class="mat-flat-button mat-button-base mat-primary" color="primary" (click)="buttonFixDocumentNameByCompanyProperty()" matTooltip="Fix Document Name By Company Property">Fix Document Name By Company Property</button>

          <button mat-raised-button type="button" class="mat-flat-button mat-button-base mat-primary" color="primary" (click)="patchTaskCategories()" matTooltip="Patch Task Categories">Patch Task Categories</button>
<!--
          <button mat-raised-button type="button" class="mat-flat-button mat-button-base mat-primary" color="primary" (click)="buttonMovePausedDocuments()" matTooltip="Move Paused Documents">Move Paused Documents</button>
-->
        </div>

      </div>
      <ng-template #elseBlock>Zugriff nicht erlaubt.</ng-template>
    </div>
  `,
  styleUrls: ['./mrbau-settings.component.scss'],
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
    private mrbauArchiveModelService: MrbauArchiveModelService,
    private mrbauCommonService: MrbauCommonService,
    private mrbauDbService: MrbauDbService,
    private searchService: SearchService,
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

  buttonMassReplaceUserTasks() {
    this.mrbauConventionsService.massReplaceUserTask();
  }

  buttonExportOpenTaks() {
    this.mrbauConventionsService.exportOpenDocumentTasks();
  }

  private escapeName(val : string) : string {
    return val.replace(/["/]/g,'_');
  }

  async patchTaskCategories() {
    EMRBauTaskStatus.STATUS_NOTIFY_DONE;
    const searchRequest = {
      query: {
        query:`SELECT * FROM mrbt:task A JOIN mrbt:taskCoreDetails B ON A.cmis:objectId = B.cmis:objectId `+
        `WHERE B.mrbt:status >= 0 `+//AND B.mrbt:status < ${EMRBauTaskStatus.STATUS_NOTIFY_DONE} `+
        `AND B.mrbt:category = ${EMRBauTaskCategory.NewDocumentValidateAndArchive} `,
        //`AND B.mrbt:category = ${EMRBauTaskCategory.NewDocumentValidateORDER} `,
        language: 'cmis'
      },
      include: ['properties'],
      paging : {
        skipCount: 0,
        maxItems:  1000,
      }
    };

    this.searchService.searchByQueryBody(searchRequest).subscribe(
      async (nodePaging) => {
        if (nodePaging?.list?.entries) {
          const length = nodePaging.list.entries.length;
          console.log(length);
          for (var nodeEntry of nodePaging.list.entries) {
            let task = new MRBauTask();
            task.updateWithNodeData(nodeEntry.entry);
            console.log(task);
            const docNodeEntry = await this.mrbauCommonService.getNode(task.associatedDocumentRef[0], {include: CONST.GET_NODE_DEFAULT_INCLUDE}).toPromise();
            const taskNode = docNodeEntry?.entry;
            if (taskNode) {
              if (task.category == EMRBauTaskCategory.NewDocumentValidateAndArchive) {
                const documentCategory  = this.mrbauArchiveModelService.mrbauArchiveModel.getDocumentCategoryFromName(taskNode.nodeType);
                if (documentCategory == null) {
                  console.log("ERROR Document Category not found!", docNodeEntry);
                  return;
                }
                const taskCategory = MRBauTask.getCategoryForArchiveDocument(documentCategory);
                let nodeBodyUpdate : NodeBodyUpdate = {"properties": {"mrbt:category": ''+taskCategory}};
                console.log(taskNode.nodeType, documentCategory, taskCategory, nodeBodyUpdate);
                const result = await this.mrbauCommonService.updateNode(nodeEntry.entry.id, nodeBodyUpdate);
                console.log(result);
              }
            }
          }
          console.log('finished');
          if (length > 0) {
            this.patchTaskCategories();
          }
        }
      },
      error => {
        console.log(error);
      }
    );
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
      let result : ResultSetPaging | undefined;
      while (result == undefined || result?.list?.pagination?.hasMoreItems) {
        result = await this.mrbauCommonService.queryNodes(query);
        console.log('Pagination '+result?.list?.pagination?.skipCount+' '+result?.list?.pagination?.count);
        if (result?.list?.entries) {
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
        }
        if (query.paging?.skipCount && result?.list?.pagination?.count) {
          query.paging.skipCount+= result.list.pagination.count;
        }
      }
    }
    catch(error) {
       console.log(error);
    }
    console.log('fin');
  }

  async buttonMovePausedDocuments() {
    let oldUser = 'Koestenbaumer';
    let newUser = 'koberer';
    let query : SearchRequest = {
      query: {
        query:`SELECT * FROM mrbt:task A JOIN mrbt:taskCoreDetails B ON A.cmis:objectId = B.cmis:objectId WHERE B.mrbt:status = ${EMRBauTaskStatus.STATUS_PAUSED} AND B.mrbt:assignedUserName = '${oldUser}' `,
        language: 'cmis'
      },
      include: ['properties', 'path', 'allowableOperations']
    };
    let count = 0;
    try {
      let result = await this.mrbauCommonService.queryNodes(query);
      if (result?.list?.entries) {
        for (let i=0; i< result.list.entries.length; i++) {
          const item = result.list.entries[i];
          const entry = item.entry;
          console.log(entry);
          await this.mrbauCommonService.updateTaskAssignNewUser(entry.id, newUser)
          count++;
        }
        console.log(count);
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

  massReplaceAuditorProjects =
  [
    { "kt": "99-210-" },
    { "kt": "99-210-1" }
  ]
  ;

  async massReplaceAuditor(){
    await this.massReplacePerson('accountant','Daniel', false);
  }

  async massReplacePerson(keyName:string, newName:string, testrun:boolean) {
    //let dummy : ICostCarrier;
    alert("disabled"); if (42>0) return;
    try {
      const projects = await this.mrbauDbService.getProjects().toPromise();
      let counter = 0;
      if (projects) {
        for (let i = 0; i< projects.length; i++) {
          const prj = projects[i] as ICostCarrier;
          const data = this.massReplaceAuditorProjects.filter(item => item.kt == prj['mrba:costCarrierNumber']);
          if (data.length > 0 && prj[keyName as keyof ICostCarrier] != newName) {
            console.log(prj);
            let val : IMrbauDbService_mrba_project = {
              mrba_projectId : +prj['mrba:projectId' as keyof ICostCarrier],
              mrba_costCarrierNumber: prj['mrba:costCarrierNumber'],
              mrba_projectName: prj['mrba:projectName'],
              auditor1: prj.auditor1,
              auditor2: prj.auditor2,
              accountant: prj.accountant,
            }
            val[keyName as keyof IMrbauDbService_mrba_project] = newName as never;
            //console.log(val);
            if (testrun === false) {
              await this.mrbauDbService.updateProject(val).toPromise();
            }
            counter++;
          }
        }
      }
      console.log('Update '+keyName+' to '+newName);
      console.log('replace count: '+counter);
    } catch (error ) {
      console.log(error);
    }
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
