import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ContentApiService } from '@alfresco/aca-shared';
import { UserInfo, VersionPaging } from '@alfresco/js-api';
import { EMRBauTaskStatus } from '../mrbau-task-declarations';
import { IFileSelectData } from '../tasks/tasks.component';

interface VersionDataTask {
  id? : string;
  modifiedAt? : Date;
  modifiedBy? : UserInfo;
  assignedUser? : string;
  description? : string;
  status? : EMRBauTaskStatus;
  associatedDocumentRef? : string[];
  associatedDocumentName?: string[];
}

interface VersionDataDoc {
  id? : string;
  name? : string;
  comment? : string;
  modifiedAt? : Date;
  modifiedBy? : UserInfo;
}

interface HtmlDataTask {
  id? : string;
  modifiedAt? : Date;
  modifiedBy? : UserInfo;
  assignedUser? : string;
  description? : string;
  status? : EMRBauTaskStatus;
  addedDocName? : string[];
  addedDocRef? : string[];
  removedDocName?: string[];
  removedDocRef?: string[];
}

interface HtmlDataDoc {
  id? : string;
  name? : string;
  comment? : string;
  modifiedAt? : Date;
  modifiedBy? : UserInfo;
}

@Component({
  selector: 'aca-task-versionlist-invoice-workflow',
  template: `
    <div *ngIf="errorMessage; then thenBlock else elseBlock"></div>
    <ng-template #thenBlock>
      {{errorMessage}}
    </ng-template>
    <ng-template #elseBlock>
    <mat-tab-group class="version-history-tabgroup">
      <mat-tab label="Dokument">
        <ul>
          <li *ngFor="let v of htmlDataDoc; index as i; first as isFirst">
            <b>Version {{v.id}}</b> von <i>{{v.modifiedBy.displayName}}, {{v.modifiedAt | date:'medium'}}</i>
            <ul>
              <li *ngIf="v.comment">Kommentar: {{v.comment}}</li>
              <li><a href="javascript: void(0);" (click)="onAssociationClicked(nodeId, v.id)" matTooltip="Dokument Anzeigen">{{v.name}}</a></li>
            </ul>
          </li>
        </ul>
      </mat-tab>
      <mat-tab label="Aufgabe">
        <ul>
          <li *ngFor="let v of htmlDataTask; index as i; first as isFirst">
            <b>Version {{v.id}}</b> von <i>{{v.modifiedBy.displayName}}, {{v.modifiedAt | date:'medium'}}</i>
            <ul class="associationList">
              <li *ngIf="v.status !== undefined">Status: <i>{{v.status | mrbauTaskStatus}}</i></li>
              <li *ngIf="v.assignedUser">Zugewiesen an: <i>{{v.assignedUser}}</i></li>
              <li *ngIf="v.description">Beschreibung: <i>{{v.description}}</i></li>
              <li *ngFor="let a of v.removedDocName; index as i; first as isFirst">
                Dokument entfernt: <a href="javascript: void(0);" (click)="onAssociationClicked(v.removedDocRef[i])" matTooltip="Dokument Anzeigen">{{a}}</a>
              </li>
              <li *ngFor="let a of v.addedDocName; index as i; first as isFirst">
                Dokument hinzugefügt: <a href="javascript: void(0);" (click)="onAssociationClicked(v.addedDocRef[i])" matTooltip="Dokument Anzeigen">{{a}}</a>
              </li>
            </ul>
          </li>
        </ul>
      </mat-tab>
    </mat-tab-group>
    </ng-template>
    `,
  styles: []
})
export class TaskVersionlistInvoiceWorkflowComponent implements OnInit {
  @Input()
  set taskId(val: string) {
    this._taskId = val;
    this.queryData();
  }
  @Input()
  set nodeId(val: string) {
    this._nodeId = val;
    this.queryData();
  }
  get nodeId()
  {
    return this._nodeId;
  }
  @Input()
  set isVisible(val: boolean)
  {
    this._isVisible = val;
    this.queryData();
  }
  @Output() onAssociation = new EventEmitter<IFileSelectData>();

  private _isVisible : boolean = false;
  private _nodeId : string = null;
  private _taskId : string = null;

  errorMessage :string = null;
  versionDataTask : VersionDataTask[] = [];
  versionDataDoc : VersionDataDoc[] = [];
  htmlDataTask : HtmlDataTask[] = [];
  htmlDataDoc : HtmlDataDoc[] = [];

  viewerNodeId : string;
  viewerShowViewer : boolean = false;

  constructor(private _contentApiService: ContentApiService,
    //protected store: Store<AppStore>,
    ) { }

  ngOnInit(): void {
  }

  onAssociationClicked(id : string, versionId? : string )
  {
    const data : IFileSelectData = (versionId) ? {nodeId : id, versionId : versionId} : {nodeId : id};
    this.onAssociation.emit(data);
    //this.store.dispatch(new ViewNodeAction(id, {path : 'ext/mrbau/tasks'}));
  }

  createHtmlDataTask() {
    this.htmlDataTask = [];
    let v : VersionDataTask = {
      associatedDocumentName : [],
      assignedUser: null,
      status: null,
      description: null,
    };
    for (let i=0; i<this.versionDataTask.length; i++)
    {
      let v_pre = v;
      v = this.versionDataTask[i];
      // check for added / removed files
      let addedDocName: string[] = [];
      let addedDocRef: string[] = [];
      let removedDocName: string[] = [];
      let removedDocRef: string[] = [];
      for (let i=0; i< v.associatedDocumentName.length; i++)
      {
        const doc = v.associatedDocumentName[i];
        if (v_pre.associatedDocumentName.indexOf(doc) < 0)
        {
          addedDocName.push(doc);
          addedDocRef.push(v.associatedDocumentRef[i]);
        }
      }
      for (let i=0; i< v_pre.associatedDocumentName.length; i++)
      {
        const doc = v_pre.associatedDocumentName[i];
        if (v.associatedDocumentName.indexOf(doc) < 0)
        {
          removedDocName.push(doc);
          removedDocRef.push(v_pre.associatedDocumentRef[i]);
        }
      }
      // create data
      let e : HtmlDataTask = {
        id : v.id,
        modifiedAt : v.modifiedAt,
        modifiedBy : v.modifiedBy,
        addedDocName : addedDocName,
        addedDocRef : addedDocRef,
        removedDocName : removedDocName,
        removedDocRef : removedDocRef,
      };
      if (v.assignedUser != v_pre.assignedUser)
      {
        e.assignedUser = v.assignedUser;
      }
      if (v.status != v_pre.status) {
        e.status = v.status;
      }
      if (v.description != v_pre.description) {
        e.description = v.description;
      }
      // append data
      this.htmlDataTask.push(e);
    }
  }

  createHtmlDataDoc() {
    this.htmlDataDoc = [];
    let v : VersionDataDoc = {
    };
    for (let i=0; i<this.versionDataDoc.length; i++)
    {
      v = this.versionDataDoc[i];
      // create data
      let e : HtmlDataDoc = {
        id : v.id,
        name : v.name,
        comment: v.comment,
        modifiedAt : v.modifiedAt,
        modifiedBy : v.modifiedBy,
      };
      // append data
      this.htmlDataDoc.push(e);
    }
  }

  queryData() {
    let queryId = this._taskId;
    this.errorMessage="loading...";
    this.versionDataTask = [];
    if (queryId == null || this._isVisible == false)
    {
      return;
    }
    this._contentApiService.getNodeVersions(queryId, {maxItems: 999, skipCount: 0, include:['properties'] }).subscribe(
      (list : VersionPaging) => {
        for (let i=list.list.entries.length-1; i>=0; i--)
        {
          const a = list.list.entries[i];
          this.versionDataTask.push(
            {id:a.entry.id,
            modifiedAt: a.entry.modifiedAt,
            modifiedBy: a.entry.modifiedByUser,
            assignedUser: a.entry.properties["mrbt:assignedUserName"],
            status: a.entry.properties["mrbt:status"],
            description: a.entry.properties["mrbt:description"],
            associatedDocumentRef: a.entry.properties['mrbt:associatedDocumentRef'] ? a.entry.properties['mrbt:associatedDocumentRef'] : [],
            associatedDocumentName: a.entry.properties['mrbt:associatedDocumentName'] ? a.entry.properties['mrbt:associatedDocumentName'] : [],
            });
        }
        this.createHtmlDataTask();
        this.versionDataTask = [];
        this.queryDataDocument();
      }),
      (error) => {
        this.errorMessage = error;
      };
  }

  queryDataDocument()
  {
    const queryId = this._nodeId;
    this.versionDataDoc = [];
    if (queryId == null || this._isVisible == false)
    {
      return;
    }
    this._contentApiService.getNodeVersions(queryId, {maxItems: 999, skipCount: 0, include:['properties'] }).subscribe(
      (list : VersionPaging) => {
        for (let i=list.list.entries.length-1; i>=0; i--)
        {
          const a = list.list.entries[i];

          this.versionDataDoc.push(
            {id:a.entry.id,
             name: a.entry.name,
             comment : a.entry.versionComment,
             modifiedAt: a.entry.modifiedAt,
             modifiedBy: a.entry.modifiedByUser,

            });
        }
        this.createHtmlDataDoc();
        this.versionDataDoc = [];
        this.errorMessage=null;
      }),
      (error) => {
        this.errorMessage = error;
      };
  }
}

