import { Component, Output, EventEmitter, ChangeDetectionStrategy, ViewChild } from '@angular/core';
import { SplitAreaComponent, SplitComponent } from 'angular-split'
import { CommonModule } from '@angular/common';
import { AngularSplitModule } from 'angular-split';
@Component({
  standalone: true,
  imports: [
    CommonModule,
    AngularSplitModule,
  ],
  selector: 'mrbau-splitpane-belegsammlung',
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

        >
          <ng-content select="[splitAreaLeft]"></ng-content>
      </as-split-area>
      <as-split-area
        #areaRight
        [minSize]="10"
        [size]="size2"

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
  @ViewChild('split1') split1: SplitComponent | undefined;
  @ViewChild('split2') split2: SplitComponent | undefined;
  @ViewChild('areaLeft') areaLeft: SplitAreaComponent | undefined;
  @ViewChild('areaLeft1') areaLeft1: SplitAreaComponent | undefined;
  @ViewChild('areaLeft2') areaLeft2: SplitAreaComponent | undefined;
  @ViewChild('areaRight') area2Right: SplitAreaComponent | undefined;
  size1=25;
  size2=75;

  @Output() dragStartEvent = new EventEmitter<any>();
  @Output() dragEndEvent = new EventEmitter<any>();

  dragStart(event:any)
  {
    this.dragStartEvent.emit(event);
  }

  dragEnd(event:any)
  {
    this.dragEndEvent.emit(event);
  }

  constructor() { }
}
