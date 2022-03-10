import { Component, Input } from '@angular/core';

@Component({
  selector: 'aca-mrbau-errormsgpane',
  templateUrl: './errormsgpane.component.html',
  styleUrls: ['./errormsgpane.component.scss']
})
export class ErrormsgpaneComponent {
  @Input() errorMessage: string = null;
}
