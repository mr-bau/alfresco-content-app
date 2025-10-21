import { Component, inject, Input, OnInit } from '@angular/core';
import { ADF_COMMENTS_SERVICE, CommentModel, CommentsService } from '@alfresco/adf-core';
import { MrbauCommonService } from '../../../services/mrbau-common.service';
import { ICommentData, TaskCommentBlockComponent } from './task-comment-block.component';
import { CommonModule } from '@angular/common';

@Component({
  standalone:true,
  imports:[
    CommonModule,
    TaskCommentBlockComponent,
  ],
  selector: 'mrbau-task-commentlist',
  template: `
  <div *ngIf="errorMessage; then thenBlock else elseBlock"></div>
  <ng-template #thenBlock>
    {{errorMessage}}
  </ng-template>
  <ng-template #elseBlock>
    <mrbau-task-comment-block [nodeId]="nodeId" [currentUserId]="currentUserId" [commentData]="commentData" (commentsChanged)="commentsChanged()"/>
  </ng-template>
  `,
  styles: []
})
export class TaskCommentlistComponent implements OnInit {
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

  get nodeId() {
    return this._nodeId || '';
  }

  private _isVisible : boolean = false;
  private _nodeId : string | null = null;
  errorMessage : string | null = null;
  commentData : ICommentData[] = [];
  currentUserId : string = '';

  private commentsService = inject<CommentsService>(ADF_COMMENTS_SERVICE);

  constructor(
    private mrbauCommonService: MrbauCommonService
    ) { }

  ngOnInit(): void {
  }

  queryData() {
    this.errorMessage="loading...";
    this.commentData = [];
    if (this._nodeId == null || this._isVisible == false)
    {
      return;
    }
    this.mrbauCommonService.getCurrentUser()
    .then((value) => {
      this.currentUserId = value.entry.id;
      //console.log("commentsChanged queryData");
      return this.commentsService.get(this.nodeId).toPromise();
    })
    .then((comments: CommentModel[] | undefined) => {
        if (comments && comments instanceof Array) {
          //console.log(comments.length+" comments received");
          comments = comments.sort((comment1: CommentModel, comment2: CommentModel) => {
              const date1 = new Date(comment1.created);
              const date2 = new Date(comment2.created);
              return date1 < date2 ? -1 : date1 > date2 ? 1 : 0;
          });
          comments.forEach((comment) => {
            this.commentData.push(
              {
                id: ''+comment.id,
                createdAt: comment.created,
                avatarId: comment.createdBy.avatarId,
                createdById: ''+comment.createdBy.id,
                createdBy: comment.createdBy.displayName,
                message : comment.message
              }
            );
          });
          this.errorMessage=null;
        }
    })
    .catch((err) => {
        this.errorMessage = err;
    });
  }

  commentsChanged()
  {
    //console.log("commentsChanged");
    this.queryData();
  }
}

