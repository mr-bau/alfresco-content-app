import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormModule } from '@coreui/angular-pro';
import { NgOptionTemplateDirective, NgSelectComponent } from '@ng-select/ng-select';
import { IVendor } from '@mrbau/mrbau-extension';
import { Observable } from 'rxjs';

export interface IAutocompleteDropdownData {
  title:string,
  bindLabel:string,
  bindValue:string,
  onSearchFunction(term:string): Observable<any>,
  createDropDownString(item:any): string,
}

@Component({
   standalone:true,
    imports:[
      CommonModule,
      FormsModule,
      ReactiveFormsModule,

      FormModule,
      NgOptionTemplateDirective,
      NgSelectComponent,

  ],
  selector: 'mrbau-autocomplete-dropdown',
  templateUrl: './autocomplete-dropdown.component.html',
  styleUrls: ['./autocomplete-dropdown.component.scss'],
})
export class AutocompleteDropdown {
  @Input() data! : IAutocompleteDropdownData;
  @Output() onVendorChanged = new EventEmitter<null | string>();

  items$!: Observable<IVendor[]>;
  private _selectedItemId : null | string = null;
  get selectedItemId() {
    return this._selectedItemId;
  }
  set selectedItemId (val: null | string) {
    this._selectedItemId = val;
    this.onVendorChanged.emit(this._selectedItemId);
  }

  loadItems() {
    this.items$ = this.data.onSearchFunction('');
  }

  onSearch(term: string, items: any[]) {
    items;
    this.items$ = this.data.onSearchFunction(term);
  }

  createDropDownString(item :any) : string {
    return this.data.createDropDownString(item);
  }

  noClientFilter(term: string, item: any) {
    term;item;
   // Always return true so ng-select never filters anything
    return true;
  }
}
