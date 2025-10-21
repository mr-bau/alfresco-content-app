import { Component, OnInit } from '@angular/core';
import {CdkDragDrop, CdkDropList, CdkDrag, moveItemInArray} from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';

interface AppTableEntry {
  name: string;
  link: string;
}

@Component({
  selector: 'mrbau-extension-main',
  standalone:true,
  templateUrl: './mrbau-extension-main.component.html',
  styleUrls: ['./mrbau-extension-main.component.scss'],
  imports: [CommonModule, CdkDropList, CdkDrag],
})
export class MrbauExtensionMainComponent implements OnInit {

    apps : AppTableEntry[] = [
      {name : 'Fördermanager', link : '/#/foerdermanager'},
      {name : 'Tasks', link : '/#/tasks'},
      {name : 'Belegsammlung', link : '/#/belege'},
      {name : 'MRBau UID Test', link : '/#/mrid/42'},
      {name : 'Common Test', link : '/#/common-test'},
      {name : 'PDF View', link : '/#/mrbaupdfview/ff68441f-34cf-4b8b-b34c-a2e53b6252e1'},
      {name : 'Formly Test', link : '/#/mrbauformlytest'},
    ];

    drop(event: CdkDragDrop<string[]>) {
      moveItemInArray(this.apps, event.previousIndex, event.currentIndex);
    }

  constructor() { }

  ngOnInit(): void {
  }

}
