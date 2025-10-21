import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ErrormsgpaneComponent } from '../errormsgpane/errormsgpane.component';
import { LoaderoverlayComponent } from '../loaderoverlay/loaderoverlay.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';
import { PageLayoutComponent, ToolbarComponent } from '@alfresco/aca-shared';

@Component({
  selector: 'mrbau-page-layout',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, ErrormsgpaneComponent, LoaderoverlayComponent,
    ToolbarComponent,
    CommonModule, TranslateModule, MatIconModule, MatButtonModule, PageLayoutComponent
  ],
  templateUrl: './mrbau-page-layout.component.html',
  styleUrls: ['./mrbau-page-layout.component.scss']
})
export class MrbauPageLayoutComponent {
  @Input() title = 'Title';
  @Input() errorMessage : string | null = null;
  @Input() loaderVisible = false;
  actions = [];
}
