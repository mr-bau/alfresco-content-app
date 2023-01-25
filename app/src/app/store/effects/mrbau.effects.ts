import { Actions, ofType } from '@ngrx/effects';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { createEffect } from '@ngrx/effects';
import { MatDialog } from '@angular/material/dialog';
import { MRBAU_NEW_TASK_DIALOG, MRBAU_INBOX_ASSIGN_DIALOG, MRBAU_START_OCR, MrbauNewTaskDialogAction, MrbauInboxAssignDialogAction, MrbauStartOcrAction, MrbauUseAsNewVersion, MRBAU_USE_AS_NEW_VERSION, MrbauResetArchiveType, MRBAU_RESET_ARCHIVE_TYPE, MrbauShowDocTaskDialogAction, MRBAU_SHOW_DOC_TASK_DIALOG} from '../actions/mrbau.actions';
import { MrbauNewTaskDialogComponent } from '../../custom/dialogs/mrbau-new-task-dialog/mrbau-new-task-dialog.component';
import { MrbauInboxAssignDialogComponent } from '../../custom/dialogs/mrbau-inbox-assign-dialog/mrbau-inbox-assign-dialog.component';
import { MrbauActionService } from '../../custom/services/mrbau-action.service';
import { MrbauShowDocTaskDialogComponent } from '../../custom/dialogs/mrbau-show-doc-task-dialog/mrbau-show-doc-task-dialog.component';

@Injectable()
export class MrbauEffects {
  constructor(
    private actions$: Actions,
    private dialog: MatDialog,
    private mrbauActionService : MrbauActionService
    ) {}

  mrbauNewTaskDialog$ = createEffect(
    () => this.actions$.pipe(
      ofType<MrbauNewTaskDialogAction>(MRBAU_NEW_TASK_DIALOG),
      map((action) => {
  	      this.dialog.open(MrbauNewTaskDialogComponent, {
            data: { payload: action.payload }
          });
      })
    ),
    { dispatch: false }
  );

  mrbauInboxAssignDialog$ = createEffect(
    () => this.actions$.pipe(
      ofType<MrbauInboxAssignDialogAction>(MRBAU_INBOX_ASSIGN_DIALOG),
      map((action) => {
  	      this.dialog.open(MrbauInboxAssignDialogComponent, {
            data: { payload: action.payload }
          });
      })
    ),
    { dispatch: false }
  );

  mrbauShowDocTaskDialog$ = createEffect(
    () => this.actions$.pipe(
      ofType<MrbauShowDocTaskDialogAction>(MRBAU_SHOW_DOC_TASK_DIALOG),
      map((action) => {
        this.dialog.open(MrbauShowDocTaskDialogComponent, {
          data: { payload: action.payload }
        });
      })
    ),
    { dispatch: false }
  );

  mrbauStartOCR$ = createEffect(
    () => this.actions$.pipe(
      ofType<MrbauStartOcrAction>(MRBAU_START_OCR),
      map((action) => {
          this.mrbauActionService.startOcrTransform({payload: action.payload });
      })
    ),
    { dispatch: false }
  );

  mrbauUseAsNewVersion$ = createEffect(
    () => this.actions$.pipe(
      ofType<MrbauUseAsNewVersion>(MRBAU_USE_AS_NEW_VERSION),
      map((action) => {
          this.mrbauActionService.mrbauUseAsNewVersion({payload: action.payload });
      })
    ),
    { dispatch: false }
  );

  mrbauResetArchiveType$ = createEffect(
    () => this.actions$.pipe(
      ofType<MrbauResetArchiveType>(MRBAU_RESET_ARCHIVE_TYPE),
      map((action) => {
          this.mrbauActionService.mrbauResetArchiveType({payload: action.payload });
      })
    ),
    { dispatch: false }
  );
}
