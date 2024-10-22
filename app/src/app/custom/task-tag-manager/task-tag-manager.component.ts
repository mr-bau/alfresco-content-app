import { Component, Input } from '@angular/core';
import { Tag } from '@alfresco/js-api';
import { MrbauCommonService } from '../services/mrbau-common.service';

interface IAddTagListData {
  tag : string,
  disabled : boolean,
}

@Component({
  selector: 'aca-task-tag-manager',
  template: `
      <ul class="associationList" *ngIf="nodeTags.length > 0; else elseBlock">
        <li class="addMarginLeft" *ngFor="let d of nodeTags; index as i">
          <button mat-button class="addMarginRight" (click)="onRemoveTagClicked(i)" matTooltip="Tag Entfernen" [disabled]="buttonsDisabled || !isTagManagerUser"><mat-icon>delete</mat-icon></button>
          {{d.tag}}
        </li>
      </ul>
      <ng-template #elseBlock><p>(keine Tags vorhanden)</p></ng-template>
      <ng-container *ngFor="let item of tagListButtonsData; let i = index">
        <button mat-raised-button type="button" class="addMarginTop addMarginRight" color="primary"
        (click)="onAddTagClicked(i)" matTooltip="Tag Hinzufügen" [disabled]="buttonsDisabled || !isTagManagerUser || item.disabled"><mat-icon>add</mat-icon>{{item.tag}}</button>
      </ng-container>
  `,
  styleUrls: []
})
export class TaskTagManagerComponent {
  @Input()
  set nodeId(val: string) {
    this._nodeId = val;
    this.queryData();
  }
  get nodeId() {
    return this._nodeId;
  }
  @Input()
  set isVisible(val: boolean)
  {
    this._isVisible = val;
    this.queryData();
  }

  buttonsDisabled : boolean = false;
  isTagManagerUser : boolean = false;
  private _isVisible : boolean = false;
  private _nodeId : string = null;

  nodeTags:Tag[] = [];
  tagListButtonsData:IAddTagListData[];



  constructor(
    private mrbauCommonService : MrbauCommonService,
  ) {
  }

  async queryData() {
    if (this._nodeId == null || this._isVisible == false)
    {
      return;
    }

    this.isTagManagerUser = this.mrbauCommonService.isTagManagerUser();

    if (this.tagListButtonsData == null)
    {
      // load all tags
      let tagList : string[] = [];
      const tags = await this.mrbauCommonService.getAllTheTags();
      tagList = Object.assign([], this.mrbauCommonService.DEFAULT_TAGS);
      for (let i=0; i<tags.list.entries.length;i++) {
        const tag = this.firstLetterUppercase(tags.list.entries[i].entry.tag);
        if (this.mrbauCommonService.HIDDEN_TAGS.indexOf(tag) < 0)
        {
          tagList.push(tag);
        }
      }
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

    const tags = await this.mrbauCommonService.getTagsByNodeId(this.nodeId);
    this.nodeTags = [];
    if (tags.list.entries.length > 0) {
      for (let i=0; i<tags.list.entries.length;i++) {
        const entry = tags.list.entries[i].entry;
        entry.tag = this.firstLetterUppercase(entry.tag)
        this.nodeTags.push(entry);
        this.disableTagListData(entry.tag);
      }
    }
    this.buttonsDisabled = !this.isTagManagerUser;
  }

  firstLetterUppercase(tag : string) : string{
    return tag.charAt(0).toUpperCase() + tag.slice(1);
  }

  disableTagListData(tag : string) {
    for (let i=0; i<this.tagListButtonsData.length; i++) {
      if (this.tagListButtonsData[i].tag.toLowerCase() == tag.toLowerCase()) {
        // disable button (tag already assigned)
        this.tagListButtonsData[i].disabled = true;
        return;
      }
    }
  }

  async onRemoveTagClicked(index) {
    this.buttonsDisabled = true;
    const tag =  this.nodeTags[index].id;
    await this.mrbauCommonService.removeTag(this.nodeId, tag);
    await this.queryData();
    this.buttonsDisabled = false;
  }

  async onAddTagClicked(index) {
    this.buttonsDisabled = true;
    await this.mrbauCommonService.addTag(this.nodeId, this.tagListButtonsData[index].tag.toLowerCase());
    await this.queryData();
    this.buttonsDisabled = false;
  }
}
