import { AuthenticationService } from '@alfresco/adf-core';
import { Component, OnInit   } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { IMRBauTasksCategory} from '../mrbau-task-declarations';
//import { MRBauTask } from '../mrbau-task-declarations';
@Component({
  selector: 'aca-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.scss'],

})
export class TasksComponent implements OnInit {
  static readonly MAX_ITEMS : number = 5;
  SHOW_TOOLBAR : string = "#toolbar=1";
  document_url: SafeResourceUrl = null;
  private _remember_document_url : SafeResourceUrl = null;
  selectedRowId: string = null;

  taskCategories : IMRBauTasksCategory[];

  constructor(private sanitizer: DomSanitizer, private alfrescoAuthenticationService: AuthenticationService) {
    let ecmUserName = this.alfrescoAuthenticationService.getEcmUsername();
    this.taskCategories = [{
      tabIcon: 'description',
      tabName: 'Tasks',
      tabBadge: 0,
      searchRequest: {
        // https://docs.alfresco.com/content-services/latest/develop/rest-api-guide/searching/
        // https://api-explorer.alfresco.com/api-explorer/?urls.primaryName=Search%20API#/search/search
        // https://angelborroy.wordpress.com/2018/05/30/alfresco-counting-more-than-1000-elements/
        query: {
          query: `+TYPE:"mrbt:task" and mrbt:assignedUser:"${ecmUserName=="admin" ? "*" : ecmUserName}"`,
          language: 'afts'
        },
        sort: [{type:"FIELD", field:"cm:created",  ascending:true}],
        include: ['properties']
      }
    },{
      tabIcon: 'list',
      tabName: 'Belegprüfung',
      // InvoiceAuditStart - InvoiceAuditLast
      tabBadge: 0,
      searchRequest: {
        query: {
          //query: '(cm:name:*oemag* or cm:name:*photo*) and +TYPE:\"cm:content\"',
          //query: "+ASPECT:'foer:Foerderungsordner' and cm:name:'aws'",
          //query: 'foer:ProjektNr:*',
          query: `+TYPE:"mrbt:task" and mrbt:assignedUser:"${ecmUserName=="admin" ? "*" : ecmUserName}" and cm:name:"tbd xxxx"`,
          language: 'afts'
        }
      }
    },{
      tabIcon: 'label',
      tabName: 'Allgemein',
      // CommonTaskStart - CommonTaskLast
      tabBadge: 0,
      searchRequest: {
        query: {
          query: `+TYPE:"mrbt:task" and mrbt:assignedUser:"${ecmUserName=="admin" ? "*" : ecmUserName}" and cm:name:"tbd yyyy"`,
          language: 'afts'
        },
        sort: [{type:"FIELD", field:"cm:name",  ascending:true}]
      }
    }];
  }

  ngOnInit(): void {
  }

  dragStartEvent(){
    // workaround: hide pdf viewer during split pane resize
    this._remember_document_url = this.document_url;
    this.document_url = null;
  }

  dragEndEvent(){
    // workaround: restore pdf viewer after split pane resize
    this.document_url = this._remember_document_url;
    this._remember_document_url = null;
  }

  taskSelected(row : string) {
    this.selectedRowId = row;
  }

  fileSelected(fileUrl : string)
  {
    if (fileUrl == null)
    {
      this.document_url = null;
      return;
    }
    this.document_url = this.sanitizeUrl(fileUrl.concat(this.SHOW_TOOLBAR));
  }

  sanitizeUrl(url:string) : SafeResourceUrl {
      return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}
