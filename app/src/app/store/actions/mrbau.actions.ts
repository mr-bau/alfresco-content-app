import { Action } from '@ngrx/store';

export const MRBAU_NEW_TASK_DIALOG = 'MRBAU_NEW_TASK_DIALOG';

export class MrbauNewTaskDialogAction implements Action {
  readonly type = MRBAU_NEW_TASK_DIALOG;

  constructor(public payload: any[] = []) {}
}
