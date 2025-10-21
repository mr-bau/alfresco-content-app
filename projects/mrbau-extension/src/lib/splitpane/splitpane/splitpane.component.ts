import { Component, Output, EventEmitter, OnInit, ChangeDetectionStrategy, ViewChild } from '@angular/core';
import { SplitComponent, SplitAreaComponent } from 'angular-split'
import { CommonModule } from '@angular/common';
import { AngularSplitModule } from 'angular-split';
@Component({
  standalone: true,
  imports: [
    CommonModule,
    AngularSplitModule,
  ],
  selector: 'mrbau-splitpane',
  templateUrl: './splitpane.component.html',
  styleUrls: ['./splitpane.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SplitpaneComponent implements OnInit {
  @ViewChild('split1') split1: SplitComponent | undefined;
  @ViewChild('split2') split2: SplitComponent | undefined;
  @ViewChild('areaLeft') areaLeft: SplitAreaComponent | undefined;
  @ViewChild('areaLeft1') areaLeft1: SplitAreaComponent | undefined;
  @ViewChild('areaLeft2') areaLeft2: SplitAreaComponent | undefined;
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
