import { Component, Output, EventEmitter, OnInit, ChangeDetectionStrategy, ViewChild } from '@angular/core';
import { SplitComponent, SplitAreaDirective, IOutputData } from 'angular-split'

@Component({
  selector: 'aca-splitpane-two-col',
  template: `
      <div id="splitPaneMain" style="width: 100%;height: 100%">
      <as-split
        #split1
        (dragStart)="dragStart($event)"
        (dragEnd)="dragEnd($event)"
        (gutterClick)="gutterClick($event)"
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
          style="overflow-y: hidden;"
          >
            <ng-content select="[splitAreaRight]"></ng-content>
        </as-split-area>
      </as-split>
    </div>
  `,
  styleUrls: [],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SplitpaneTwoColComponent implements OnInit {
  @ViewChild('split1') split1: SplitComponent
  @ViewChild('areaLeft') areaLeft: SplitAreaDirective
  @ViewChild('areaRight') area2Right: SplitAreaDirective
  _size1=60;
  _size2=40;

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

  ngOnInit(): void {
  }

  get size1() {
    return this._size1;
  }
  set size1(value) {
      this._size1 = value;
  }
  get size2() {
    return this._size2;
  }
  set size2(value) {
      this._size2 = value;
  }
  gutterClick(e) {
    e.gutterNum;
  }
}
