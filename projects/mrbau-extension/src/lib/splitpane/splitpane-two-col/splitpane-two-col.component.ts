import { Component, Output, EventEmitter, OnInit, ChangeDetectionStrategy, ViewChild } from '@angular/core';
import { SplitAreaComponent, SplitComponent } from 'angular-split'
import { CommonModule } from '@angular/common';
import { AngularSplitModule } from 'angular-split';
@Component({
  standalone: true,
  imports: [
    CommonModule,
    AngularSplitModule,
  ],
  selector: 'mrbau-splitpane-two-col',
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

          >
            <ng-content select="[splitAreaLeft]"></ng-content>
        </as-split-area>
        <as-split-area
          #areaRight
          [minSize]="10"
          [size]="size2"

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
  @ViewChild('split1') split1: SplitComponent | undefined;
  @ViewChild('areaLeft') areaLeft: SplitAreaComponent | undefined;
  @ViewChild('areaRight') area2Right: SplitAreaComponent | undefined;
  _size1=60;
  _size2=40;

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
  gutterClick(e:any) {
    e.gutterNum;
  }
}
