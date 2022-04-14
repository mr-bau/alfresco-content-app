import { Component, OnInit } from '@angular/core';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';

interface AppTableEntry {
  name: string;
  link: string;
}

@Component({
  selector: 'aca-mrbau-extension-main',
  templateUrl: './mrbau-extension-main.component.html',
  styleUrls: ['./mrbau-extension-main.component.scss']
})
export class MrbauExtensionMainComponent implements OnInit {

    apps : AppTableEntry[] = [
      {name : 'Fördermanager', link : '/#/foerdermanager'},
      {name : 'MRBau UID Test', link : '/#/mrid/42'}
    ];

    drop(event: CdkDragDrop<string[]>) {
      moveItemInArray(this.apps, event.previousIndex, event.currentIndex);
    }

  constructor() { }

  ngOnInit(): void {
  }

}
