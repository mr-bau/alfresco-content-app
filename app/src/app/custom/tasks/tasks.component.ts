import { Component, OnInit, ViewChild } from '@angular/core';
import { IMRBauTasksCategory, MRBauTask, EMRBauTaskStatus, EMRBauTaskCategory} from '../mrbau-task-declarations';
import { MrbauCommonService } from '../services/mrbau-common.service';
import { TasksTableComponent } from '../taskstable/taskstable.component';
import { NodePaging } from '@alfresco/js-api';
import { SearchService } from '@alfresco/adf-core';

export interface ITaskChangedData {
  task : MRBauTask,
  queryTasks : boolean
}

export interface IFileSelectData {
  nodeId : string,
  versionId? : string,
  suppressNotification? : boolean,
}
@Component({
  selector: 'aca-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.scss'],

})
export class TasksComponent implements OnInit {
  @ViewChild('TASKS_TABLE') tasksTableComponent : TasksTableComponent;

  fileSelectData: IFileSelectData = null;
  dragging = false;
  selectedTask: MRBauTask = null;

  taskCategories : IMRBauTasksCategory[];

  currentUser : string;
  loaderVisible : boolean;
  errorMessage :string;

  constructor(
    //private alfrescoAuthenticationService: AuthenticationService,
    private mrbauCommonService : MrbauCommonService,
    private searchService: SearchService,
  ) {
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

  performConsistencyChecks() {
    this.testUser();
  }

  async testUser() {
    const people = await this.mrbauCommonService.getPeopleObservable().toPromise()
    let searchRequest = {
      query: {
        query:"SELECT * FROM mrbt:task A JOIN mrbt:taskCoreDetails B ON A.cmis:objectId = B.cmis:objectId WHERE B.mrbt:status >= 0 AND B.mrbt:status < 8000 AND B.mrbt:status <> 211 ORDER BY B.mrbt:assignedUserName ASC",
        language: 'cmis'
      },
      include: ['properties'],
      paging : {
        skipCount: 0,
        maxItems:  99999
      }
    }
    this.searchService.searchByQueryBody(searchRequest).subscribe(
      (nodePaging : NodePaging) => {
        let errorCount = 0;
        for (let nodeEntry of nodePaging.list.entries) {
          const assignedUser = nodeEntry.entry.properties["mrbt:assignedUserName"];
          let found = false;
          for (let i=0;i<people.length; i++) {
            if (people[i].id == assignedUser) {
              //console.log(assignedUser+' found '+people[i].displayName);
              found = true;
              break;
            }
          }
          if (!found) {
            if (errorCount == 0) {
              console.log(" *** CONSISTENCY CHECK TEST USER ***");
            }
            errorCount++;
            console.log(assignedUser + ' not found ' + nodeEntry.entry.id);
            for (let i=0;i<people.length; i++) {
              if (people[i].id.toLowerCase() == assignedUser.toLowerCase()) {
                console.log('lower match found: '+people[i].id+' - '+people[i].displayName);
                break;
              }
            }
          }
        }
        if (errorCount > 0) {
          window.alert('Consistency Check testUser() failed! Found '+errorCount+' not matching users. See console log for details!');
        }
      },
      error => {
        this.errorMessage = "Error loading data. "+error;
      }
    );
  }

  initTaskCategories()
  {
    if (this.mrbauCommonService.isSuperUser())
    {
      this.performConsistencyChecks();
    }

    this.taskCategories = [
    {
      tabIcon: 'description',
      tabName: 'Dokumente',
      tabBadge: 0,
      order: 'ORDER BY B.cmis:creationDate DESC',
      searchRequest: {
        query: {
          query:`SELECT * FROM mrbt:task A JOIN mrbt:taskCoreDetails B ON A.cmis:objectId = B.cmis:objectId `+
          `WHERE B.mrbt:status >= 0 AND B.mrbt:status < ${EMRBauTaskStatus.STATUS_NOTIFY_DONE} AND B.mrbt:status <> ${EMRBauTaskStatus.STATUS_PAUSED} `+
          `AND B.mrbt:category >= ${EMRBauTaskCategory.NewDocumentStart} AND B.mrbt:category <= ${EMRBauTaskCategory.NewDocumentLast} `+
          ((this.currentUser=="admin") ? '' : `AND B.mrbt:assignedUserName = '${this.currentUser}' `),
          language: 'cmis'
        },
        include: ['properties']
      }
    },
    {
      tabIcon: 'assignment',
      tabName: 'Aufgaben',
      tabBadge: 0,
      order: 'ORDER BY B.cmis:creationDate DESC',
      searchRequest: {
        // https://docs.alfresco.com/content-services/latest/develop/rest-api-guide/searching/
        // https://api-explorer.alfresco.com/api-explorer/?urls.primaryName=Search%20API#/search/search
        // https://angelborroy.wordpress.com/2018/05/30/alfresco-counting-more-than-1000-elements/
        query: {
          // CONTAINS comparison is necessary to make the comparison case insensitive (getECMUsername does not use the user id but the entered user name from login window)
          //query:`SELECT * FROM mrbt:task A JOIN mrbt:taskCoreDetails B ON A.cmis:objectId = B.cmis:objectId WHERE B.mrbt:status >= 0 AND B.mrbt:status <= 8999 AND CONTAINS(B,'mrbt:assignedUserName:"${ecmUserName=="admin" ? "*" : ecmUserName}"') ORDER BY B.cmis:creationDate DESC`,
          query:`SELECT * FROM mrbt:task A JOIN mrbt:taskCoreDetails B ON A.cmis:objectId = B.cmis:objectId `+
          `WHERE B.mrbt:status >= 0 AND B.mrbt:status < ${EMRBauTaskStatus.STATUS_NOTIFY_DONE} `+
          `AND B.mrbt:category>= ${EMRBauTaskCategory.CommonTaskStart} AND B.mrbt:category<= ${EMRBauTaskCategory.CommonTaskLast}`+
          ((this.currentUser=="admin") ? '' : `AND B.mrbt:assignedUserName = '${this.currentUser}' `),
          language: 'cmis'
        },
        include: ['properties']
      }
    },{
      tabIcon: 'list',
      tabName: 'Benachrichtigungen',
      // InvoiceAuditStart - InvoiceAuditLast
      tabBadge: 0,
      order: 'ORDER BY B.cmis:creationDate DESC',
      searchRequest: {
        query: {
          //query: `+TYPE:"mrbt:task" and mrbt:status:[0 TO 8999] and mrbt:assignedUserName:"${ecmUserName=="admin" ? "*" : ecmUserName}"`,
          //query: `+TYPE:"mrbt:task" and mrbt:status:[9000 to 9100] and mrbt:assignedUserName:"${ecmUserName=="admin" ? "*" : ecmUserName}"`,
          //query: '(cm:name:*oemag* or cm:name:*photo*) and +TYPE:\"cm:content\"',
          //query: "+ASPECT:'foer:Foerderungsordner' and cm:name:'aws'",
          //query: 'foer:ProjektNr:*',
          //query: `+TYPE:"mrbt:task" and mrbt:assignedUserName:"${ecmUserName=="admin" ? "*" : ecmUserName}" and cm:name:"tbd ...."`,
          //language: 'afts'
          query:`SELECT * FROM mrbt:task A JOIN mrbt:taskCoreDetails B ON A.cmis:objectId = B.cmis:objectId WHERE B.mrbt:status >= ${EMRBauTaskStatus.STATUS_NOTIFY_DONE} AND B.mrbt:status < ${EMRBauTaskStatus.STATUS_FINISHED} `+ ((this.currentUser=="admin") ? '' : `AND B.mrbt:assignedUserName = '${this.currentUser}' `),
          language: 'cmis'
        },
        //sort: [{type:"FIELD", field:"cm:created",  ascending:true}],
        include: ['properties']
      }
    },{
      tabIcon: 'pause',
      tabName: 'Pausiert',
      // CommonTaskStart - CommonTaskLast
      tabBadge: 0,
      order: 'ORDER BY B.cmis:creationDate DESC',
      searchRequest: {
        query: {
          query:`SELECT * FROM mrbt:task A JOIN mrbt:taskCoreDetails B ON A.cmis:objectId = B.cmis:objectId WHERE B.mrbt:status = ${EMRBauTaskStatus.STATUS_PAUSED} `+ ((this.currentUser=="admin") ? '' : `AND B.mrbt:assignedUserName = '${this.currentUser}' `),
          language: 'cmis'
        },
        include: ['properties']
      }
    },{
      tabIcon: 'label',
      tabName: 'Abgeschlossen',
      // CommonTaskStart - CommonTaskLast
      tabBadge: 0,
      order: 'ORDER BY B.cmis:creationDate DESC',
      searchRequest: {
        query: {
          //query:`SELECT * FROM mrbt:task A JOIN mrbt:taskCoreDetails B ON A.cmis:objectId = B.cmis:objectId WHERE B.mrbt:status >= 9000 AND B.mrbt:status <= 9100 AND CONTAINS(B,'mrbt:assignedUserName:"${ecmUserName=="admin" ? "*" : ecmUserName}"') ORDER BY B.cmis:creationDate DESC`,
          query:`SELECT * FROM mrbt:task A JOIN mrbt:taskCoreDetails B ON A.cmis:objectId = B.cmis:objectId WHERE B.mrbt:status >= ${EMRBauTaskStatus.STATUS_FINISHED} `+ ((this.currentUser=="admin") ? '' : `AND B.mrbt:assignedUserName = '${this.currentUser}' `),
          language: 'cmis'
        },
        include: ['properties']
      }
    }];
  }

  dragStartEvent(){
    // workaround: hide pdf viewer during split pane resize
    this.dragging = true;
  }

  dragEndEvent(){
    // workaround: restore pdf viewer after split pane resize
    this.dragging = false;
  }

  taskSelected(task : MRBauTask) {
    this.selectedTask = task;
    this.selectedFirstAssociatedFile();
  }

  private selectedFirstAssociatedFile()
  {
    if (!this.selectedTask || this.selectedTask.associatedDocumentRef.length == 0)
    {
      this.fileSelected(null);
      return;
    }
    this.fileSelected({nodeId : this.selectedTask.associatedDocumentRef[0], suppressNotification : true})
  }

  fileSelected(fileSelectData : IFileSelectData) {
    this.fileSelectData = fileSelectData;
  }

  taskChanged(taskChangedData : ITaskChangedData)
  {
    // if new user got assigned reload tasks
    if (this.currentUser != taskChangedData.task.assignedUserName)
    {
      taskChangedData.queryTasks = true;
    }
    this.tasksTableComponent.taskUpdateEvent(taskChangedData);
  }
}
