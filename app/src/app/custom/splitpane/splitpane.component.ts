import { Component, OnInit, ChangeDetectionStrategy, ViewChild } from '@angular/core';
import { SplitComponent, SplitAreaDirective } from 'angular-split'

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
    /*
    if (this.pageSplitDirection == 'horizontal')
    {
      this.pageSplitDirection = 'vertical';
    }
    else
    {
      this.pageSplitDirection = 'horizontal';
    }
    */
    e.gutterNum;
    /*
    if(e.gutterNum === 1) {
        if(this.size2 !== 0) {
            this.size1 += this.size2;
            this.size2 = 0;
        }
        else if(this.size2 === 0) {
            this.size1 -= 25;
            this.size2 = 25;
        }
        else {
            this.size1 = 75;
            this.size2 = 25;
        }
    }
    */
  }

}
