import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  //ContainerComponent, RowComponent, ColComponent,FormLabelDirective,FormDirective,
  FormControlDirective,
  InputGroupComponent,
  InputGroupTextDirective,
  ButtonDirective,
  FormCheckComponent, FormCheckInputDirective, FormCheckLabelDirective, ButtonCloseDirective } from '@coreui/angular-pro';
import { LoaderoverlayComponent } from '@mrbau/mrbau-common';
import { animate, style, transition, trigger } from '@angular/animations';
import { TranslateModule } from '@ngx-translate/core';

export interface IContextMenuData {
  title?: string,
  event?:any
  payload?: any,
  initial_checked?: string[],
  staticData? : IContextMenuListItem[]
  loadData?: () => Promise<IContextMenuListItem[] | undefined>,
  callback?: (result:IContextMenuResult) => void,
  sortByName?: boolean,
  sortChecked?: boolean,
}

export interface IContextMenuListItem {
  id:string,
  name:string,
  checked:boolean,
  visible:boolean,
}

export interface IContextMenuResult {
  list:string[],
  payload: any,
}

@Component({
   standalone:true,
    imports:[
      CommonModule,
      LoaderoverlayComponent,
      //ContainerComponent, RowComponent, ColComponent,
      TranslateModule,
      //FormDirective,
      FormCheckComponent,
      FormCheckInputDirective,
      FormCheckLabelDirective,
      ButtonCloseDirective,
      ButtonDirective,
      FormControlDirective,
      //FormLabelDirective,
      InputGroupComponent,
      InputGroupTextDirective,
      FormsModule, ReactiveFormsModule
  ],
  selector: 'mrbau-context-menu',
  templateUrl: './context-menu.component.html',
  styleUrls: ['./context-menu.component.scss'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.5)', transformOrigin: 'top right'}),
        animate('150ms ease-out', style({ opacity: 1, transform: 'scale(1)' }))
      ]),
      transition(':leave', [
        animate('100ms ease-in', style({ opacity: 0, transform: 'scale(0.5)', transformOrigin: 'top right'}))
      ])
    ]),
  ],
})
export class ContextMenu implements OnInit{
  title='';
  @ViewChild('contextMenuPanel') contextMenuPanel!: ElementRef;
  visible = false;
  loaderVisible = false;
  list : IContextMenuListItem[] = [];
  filteredList : IContextMenuListItem[] = [];
  posLeft = 0;
  posTop = 0;
  data : IContextMenuData | undefined;
  constructor()
  {}

  ngOnInit(): void {
  }

  async loadListData() {
    this.list = this.data?.staticData ? this.data.staticData : [];
    if (this.data?.loadData) {
      this.loaderVisible = true;
      try {
        const loadedData = await this.data?.loadData();
        if (loadedData) {
          for (let i=0; i<loadedData.length; i++) {
            loadedData[i].checked = false;
          }
          this.list.push(...loadedData);
        }
      }
      catch (error) {
        console.log(error)
      }
      this.loaderVisible =false;
    }

    if (this.data?.initial_checked) {
      for (let i=0; i<this.data.initial_checked.length; i++) {
        const id = this.data.initial_checked[i];
        const item = this.list.find(item => item.id == id);
        if (item) {
          item.checked = true
        }
      }
    }

    this.filteredList = this.list;
    this.sortFilteredList();
  }

  sortFilteredList() {
    if (this.data?.sortByName) {
      this.filteredList.sort((itemA,itemB) => {
          const a = itemA.name;
          const b = itemB.name;
          return a > b ? 1 : b > a ? -1 : 0;
      });
    }
    if (this.data?.sortChecked) {
      this.filteredList.sort((itemA,itemB) => {
          const a = !itemA.checked;
          const b = !itemB.checked;
          return a > b ? 1 : b > a ? -1 : 0;
      });
    }
  }

  closeButtonClicked(event:any) {
    event;
    this.visible = false;
  }

  setPosition(event:any) {
    this.posLeft = 0;
    this.posTop = 0;
    if (event?.target) {
      const buttonRect = event.target.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
      const top = buttonRect.bottom + scrollTop;
      const left= buttonRect.left + scrollLeft;

      const { innerWidth, innerHeight } = window;
      const offsetWidth = 280;
      const offsetHeight = 350;
      // Calculate the best position to stay in viewport
      const x = (left + offsetWidth > innerWidth) ? innerWidth - offsetWidth - 5 : left;
      const y = (top + offsetHeight > innerHeight) ? innerHeight - offsetHeight - 5 : top;
      this.posLeft = ((x < 0) ? 0 : x);
      this.posTop = ((y < 0) ? 0 : y);
    }
  }

  show(data : IContextMenuData) {
    this.data = data;
    this.visible = true;
    this.title = data.title || '';
    this.setPosition(data.event);
    this.loadListData();
  }

  onSearchKeypressEvent(event:any) {
    let val : string = (event.target as HTMLInputElement).value;
    if (val && val.length > 0) {
      val = val.toLowerCase();
      this.filteredList = this.list.filter(item => item.name.toLowerCase().includes(val));
      this.sortFilteredList();
    }
    else {
      this.filteredList =this.list;
      this.sortFilteredList();
    }
  }

  onCheckboxChanged(event:any) {
    const cb = (event.target as HTMLInputElement);
    const result  = this.list.find(item => item.id == cb.id);
    if (result)
    {
      result.checked = cb.checked;
    }
  }

  resetData() {
    for (let i=0; i<this.list.length; i++) {
      this.list[i].checked = false;
    }
  }

  applyData() {
    if (this.data?.callback) {
      const list = this.list.filter(val => val.checked).map(item => item.id);
      const result : IContextMenuResult = {list: list, payload: this.data.payload}
      this.data.callback(result);
    }
    this.visible = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.visible && this.data?.event != event && !this.contextMenuPanel?.nativeElement.contains(event.target))
    {
      this.closeButtonClicked(event);
    }
  }
}
