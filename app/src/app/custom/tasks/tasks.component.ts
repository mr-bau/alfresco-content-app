import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { IMRBauTasksCategory, MRBauTask, EMRBauTaskStatus} from '../mrbau-task-declarations';
import { MrbauCommonService } from '../services/mrbau-common.service';
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
  selectedTask: MRBauTask = null;

  modifiedTask :MRBauTask = null;
  taskCategories : IMRBauTasksCategory[];

  currentUser : string;
  loaderVisible : boolean;
  errorMessage :string;

  constructor(
    private sanitizer: DomSanitizer,
    //private alfrescoAuthenticationService: AuthenticationService,
    private mrbauCommonService : MrbauCommonService) {

    //let ecmUserName = this.alfrescoAuthenticationService.getEcmUsername();
    //console.log(ecmUserName);
  }

  ngOnInit(): void {
    this.queryData();
  }

  queryData() {
    this.loaderVisible = true;
    this.errorMessage = null;
    this.mrbauCommonService.getCurrentUser().then(user => {
      this.currentUser = user.entry.id;
      this.initTaskCategories();
      this.loaderVisible = false;
    }).catch(error => {
      this.loaderVisible = false;
      this.errorMessage = "Error loading data. "+error;
    });
  }

  initTaskCategories()
  {
    this.taskCategories = [{
      tabIcon: 'description',
      tabName: 'Aufgaben',
      tabBadge: 0,
      searchRequest: {
        // https://docs.alfresco.com/content-services/latest/develop/rest-api-guide/searching/
        // https://api-explorer.alfresco.com/api-explorer/?urls.primaryName=Search%20API#/search/search
        // https://angelborroy.wordpress.com/2018/05/30/alfresco-counting-more-than-1000-elements/
        query: {
          // CONTAINS comparison is necessary to make the comparison case insensitive (getECMUsername does not use the user id but the entered user name from login window)
          //query:`SELECT * FROM mrbt:task A JOIN mrbt:taskCoreDetails B ON A.cmis:objectId = B.cmis:objectId WHERE B.mrbt:status >= 0 AND B.mrbt:status <= 8999 AND CONTAINS(B,'mrbt:assignedUserName:"${ecmUserName=="admin" ? "*" : ecmUserName}"') ORDER BY B.cmis:creationDate DESC`,
          query:`SELECT * FROM mrbt:task A JOIN mrbt:taskCoreDetails B ON A.cmis:objectId = B.cmis:objectId WHERE B.mrbt:status >= 0 AND B.mrbt:status < ${EMRBauTaskStatus.STATUS_NOTIFY_DONE} `+ ((this.currentUser=="admin") ? '' : `AND B.mrbt:assignedUserName = '${this.currentUser}' `) + 'ORDER BY B.cmis:creationDate DESC',
          language: 'cmis'
        },
        include: ['properties']
      }
    },{
      tabIcon: 'list',
      tabName: 'Benachrichtigungen',
      // InvoiceAuditStart - InvoiceAuditLast
      tabBadge: 0,
      searchRequest: {
        query: {
          //query: `+TYPE:"mrbt:task" and mrbt:status:[0 TO 8999] and mrbt:assignedUserName:"${ecmUserName=="admin" ? "*" : ecmUserName}"`,
          //query: `+TYPE:"mrbt:task" and mrbt:status:[9000 to 9100] and mrbt:assignedUserName:"${ecmUserName=="admin" ? "*" : ecmUserName}"`,
          //query: '(cm:name:*oemag* or cm:name:*photo*) and +TYPE:\"cm:content\"',
          //query: "+ASPECT:'foer:Foerderungsordner' and cm:name:'aws'",
          //query: 'foer:ProjektNr:*',
          //query: `+TYPE:"mrbt:task" and mrbt:assignedUserName:"${ecmUserName=="admin" ? "*" : ecmUserName}" and cm:name:"tbd xxxx"`,
          //language: 'afts'
          query:`SELECT * FROM mrbt:task A JOIN mrbt:taskCoreDetails B ON A.cmis:objectId = B.cmis:objectId WHERE B.mrbt:status >= ${EMRBauTaskStatus.STATUS_NOTIFY_DONE} AND B.mrbt:status < ${EMRBauTaskStatus.STATUS_FINISHED} `+ ((this.currentUser=="admin") ? '' : `AND B.mrbt:assignedUserName = '${this.currentUser}' `) + 'ORDER BY B.cmis:creationDate DESC',
          language: 'cmis'
        },
        //sort: [{type:"FIELD", field:"cm:created",  ascending:true}],
        include: ['properties']
      }
    },{
      tabIcon: 'label',
      tabName: 'Abgeschlossen',
      // CommonTaskStart - CommonTaskLast
      tabBadge: 0,
      searchRequest: {
        query: {
          //query:`SELECT * FROM mrbt:task A JOIN mrbt:taskCoreDetails B ON A.cmis:objectId = B.cmis:objectId WHERE B.mrbt:status >= 9000 AND B.mrbt:status <= 9100 AND CONTAINS(B,'mrbt:assignedUserName:"${ecmUserName=="admin" ? "*" : ecmUserName}"') ORDER BY B.cmis:creationDate DESC`,
          query:`SELECT * FROM mrbt:task A JOIN mrbt:taskCoreDetails B ON A.cmis:objectId = B.cmis:objectId WHERE B.mrbt:status >= ${EMRBauTaskStatus.STATUS_FINISHED} `+ ((this.currentUser=="admin") ? '' : `AND B.mrbt:assignedUserName = '${this.currentUser}' `) + 'ORDER BY B.cmis:creationDate DESC',
          language: 'cmis'
        },
        include: ['properties']
      }
    }];
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

  taskSelected(task : MRBauTask) {
    this.selectedTask = task;
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

  taskChanged(task : MRBauTask)
  {
    this.modifiedTask = JSON.parse(JSON.stringify(task));
  }

  sanitizeUrl(url:string) : SafeResourceUrl {
      return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}
