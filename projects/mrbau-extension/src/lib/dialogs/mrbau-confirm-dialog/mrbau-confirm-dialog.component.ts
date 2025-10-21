import { CommonModule } from '@angular/common';
import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

export interface MrbauConfirmDialogProps {
  dialogTitle?: string;
  dialogMsg?: string;
  dialogButtonCancel?: string;
  dialogButtonOK?: string;
  payload?:any;
}

@Component({
  selector: 'aca-mrbau-confirm-dialog',
  standalone:true,
    imports:[
      CommonModule,
      MatDialogModule,
      MatButtonModule, MatIconModule,
    ],
  template: `
  <h2 mat-dialog-title>{{dialogTitle}}</h2>
  <mat-dialog-content>
    <div class="addMarginBottom">{{dialogMsg}}</div>
  </mat-dialog-content>
  <mat-dialog-actions>
    <button mat-button color="primary" (click)="dialogRef.close(true)">{{dialogButtonOK}}</button>
    <button mat-button (click)="dialogRef.close(false)">{{dialogButtonCancel}}</button>
  </mat-dialog-actions>
  `,
  styleUrls: ['../mrbau-dialog-global.scss', '../../form/mrbau-form-global.scss',],
  encapsulation: ViewEncapsulation.None
})
export class MrbauConfirmDialogComponent {
  dialogTitle: string;
  dialogMsg: string;
  dialogButtonCancel: string;
  dialogButtonOK: string;

  constructor(public dialogRef: MatDialogRef<MrbauConfirmDialogComponent>,
                @Inject(MAT_DIALOG_DATA) public data: MrbauConfirmDialogProps)
    {
      data = data || {};
      this.dialogTitle = data.dialogTitle || 'Aufgabe Titel';
      this.dialogMsg = data.dialogMsg || 'Aufgabe Beschreibung.';
      this.dialogButtonCancel = data.dialogButtonCancel || 'ABBRECHEN';
      this.dialogButtonOK = data.dialogButtonOK || 'OK';
    }

    ngOnInit(): void {
      this.dialogRef.afterClosed().subscribe(result => {
        this.onDialogClose(result);
      });
    }

    onDialogClose(result : boolean)
    {
      if (result) {}
    }

}
