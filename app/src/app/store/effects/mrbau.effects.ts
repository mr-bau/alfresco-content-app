import { Actions, ofType } from '@ngrx/effects';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { createEffect } from '@ngrx/effects';
import { MatDialog } from '@angular/material/dialog';
import { MRBAU_NEW_TASK_DIALOG, MRBAU_INBOX_ASSIGN_DIALOG, MRBAU_START_OCR, MrbauNewTaskDialogAction, MrbauInboxAssignDialogAction, MrbauStartOcrAction} from '../actions/mrbau.actions';
import { MrbauNewTaskDialogComponent } from '../../custom/dialogs/mrbau-new-task-dialog/mrbau-new-task-dialog.component';
import { MrbauInboxAssignDialogComponent } from '../../custom/dialogs/mrbau-inbox-assign-dialog/mrbau-inbox-assign-dialog.component';
import { MrbauActionService } from '../../custom/services/mrbau-action.service';

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

  mrbauStartOCR$ = createEffect(
    () => this.actions$.pipe(
      ofType<MrbauStartOcrAction>(MRBAU_START_OCR),
      map((action) => {
          this.mrbauActionService.startOcrTransform({payload: action.payload });
      })
    ),
    { dispatch: false }
  );
}
