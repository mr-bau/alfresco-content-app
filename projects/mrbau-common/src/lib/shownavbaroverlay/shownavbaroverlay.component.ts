// tslint:disable-next-line: adf-license-banner

import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Observable } from 'rxjs';
import { AppService } from '@alfresco/aca-shared';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslateModule } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'mrbau-shownavbaroverlay',
  standalone: true,
  imports: [CommonModule, TranslateModule, MatButtonModule, MatIconModule],
  template: `
    <span class="mrbau-show-navbar" [ngClass]="{'mrbau-show-navbar-overlay' : overlay }">
      <button *ngIf="(appNavNarMode$ | async) === 'collapsed'"
        mat-icon-button
        class="aca-content-header-button"
        (click)="toggleClick()"
        title="{{'APP.TOOLTIPS.EXPAND_NAVIGATION' | translate}}">
        <mat-icon>keyboard_double_arrow_right</mat-icon>
      </button>
    </span>
    `,
  styles: [`
    .mrbau-show-navbar {
      button {
        padding:0;
        height:24px;
      }
    }
    .mrbau-show-navbar-overlay {
      position:absolute;
      z-index: 100;
      top:0px;
      left:10px;
      button {
        height:48px;
        padding:12px;
      }
    }
    `],
})
export class ShowNavbarOverlayComponent {
  @Input() overlay : boolean = false;
  appNavNarMode$: Observable<'collapsed' | 'expanded'>;

  constructor(private appService: AppService) {
    this.appNavNarMode$ = appService.appNavNarMode$.pipe(takeUntilDestroyed());
  }

  toggleClick() {
    this.appService.toggleAppNavBar$.next();
  }
}
