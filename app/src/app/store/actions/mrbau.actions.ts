import { Action } from '@ngrx/store';

export const MRBAU_NEW_TASK_DIALOG = 'MRBAU_NEW_TASK_DIALOG';
export const MRBAU_INBOX_ASSIGN_DIALOG ='MRBAU_INBOX_ASSIGN_DIALOG';
export const MRBAU_START_OCR = 'MRBAU_START_OCR';
export class MrbauNewTaskDialogAction implements Action {
  readonly type = MRBAU_NEW_TASK_DIALOG;

  constructor(public payload: any[] = []) {}
}

export class MrbauInboxAssignDialogAction implements Action {
  readonly type = MRBAU_INBOX_ASSIGN_DIALOG;

  constructor(public payload: any[] = []) {}
}

export class MrbauStartOcrAction implements Action {
  readonly type = MRBAU_START_OCR;

  constructor(public payload: any[] = []) {}
}
