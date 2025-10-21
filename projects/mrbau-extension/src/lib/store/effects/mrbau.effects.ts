
import { inject, Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { MRBAU_NEW_TASK_DIALOG, MRBAU_INBOX_ASSIGN_DIALOG, MRBAU_START_OCR, MrbauNewTaskDialogAction, MrbauInboxAssignDialogAction, MrbauStartOcrAction, MrbauUseAsNewVersion,
  MRBAU_USE_AS_NEW_VERSION, MrbauResetArchiveType, MRBAU_RESET_ARCHIVE_TYPE, MrbauShowDocTaskDialogAction, MRBAU_SHOW_DOC_TASK_DIALOG, MRBAU_SHOW_DOC_TASK_DIALOG_WINDOW,
  MRBAU_MODIFY_COMPANY, MrbauModifyCompanyAction, MRBAU_PRINT_LINKED_DOCS, MrbauPrintLinkedDocsAction, MRBAU_TAG_DONE_LINKED_DOCS, MrbauTagDoneLinkedDocsAction,
  MrbauShowDocTaskDialogWindowAction} from '../actions/mrbau.actions';
import { MrbauActionService } from '../../services/mrbau-action.service';
import { MrbauNewTaskDialogComponent } from '../../dialogs/mrbau-new-task-dialog/mrbau-new-task-dialog.component';
import { MrbauInboxAssignDialogComponent } from '../../dialogs/mrbau-inbox-assign-dialog/mrbau-inbox-assign-dialog.component';
import { MrbauShowDocTaskDialogComponent } from '../../dialogs/mrbau-show-doc-task-dialog/mrbau-show-doc-task-dialog.component';
import { MrbauShowModifyCompanyDialogComponent } from '../../dialogs/mrbau-show-modify-company-dialog/mrbau-show-modify-company-dialog.component';
import { MrbauPrintLinkedDocsDialogComponent } from '../../dialogs/mrbau-print-linked-docs-dialog/mrbau-print-linked-docs-dialog.component';
import { MrbauTagDoneLinkedDocsDialogComponent } from '../../dialogs/mrbau-tag-done-docs-dialog/mrbau-tag-done-docs-dialog.component';

import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { AppStore } from '@alfresco/aca-shared/store';


@Injectable()
export class MrbauEffects {
  private store = inject(Store<AppStore>);
  private actions$ = inject(Actions);

  constructor(
    private dialog: MatDialog,
    private mrbauActionService : MrbauActionService
    ) {
      this.store;
    }

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

  mrbauShowDocTaskDialogWindow$ = createEffect(
    () => this.actions$.pipe(
      ofType<MrbauShowDocTaskDialogWindowAction>(MRBAU_SHOW_DOC_TASK_DIALOG_WINDOW),
      map((action) => {
        this.dialog.open(MrbauShowDocTaskDialogComponent, {
          data: { payload: action.payload, openInNewWindow: true }
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

  mrbauModifyCompany$ = createEffect(
    () => this.actions$.pipe(
      ofType<MrbauModifyCompanyAction>(MRBAU_MODIFY_COMPANY),
      map((action) => {
        this.dialog.open(MrbauShowModifyCompanyDialogComponent, {
          data: { payload: action.payload }
        });
      })
    ),
    { dispatch: false }
  );

  mrbauPrintLinkedDocs$ = createEffect(
    () => this.actions$.pipe(
      ofType<MrbauPrintLinkedDocsAction>(MRBAU_PRINT_LINKED_DOCS),
      map((action) => {
        this.dialog.open(MrbauPrintLinkedDocsDialogComponent, {
          data: { payload: action.payload }
        });
      })
    ),
    { dispatch: false }
  );

  mrbauTagDoneLinkedDocs$ = createEffect(
    () => this.actions$.pipe(
      ofType<MrbauTagDoneLinkedDocsAction>(MRBAU_TAG_DONE_LINKED_DOCS),
      map((action) => {
        this.dialog.open(MrbauTagDoneLinkedDocsDialogComponent, {
          data: { payload: action.payload }
        });
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
