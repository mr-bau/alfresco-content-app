import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ContentApiService } from '@alfresco/aca-shared';
import { UserInfo, VersionPaging } from '@alfresco/js-api';
import { EMRBauTaskStatus } from '../mrbau-task-declarations';
//import { Store } from '@ngrx/store';
//import { AppStore, ViewNodeAction } from '@alfresco/aca-shared/store';

interface VersionData {
  id? : string;
  modifiedAt? : Date;
  modifiedBy? : UserInfo;
  assignedUser? : string;
  status? : EMRBauTaskStatus;
  associatedDocumentRef? : string[];
  associatedDocumentName?: string[];
}

interface HtmlData {
  id? : string;
  modifiedAt? : Date;
  modifiedBy? : UserInfo;
  assignedUser? : string;
  status? : EMRBauTaskStatus;
  addedDocName? : string[];
  addedDocRef? : string[];
  removedDocName?: string[];
  removedDocRef?: string[];
}

@Component({
  selector: 'aca-task-versionlist',
  template: `
    <div *ngIf="errorMessage; then thenBlock else elseBlock"></div>
    <ng-template #thenBlock>
      {{errorMessage}}
    </ng-template>
    <ng-template #elseBlock>
      <ul>
        <li *ngFor="let v of htmlData; index as i; first as isFirst">
          <b>Version {{v.id}}</b> von <i>{{v.modifiedBy.displayName}}, {{v.modifiedAt | date:'medium'}}</i>
          <ul class="associationList">
            <li *ngIf="v.status !== undefined">Status: <i>{{v.status | mrbauTaskStatus}}</i></li>
            <li *ngIf="v.assignedUser">Zugewiesen an: <i>{{v.assignedUser}}</i></li>
            <li *ngFor="let a of v.removedDocName; index as i; first as isFirst">
              Dokument entfernt: <a href="javascript: void(0);" (click)="onAssociationClicked(v.removedDocRef[i])" matTooltip="Dokument Anzeigen">{{a}}</a>
            </li>
            <li *ngFor="let a of v.addedDocName; index as i; first as isFirst">
              Dokument hinzugefügt: <a href="javascript: void(0);" (click)="onAssociationClicked(v.addedDocRef[i])" matTooltip="Dokument Anzeigen">{{a}}</a>
            </li>
          </ul>
        </li>
      </ul>
    </ng-template>
    `,
  styles: []
})
export class TaskVersionlistComponent implements OnInit {
  @Input()
  set nodeId(val: string) {
    this._nodeId = val;
    this.queryData();
  }
  @Input()
  set isVisible(val: boolean)
  {
    this._isVisible = val;
    this.queryData();
  }
  @Output() onAssociation = new EventEmitter<string>();

  private _isVisible : boolean = false;
  private _nodeId : string = null;

  errorMessage :string = null;
  versionData : VersionData[] = [];
  htmlData : HtmlData[] = [];

  viewerNodeId : string;
  viewerShowViewer : boolean = false;

  constructor(private _contentApiService: ContentApiService,
    //protected store: Store<AppStore>,
    ) { }

  ngOnInit(): void {
  }

  onAssociationClicked(id : string )
  {
    this.onAssociation.emit(id);
    //this.store.dispatch(new ViewNodeAction(id, {path : 'ext/mrbau/tasks'}));
  }

  createHtmlData() {
    this.htmlData = [];
    let v : VersionData = {
      associatedDocumentName : [],
      assignedUser: null,
      status: null
    };
    for (let i=0; i<this.versionData.length; i++)
    {
      let v_pre = v;
      v = this.versionData[i];
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
      let e : HtmlData = {
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
      // append data
      this.htmlData.push(e);
    }
  }

  queryData() {
    this.errorMessage="loading...";
    this.versionData = [];
    if (this._nodeId == null || this._isVisible == false)
    {
      return;
    }
    this._contentApiService.getNodeVersions(this._nodeId, {maxItems: 999, skipCount: 0, include:['properties'] }).subscribe(
      (list : VersionPaging) => {
        for (let i=list.list.entries.length-1; i>=0; i--)
        {
          const a = list.list.entries[i];
          this.versionData.push(
            {id:a.entry.id,
            modifiedAt: a.entry.modifiedAt,
            modifiedBy: a.entry.modifiedByUser,
            assignedUser: a.entry.properties["mrbt:assignedUserName"],
            status: a.entry.properties["mrbt:status"],
            associatedDocumentRef: a.entry.properties['mrbt:associatedDocumentRef'] ? a.entry.properties['mrbt:associatedDocumentRef'] : [],
            associatedDocumentName: a.entry.properties['mrbt:associatedDocumentName'] ? a.entry.properties['mrbt:associatedDocumentName'] : [],
            });
        }
        this.createHtmlData();
        this.errorMessage=null;
      }),
      (error) => {
        this.errorMessage = error;
      };
  }
}

