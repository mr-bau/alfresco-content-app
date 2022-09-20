import { Component, Input, OnInit } from '@angular/core';
import { CommentModel } from '@alfresco/adf-core';
import { FormGroup } from '@angular/forms';
import { FormlyFieldConfig, FormlyFormOptions } from '@ngx-formly/core';
import { MrbauFormLibraryService } from '../services/mrbau-form-library.service';
import { Observable } from 'rxjs';
import { MrbauCommonService } from '../services/mrbau-common.service';

interface CommentData {
  id? : number;
  createdAt? : Date;
  createdBy? : string;
  message? : string;
}

@Component({
  selector: 'aca-task-commentlist-invoice-workflow',
  template: `
  <div *ngIf="errorMessage; then thenBlock else elseBlock"></div>
  <ng-template #thenBlock>
    {{errorMessage}}
  </ng-template>
  <ng-template #elseBlock>
    <form [formGroup]="form" class="addMarginBottom">
      <formly-form [form]="form" [fields]="fields" [options]="options" [model]="model"></formly-form>
      <button mat-raised-button type="button" class="mat-flat-button mat-button-base mat-primary addMarginTop" color="primary" (click)="buttonAddComment()" matTooltip="Neuen Kommentar hinzufügen" [disabled]="!this.model.comment">Hinzufügen</button>
    </form>
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
export class TaskCommentlistInvoiceWorkflowComponent implements OnInit {
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
  private _nodeId : string = null;
  errorMessage :string = null;
  commentData : CommentData[] = [];

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

    this._mrbauCommonService.getNodeComments(this._nodeId).subscribe(
      (comments: CommentModel[]) => {
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

  buttonAddComment()
  {
    // todo add comment
    this.addComment(this.model.comment);
  }

  addComment(comment: string)
  {
    const result : Observable<CommentModel> = this._mrbauCommonService.addComment(this._nodeId, comment);
    if (result == null)
    {
      return;
    }
    result.subscribe(
      (res: CommentModel) => {
        res;
        this._mrbauCommonService.showInfo('Änderungen erfolgreich gespeichert');
        this.model = {};
        this.queryData()
      },
      (err) => {
        this.errorMessage = (this.errorMessage) ? err : this.errorMessage+"\n"+err;
      }
    );
  }
}

