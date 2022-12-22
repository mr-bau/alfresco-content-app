import { Component, Output, EventEmitter, ChangeDetectionStrategy, ViewChild } from '@angular/core';
import { SplitComponent, SplitAreaDirective, IOutputData } from 'angular-split'

@Component({
  selector: 'aca-mrbau-splitpane-belegsammlung',
  template: `
    <div id="splitPaneMain" style="width: 100%;height: 100%;">
    <as-split
      #split1
      (dragStart)="dragStart($event)"
      (dragEnd)="dragEnd($event)"
      [disabled]="false"
      [gutterSize]="10"
      [restrictMove]="true"
      direction="horizontal"
      unit="percent"
    >
      <as-split-area
        #areaLeft
        [minSize]="10"
        [size]="size1"
        [order]="1"
        >
          <ng-content select="[splitAreaLeft]"></ng-content>
      </as-split-area>
      <as-split-area
        #areaRight
        [minSize]="10"
        [size]="size2"
        [order]="2"
        >
          <ng-content select="[splitAreaRight]"></ng-content>
      </as-split-area>
    </as-split>
  </div>
  `,
  styleUrls: [],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MrbauSplitpaneBelegsammlungComponent {
  @ViewChild('split1') split1: SplitComponent
  @ViewChild('split2') split2: SplitComponent
  @ViewChild('areaLeft') areaLeft: SplitAreaDirective
  @ViewChild('areaLeft1') areaLeft1: SplitAreaDirective
  @ViewChild('areaLeft2') areaLeft2: SplitAreaDirective
  @ViewChild('areaRight') area2Right: SplitAreaDirective
  size1=25;
  size2=75;

  @Output() dragStartEvent = new EventEmitter<IOutputData>();
  @Output() dragEndEvent = new EventEmitter<IOutputData>();

  dragStart(event)
  {
    this.dragStartEvent.emit(event);
  }

  dragEnd(event)
  {
    this.dragEndEvent.emit(event);
  }

  constructor() { }
}
