
import { ContentService, NotificationService } from '@alfresco/adf-core';
import { Component, Input } from '@angular/core';
import { MRBauTask } from '../mrbau-task-declarations';
import { MrbauCommonService } from '../services/mrbau-common.service';
//import { NodesApiService } from '@alfresco/adf-core';
//import { NodeBodyUpdate, SearchRequest } from '@alfresco/js-api';
//import { IMrbauDbService_mrba_project, IMrbauDbService_mrba_vendor } from '../services/mrbau-db.service';
import { MrbauDbService } from '../services/mrbau-db.service';
import { ICostCarrier } from '../services/mrbau-conventions.service';


@Component({
  selector: 'aca-maintenance-tasks',
  template: `
    <h3>Maintenance</h3>
    <div style="display:flex;gap:10px">
      <button mat-raised-button type="button" class="mat-flat-button mat-button-base mat-primary" color="primary" (click)="buttonTest()" matTooltip="Log Projects ohne Oberbauleiter">Log Projects w/o auditor2</button>
    </div>
  `,
})
export class MrbauMaintenanceComponent {
  @Input() task: MRBauTask;
  DRYRUN = true;

  constructor(
    private contentService: ContentService,
    private notificationService:NotificationService,
    private mrbauCommonService: MrbauCommonService,
    private mrbauDbService: MrbauDbService,
    //private nodesApiService: NodesApiService
    ) {

    }

  isDisabled() : boolean {
    return true || !this.mrbauCommonService.isAdminUser();
  }

  buttonTest() {
    this.contentService;
    this.notificationService;
    this.doMaintainanceTask();
  }

  doMaintainanceTask() {
    //console.error('Nothing to do!');
    this.logProjects();
  }

  logProjects(){
    this.mrbauDbService.searchProjects("%_%", 999).toPromise()
    .then((res) => {
      const result = res as ICostCarrier[];
      for (let i=1; i < result.length; i++)
      {
        const entry = result[i];
        if (!entry.auditor2)
        {
          console.log(entry['mrba:costCarrierNumber']+';'+entry['mrba:projectName']+';');
        }
      }
    })
    .catch(error => console.log(error));
  }
}

/*
  existingCompanies = {};
  existingProjects = {};

  // create company Id in mysql
  async createVendorId(value:any, id:string) {
    if (this.existingCompanies[id])
    {
      console.log('exists '+id);
      return;
    }
    else
    {
      console.log('creating '+id);
      const newCompany : IMrbauDbService_mrba_vendor= {
        mrba_companyName: value['mrba:companyName'],
        mrba_companyCity: value['mrba:companyCity'],
        mrba_companyStreet: value['mrba:companyStreet'],
        mrba_companyZipCode: value['mrba:companyZipCode'],
        mrba_companyEmail: value['mrba:companyEmail'],
        mrba_companyVatID: value['mrba:companyVatID'],
        mrba_companyPhone: value['mrba:companyPhone'],
      };
      let result = await this.mrbauDbService.addVendor(newCompany).toPromise();
      if (result.result !== 'OK' || !result.data.insertId)
      {
        console.error("Add Company Error. Aborting Maintenance Task.");
        console.log(result);
        return;
      }
      // create company entry
      const mysqlId = result.data.insertId;
      console.log('done ' + mysqlId);
      this.existingCompanies[id] =
      {
        'mysqlId': mysqlId,
        'mrba:companyId': id,
        'company' : newCompany
      }
    }
  }

  // create company Id in mysql
  async createProjectId(value:any, id:string) {
    value;
    if (this.existingProjects[id])
    {
      console.log('exists '+id);
      return;
    }
    else
    {
      let project = await this.mrbauDbService.getProject(id).toPromise();
      if (project) {
        console.log('exists in db '+id);
        this.existingProjects[id] = {exist : true}
        return;
      }
      console.log('creating '+id);
      const newProject : IMrbauDbService_mrba_project = {
        mrba_costCarrierNumber : value['mrba:costCarrierNumber'],
        mrba_projectName : value['mrba:projectName'],
        auditor1 : '',
        auditor2 : '',
        accountant : '',
      };
      let result = await this.mrbauDbService.addProject(newProject).toPromise();
      if (result.result !== 'OK' || !result.data.insertId)
      {
        console.error("Add Project Error. Aborting Maintenance Task.");
        console.log(result);
        return;
      }
      // create company entry
      const mysqlId = result.data.insertId;
      console.log('done ' + mysqlId);
      this.existingProjects[id] = {exist : true}
    }
  }

  doMaintainanceTaskMigrateExistingVendorAndProjectIdsToMysql() {
    this.existingCompanies = {};
    let query : SearchRequest = {
      query: {
        query: '*',
        language: 'afts'
      },
      paging: {
        maxItems: 999,
        skipCount: 0
      },
      filterQueries: [
        { query: `=TYPE:"mrba:archiveDocument"`},
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
      include: ['properties', 'path', 'allowableOperations']
    };

    this.mrbauCommonService.queryNodes(query)
    .then(async (result) => {
      if (result.list.pagination.hasMoreItems == true)
      {
        console.error("Has more items is true, but pagination not implemented. Aborting Maintenance Task.");
        return;
      }
      for (let i=0; i<result.list.entries.length; i++) {

        const data = result.list.entries[i];
        const value=data.entry.properties;

        const vendorId = value['mrba:companyId'];
        if (vendorId) {
          // create mysql entry
          await this.createVendorId(value, vendorId);
          // get cached company entry
          const company = this.existingCompanies[vendorId];
          if (!company)
          {
            console.error("Company not found. Aborting Maintenance Task.");
            return;
          }
          // update document
          console.log('updating old '+company['mrba:companyId']+' -> new ' +company.mysqlId);

          if (!this.DRYRUN) {
            const nodeBody : NodeBodyUpdate = { properties: {'mrba:companyId': company.mysqlId} };
            let result = await this.nodesApiService.nodesApi.updateNode(data.entry.id, nodeBody, {});
            console.log(result);
          }
        }

        const costCarrierId = value['mrba:costCarrierNumber'];
        if (costCarrierId) {
          // create mysql entry
          await this.createProjectId(value, costCarrierId);
          // get cached project entry
          const project = this.existingProjects[costCarrierId];
          if (!project)
          {
            console.error("Project not found. Aborting Maintenance Task.");
            return;
          }
        }
      };
    })
    .catch((error) => {
      console.log(error);
    });
  }
}
*/
