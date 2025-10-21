import { Component, Input } from '@angular/core';
import { Tag } from '@alfresco/js-api';
import { MrbauCommonService } from '../../../services/mrbau-common.service';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

interface IAddTagListData {
  tag : string,
  disabled : boolean,
}

interface INodeTagListData {
  tag : Tag,
  disabled : boolean,
}

@Component({
  standalone:true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
  ],
  selector: 'mrbau-task-tag-manager',
  template: `
    <div *ngIf="errorMessage; then thenBlock1 else elseBlock1"></div>
    <ng-template #thenBlock1>
      {{errorMessage}}
    </ng-template>
    <ng-template #elseBlock1>
      <ul class="associationList" *ngIf="nodeTags.length > 0; else elseBlock">
        <li class="addMarginLeft" *ngFor="let d of nodeTags; index as i">
          <button mat-button class="addMarginRight" (click)="onRemoveTagClicked(i)" matTooltip="Tag Entfernen" [disabled]="d.disabled || buttonsDisabled || !isTagManagerUser"><mat-icon>delete</mat-icon></button>
          {{d.tag.tag}}
        </li>
      </ul>
      <ng-template #elseBlock><p>(keine Tags vorhanden)</p></ng-template>
      <ng-container *ngFor="let item of tagListButtonsData; let i = index">
        <button mat-raised-button type="button" class="addMarginTop addMarginRight" color="primary"
        (click)="onAddTagClicked(i)" matTooltip="Tag Hinzufügen" [disabled]="buttonsDisabled || !isTagManagerUser || item.disabled"><mat-icon>add</mat-icon>{{item.tag}}</button>
      </ng-container>
    </ng-template>
  `,
  styleUrls: []
})
export class TaskTagManagerComponent {
  @Input()
  set nodeId(val: string) {
    this._nodeId = val;
    this.queryData();
  }
  get nodeId() : string | null{
    return this._nodeId;
  }
  @Input()
  set isVisible(val: boolean)
  {
    this._isVisible = val;
    this.queryData();
  }

  errorMessage : string | undefined;
  buttonsDisabled : boolean = false;
  isTagManagerUser : boolean = false;
  private _isVisible : boolean = false;
  private _nodeId : string | null = null;

  nodeTags:INodeTagListData[] = [];
  tagListButtonsData:IAddTagListData[] | undefined;

  private readonly WAIT_TEXT = 'Änderungen werden durchgeführt ...';
  private readonly LOADING_TEXT = 'Loading...';

  constructor(
    private mrbauCommonService : MrbauCommonService,
  ) {
  }

  async queryData() {
    this.errorMessage = this.LOADING_TEXT;
    if (this._nodeId == null || this._isVisible == false)
    {
      return;
    }

    try {
      this.isTagManagerUser = this.mrbauCommonService.isTagManagerUser();
      const myTags = this.mrbauCommonService.getMyTags() || [];
      if (this.tagListButtonsData == null)
      {
        // load all tags
        let tagList : string[] = [];
        tagList = Object.assign([], myTags);
        /*const tags = await this.mrbauCommonService.getAllTheTags();
        for (let i=0; i<tags.list.entries.length;i++) {
          const tag = this.firstLetterUppercase(tags.list.entries[i].entry.tag);
          if (this.mrbauCommonService.HIDDEN_TAGS.indexOf(tag) < 0)
          {
            tagList.push(tag);
          }
        }*/
        // remove duplicates
        tagList = [...new Set(tagList)];
        // create tagListButtonsData
        this.tagListButtonsData = [];
        for (let i = 0; i< tagList.length;i++) {
          this.tagListButtonsData.push({tag: tagList[i], disabled : false});
        }
      }
      else
      {
        for (let i = 0; i<this.tagListButtonsData.length;i++) {
          this.tagListButtonsData[i].disabled = false;
        }
      }

      const tags = await this.mrbauCommonService.getTagsByNodeIdObservable(this._nodeId).toPromise();
      this.nodeTags = [];
      if (tags?.list?.entries && tags.list.entries.length > 0) {
        for (let i=0; i<tags.list.entries.length;i++) {
          const entry = tags.list.entries[i].entry;
          entry.tag = this.eachWordFirstLetterUppercase(entry.tag)
          const disabled = myTags.indexOf(entry.tag) < 0;
          this.nodeTags.push({tag:entry, disabled:disabled});
          this.disableTagListData(entry.tag);
        }
      }
      this.buttonsDisabled = !this.isTagManagerUser;
      this.errorMessage = undefined;
    } catch(err:any) {
      this.errorMessage = err;
    };
  }

  eachWordFirstLetterUppercase(tag : string) : string{
    let words = tag.split(' ');
    for (let i = 0; i< words.length; i++) {
      words[i] = words[i].charAt(0).toUpperCase() + words[i].slice(1);
    }
    return words.join(' ');
  }

  disableTagListData(tag : string) {
    if (this.tagListButtonsData == null) {
      return;
    }

    for (let i=0; i<this.tagListButtonsData.length; i++) {
      if (this.tagListButtonsData[i].tag.toLowerCase() == tag.toLowerCase()) {
        // disable button (tag already assigned)
        this.tagListButtonsData[i].disabled = true;
        return;
      }
    }
  }

  async onRemoveTagClicked(index:number) {
    if (this.nodeId == null) {
      return;
    }

    this.buttonsDisabled = true;
    this.errorMessage = this.WAIT_TEXT;
    const tag =  this.nodeTags[index].tag.id;
    await this.mrbauCommonService.removeTag(this.nodeId, tag);
    await this.queryData();
    this.buttonsDisabled = false;
  }

  async onAddTagClicked(index:number) {
    if (this.nodeId == null || this.tagListButtonsData == null) {
      return;
    }
    this.buttonsDisabled = true;
    this.errorMessage = this.WAIT_TEXT;
    await this.mrbauCommonService.addTag(this.nodeId, this.tagListButtonsData[index].tag.toLowerCase());
    await this.queryData();
    this.buttonsDisabled = false;
  }
}
