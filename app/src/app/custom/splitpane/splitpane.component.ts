import { Component, Output, EventEmitter, OnInit, ChangeDetectionStrategy, ViewChild } from '@angular/core';
import { SplitComponent, SplitAreaDirective, IOutputData } from 'angular-split'

@Component({
  selector: 'aca-splitpane',
  templateUrl: './splitpane.component.html',
  styleUrls: ['./splitpane.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SplitpaneComponent implements OnInit {
  @ViewChild('split1') split1: SplitComponent
  @ViewChild('split2') split2: SplitComponent
  @ViewChild('areaLeft') areaLeft: SplitAreaDirective
  @ViewChild('areaLeft1') areaLeft1: SplitAreaDirective
  @ViewChild('areaLeft2') areaLeft2: SplitAreaDirective
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
