import { Component, Input, OnInit } from '@angular/core';
import { CommentModel } from '@alfresco/adf-core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FormlyFieldConfig, FormlyFormOptions, FormlyModule } from '@ngx-formly/core';
import { MrbauFormLibraryService } from '../../../services/mrbau-form-library.service';
import { MrbauCommonService } from '../../../services/mrbau-common.service';
import { ICommentData, TaskCommentBlockComponent } from './task-comment-block.component';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  standalone:true,
  imports:[
    CommonModule,
    MatButtonModule,
    MatIconModule,
    ReactiveFormsModule,
    FormlyModule,
    TaskCommentBlockComponent,
  ],
  selector: 'mrbau-task-commentlist-invoice-workflow',
  template: `
  <div *ngIf="errorMessage; then thenBlock else elseBlock"></div>
  <ng-template #thenBlock>
    {{errorMessage}}
  </ng-template>
  <ng-template #elseBlock>
    <mrbau-task-comment-block [nodeId]="nodeId" [currentUserId]="currentUserId" [commentData]="commentData" (commentsChanged)="commentsChanged()"/>
    <form [formGroup]="form" class="addMarginBottom">
      <formly-form [form]="form" [fields]="fields" [options]="options" [model]="model"></formly-form>
      <button mat-raised-button type="button" class="mat-flat-button mat-button-base mat-primary addMarginTop" color="primary" (click)="buttonAddComment()" matTooltip="Neuen Kommentar hinzufügen" [disabled]="!this.model.comment">Hinzufügen</button>
    </form>
  </ng-template>
  `,
  styles: []
})
export class TaskCommentlistInvoiceWorkflowComponent implements OnInit {
  @Input()
  set nodeId(val: string | null) {
    this._nodeId = val;
    this.queryData();
  }
  @Input()
  set isVisible(val: boolean)
  {
    this._isVisible = val;
    this.queryData();
  }

  get nodeId() : string {
    return this._nodeId || '';
  }
  form = new FormGroup({});
  model: any = {};
  options: FormlyFormOptions = { } ;
  fields : FormlyFieldConfig[] = [
    {
      fieldGroupClassName: 'flex-container',
      fieldGroup: [this._mrbauFormLibraryService.common_comment],
    }
  ];

  private _isVisible : boolean = false;
  private _nodeId : string | null = null;
  errorMessage : string | null= null;
  commentData : ICommentData[] = [];
  currentUserId : string = '';

  constructor(
    private _mrbauCommonService: MrbauCommonService,
    private _mrbauFormLibraryService : MrbauFormLibraryService,
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

    this._mrbauCommonService.getCurrentUser()
    .then((value) => {
      this.currentUserId = value.entry.id;
      return this._mrbauCommonService.getNodeComments(this.nodeId).toPromise()
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

  buttonAddComment()
  {
    this.addComment(this.model.comment);
  }

  commentsChanged()
  {
    this.queryData();
  }

  addComment(comment: string)
  {
    this._mrbauCommonService.addComment(this.nodeId, comment)
    .then(() => {
      this._mrbauCommonService.showInfo('Änderungen erfolgreich gespeichert');
      this.model = {};
      this.queryData()
    })
    .catch(err => this.errorMessage = (this.errorMessage) ? err : this.errorMessage+"\n"+err)
  }
}

