import { Component, Input, OnInit } from '@angular/core';

export interface ICommentData {
  id? : number;
  createdAt? : Date;
  createdBy? : string;
  createdById? : string;
  message? : string;
  avatarId? : string;
}

@Component({
  selector: 'aca-task-comment-block',
  template: `
    <div *ngIf="commentData && commentData.length > 0; then commentBlock else noComments"></div>
    <ng-template #commentBlock>
      <div class="commentWrapper" *ngFor="let v of commentData; index as i; first as isFirst">
        <div class="commentInlineContainer" [ngClass]="(v.createdById == this.currentUserId) ? 'own' : 'other'">
          <aca-mrbau-userinfo-profile-picture class="inlineIcon" [userName]="v.createdBy" [avatarId]="v.avatarId"></aca-mrbau-userinfo-profile-picture>
          <div class="chatBox" [ngClass]="(v.createdById == this.currentUserId) ? 'chatBoxRight own' : 'chatBoxLeft other'">
            {{v.message}}
          </div>
        </div>
        <span [ngClass]="(v.createdById == this.currentUserId) ? 'own' : 'other'"><b>{{v.createdBy}}</b>, am <i>{{v.createdAt | date:'medium'}}</i></span>
      </div>
    </ng-template>
    <ng-template #noComments>
        Keine Kommentare vorhanden.
    </ng-template>
  `,
  styleUrls: ['./task-comment-block.component.scss']
})
export class TaskCommentBlockComponent {
  @Input() commentData : ICommentData[] = [];
  @Input() currentUserId:string;

  constructor() { }


}

