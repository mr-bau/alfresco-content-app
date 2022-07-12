import { Component, Input, OnInit } from '@angular/core';
import { ContentApiService } from '@alfresco/aca-shared';
import { UserInfo, VersionPaging } from '@alfresco/js-api';
import { EMRBauTaskStatus } from '../mrbau-task-declarations';

interface VersionData {
  id? : string;
  modifiedAt? : Date;
  modifiedBy? : UserInfo;
  assignedUser? : string;
  status? : EMRBauTaskStatus;
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
        <li *ngFor="let v of versionData; index as i; first as isFirst">
          <b>Version {{v.id}}</b> zugewiesen an <i>{{v.assignedUser}}</i> mit Status <i>{{v.status | mrbauTaskStatus}}</i> von <i>{{v.modifiedBy.displayName}}, {{v.modifiedAt | date:'medium'}}</i>
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
  private _isVisible : boolean = false;
  private _nodeId : string = null;
  errorMessage :string = null;
  versionData : VersionData[] = [];

  constructor(private _contentApiService: ContentApiService) { }

  ngOnInit(): void {
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
            });
        }
        this.errorMessage=null;
      }),
      (error) => {
        this.errorMessage = error;
      };
  }
}

