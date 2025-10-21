// tslint:disable-next-line: adf-license-banner

import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'mrbau-loaderoverlay',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule],
  templateUrl: './loaderoverlay.component.html',
  styleUrls: ['./loaderoverlay.component.scss']
})
export class LoaderoverlayComponent {}
