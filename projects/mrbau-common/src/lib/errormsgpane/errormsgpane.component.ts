import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
@Component({
  selector: 'mrbau-errormsgpane',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  templateUrl: './errormsgpane.component.html',
  styleUrls: ['./errormsgpane.component.scss']
})
export class ErrormsgpaneComponent {
  @Input() errorMessage: string | null = null;
}
