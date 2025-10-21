/*import { Component, Input } from '@angular/core';
import { EMRBauTaskStatus } from '../mrbau-task-declarations';
@Component({
  selector: 'mrbau-task-indicator',
  template: '<svg width="20px" height="20px"><circle cx="10" cy="10" r="10" [style.fill]="color()"/></svg>',
  styles: ['h1 { font-weight: normal; }']
})
export class TaskIndicatorComponent {
  @Input() status:EMRBauTaskStatus = 0;

  color(): string {
    switch (this.status) {
      default:
      case EMRBauTaskStatus.STATUS_NEW:
        return "darkgrey";
      case EMRBauTaskStatus.STATUS_IN_PROGRESS:
        return "cornflowerblue";
      case EMRBauTaskStatus.STATUS_ON_HOLD:
        return "goldenrod";
      case EMRBauTaskStatus.STATUS_NOTIFY_DONE:
      case EMRBauTaskStatus.STATUS_NOTIFY_APPROVED:
        return "darkgreen";
      case EMRBauTaskStatus.STATUS_NOTIFY_DECLINED:
        return "firebrick";
      case EMRBauTaskStatus.STATUS_FINISHED:
        return "darkgreen";
      case EMRBauTaskStatus.STATUS_CANCELED:
        return "firebrick";
    }
  }
}*/

import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  standalone:true,
  imports:[
    CommonModule,
  ],
  selector: 'mrbau-task-indicator',
  template: '<svg width="20px" height="20px"><circle cx="10" cy="10" r="10" [style.fill]="color()"/></svg>',
  styles: ['h1 { font-weight: normal; }']
})
export class TaskIndicatorComponent {
  @Input() prio:number | undefined;

  color(): string {
    return TaskIndicatorComponent.getColor(this.prio);
  }

  static readonly HIGH_PRIO_THRESHOLD = 3;
  static readonly MED_PRIO_THRESHOLD = 7;
  static getColor(prio: number | undefined | string): string {
    if (typeof prio == 'string')
      return "darkgrey";
    if (!prio && prio !== 0)
      return "darkgrey";
    else if (prio < TaskIndicatorComponent.HIGH_PRIO_THRESHOLD)
      return "darkred";
    else if (prio < TaskIndicatorComponent.MED_PRIO_THRESHOLD)
      return "orange";
    else
      return "darkgreen";
  }
}
