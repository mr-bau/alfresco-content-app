import { Action } from '@ngrx/store';

export const MRBAU_NEW_TASK_DIALOG = 'MRBAU_NEW_TASK_DIALOG';
export const MRBAU_INBOX_ASSIGN_DIALOG ='MRBAU_INBOX_ASSIGN_DIALOG';
export const MRBAU_SHOW_DOC_TASK_DIALOG = 'MRBAU_SHOW_DOC_TASK_DIALOG';
export const MRBAU_START_OCR = 'MRBAU_START_OCR';
export const MRBAU_USE_AS_NEW_VERSION = 'MRBAU_USE_AS_NEW_VERSION';
export const MRBAU_RESET_ARCHIVE_TYPE = 'MRBAU_RESET_ARCHIVE_TYPE';
export const MRBAU_MODIFY_COMPANY = 'MRBAU_MODIFY_COMPANY';
export const MRBAU_PRINT_LINKED_DOCS ='MRBAU_PRINT_LINKED_DOCS';
export const MRBAU_TAG_DONE_LINKED_DOCS ='MRBAU_TAG_DONE_LINKED_DOCS';

export class MrbauNewTaskDialogAction implements Action {
  readonly type = MRBAU_NEW_TASK_DIALOG;

  constructor(public payload: any[] = []) {}
}

export class MrbauInboxAssignDialogAction implements Action {
  readonly type = MRBAU_INBOX_ASSIGN_DIALOG;

  constructor(public payload: any[] = []) {}
}

export class MrbauShowDocTaskDialogAction implements Action {
  readonly type = MRBAU_SHOW_DOC_TASK_DIALOG;

  constructor(public payload: any[] = []) {}
}

export class MrbauStartOcrAction implements Action {
  readonly type = MRBAU_START_OCR;

  constructor(public payload: any[] = []) {}
}

export class MrbauModifyCompanyAction implements Action {
  readonly type = MRBAU_MODIFY_COMPANY;

  constructor(public payload: any[] = []) {}
}

export class MrbauPrintLinkedDocsAction implements Action {
  readonly type = MRBAU_PRINT_LINKED_DOCS;

  constructor(public payload: any[] = []) {}
}

export class MrbauTagDoneLinkedDocsAction implements Action {
  readonly type = MRBAU_TAG_DONE_LINKED_DOCS;

  constructor(public payload: any[] = []) {}
}

export class MrbauUseAsNewVersion implements Action {
  readonly type = MRBAU_USE_AS_NEW_VERSION;

  constructor(public payload: any[] = []) {}
}

export class MrbauResetArchiveType implements Action {
  readonly type = MRBAU_RESET_ARCHIVE_TYPE;

  constructor(public payload: any[] = []) {}
}
