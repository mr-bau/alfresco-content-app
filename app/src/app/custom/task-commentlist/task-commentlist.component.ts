import { Component, Input, OnInit } from '@angular/core';
import { CommentContentService, CommentModel } from '@alfresco/adf-core';


interface CommentData {
  id? : number;
  createdAt? : Date;
  createdBy? : string;
  message? : string;
}

@Component({
  selector: 'aca-task-commentlist',
  template: `
  <div *ngIf="errorMessage; then thenBlock else elseBlock"></div>
  <ng-template #thenBlock>
    {{errorMessage}}
  </ng-template>
  <ng-template #elseBlock>
    <div *ngIf="commentData && commentData.length > 0; then commentBlock else noComments"></div>
    <ng-template #commentBlock>
      <ul>
        <li *ngFor="let v of commentData; index as i; first as isFirst">
          <b>{{v.createdBy}}</b>, am <i>{{v.createdAt | date:'medium'}}</i>: {{v.message}}
        </li>
      </ul>
    </ng-template>
    <ng-template #noComments>
        Keine Kommentare vorhanden.
    </ng-template>
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

  private _isVisible : boolean = false;
  private _nodeId : string = null;
  errorMessage :string = null;
  commentData : CommentData[] = [];

  constructor(private _commentContentService: CommentContentService) { }

  ngOnInit(): void {
  }

  queryData() {
    this.errorMessage="loading...";
    this.commentData = [];
    if (this._nodeId == null || this._isVisible == false)
    {
      return;
    }

    this._commentContentService.getNodeComments(this._nodeId).subscribe(
      (comments: CommentModel[]) => {
        if (comments && comments instanceof Array) {
          console.log(comments.length+" comments received");
          comments = comments.sort((comment1: CommentModel, comment2: CommentModel) => {
              const date1 = new Date(comment1.created);
              const date2 = new Date(comment2.created);
              return date1 < date2 ? -1 : date1 > date2 ? 1 : 0;
          });
          comments.forEach((comment) => {
            this.commentData.push(
              {
                id: comment.id,
                createdAt: comment.created,
                createdBy: comment.createdBy.displayName,
                message : comment.message
                }
            );
          });
          this.errorMessage=null;
        }
      },
      (err) => {
        this.errorMessage = err;
      }
    );
  }
}

