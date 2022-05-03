import { Component, Input } from '@angular/core';

@Component({
  selector: 'aca-task-indicator',
  template: '<svg width="20px" height="20px"><circle cx="10" cy="10" r="10" [style.fill]="color()"/></svg>',
  styles: ['h1 { font-weight: normal; }']
})
export class TaskIndicatorComponent {
  @Input() status:number = 0;

  color(): string {
    switch (this.status) {
      default:
      case 0:
        return "darkgreen";
      case 1:
        return "darkred";
      case 2:
        return "orange";
    }
  }
}
