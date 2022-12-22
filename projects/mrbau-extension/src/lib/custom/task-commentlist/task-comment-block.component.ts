import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MrbauConfirmTaskDialogComponent } from '../dialogs/mrbau-confirm-task-dialog/mrbau-confirm-task-dialog.component';
import { CONST } from '../mrbau-global-declarations';
import { MrbauCommonService } from '../services/mrbau-common.service';
import { MrbauFormLibraryService } from '../services/mrbau-form-library.service';

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
          <button *ngIf="isEditButtonVisible(v)" class="inlineButton" mat-button (click)="click(nodeId, v.id, v.message)" matTooltip="Kommentar Bearbeiten"><mat-icon>edit</mat-icon></button>
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
  @Input() nodeId: string;
  @Input() commentData : ICommentData[] = [];
  @Input() currentUserId:string;
  @Output() commentsChanged = new EventEmitter();

  constructor(
    private dialog : MatDialog,
    private mrbauFormLibraryService : MrbauFormLibraryService,
    private mrbauCommonService : MrbauCommonService
  ) { }

  isEditButtonVisible(v : ICommentData) :boolean {
    // only allow editing you own comments that are not older than a certain time e.g. 24 hours
    // nodeId is required to be able to edit comments
    const currentDate = new Date();
    const delta = (currentDate.getTime() - v.createdAt.getTime())/CONST.MAX_TIME_COMMENT_EDITABLE_MILLISECONDS;
    return this.nodeId != null && this.currentUserId == v.createdById && delta <= 1;
  }

  click(nodeId: string, commentId:number, message:string)
  {
    const dialogRef = this.dialog.open(MrbauConfirmTaskDialogComponent, {
      data: {
        dialogTitle: 'Kommentar ändern',
        dialogMsg: 'Kommentar ändern?',
        dialogButtonOK: 'SPEICHERN',
        callQueryData: false,
        model: {'comment' : message},
        fieldsMain: [
          {
            fieldGroupClassName: 'flex-container-min-width',
            fieldGroup: [
              // create a copy to avoid unintentional conflicts with other visible forms
              JSON.parse(JSON.stringify(this.mrbauFormLibraryService.common_comment)),
            ]
          }
        ],
        payload: null
      }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result)
      {
        let comment : string = result.comment || '';
        comment = comment.trim();
        if (comment.length == 0)
        {
          this.mrbauCommonService.deleteComment(nodeId, ""+commentId)
          .then(() => {
            this.mrbauCommonService.showInfo("Kommentar erfolgreich gelöscht");
            this.commentsChanged.emit();
          })
          .catch( (error) => {
            this.mrbauCommonService.showInfo("Fehler "+error);
          });
        }
        else if (comment != message)
        {
          this.mrbauCommonService.updateComment(nodeId, ""+commentId, comment)
          .then((result) => {
            if (result)
            {
              this.mrbauCommonService.showInfo("Änderung erfolgreich gespeichert");
              this.commentsChanged.emit();
            }
          })
          .catch( (error) => {
            this.mrbauCommonService.showInfo("Fehler "+error);
          });
        }
      }
    });
  }
}

