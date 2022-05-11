import { Actions, ofType } from '@ngrx/effects';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { createEffect } from '@ngrx/effects';
import { MatDialog } from '@angular/material/dialog';
import { MrbauNewTaskDialogComponent } from '../../custom/dialogs/mrbau-new-task-dialog/mrbau-new-task-dialog.component';
import { MRBAU_NEW_TASK_DIALOG, MrbauNewTaskDialogAction } from '../actions/mrbau.actions';

@Injectable()
export class MrbauEffects {
  constructor(private actions$: Actions, private dialog: MatDialog) {}

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
}
