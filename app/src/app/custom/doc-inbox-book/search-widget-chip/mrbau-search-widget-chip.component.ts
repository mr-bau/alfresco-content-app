/*!
 * @license
 * Copyright 2019 Alfresco Software, Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Component, ElementRef, Input, ViewChild, ViewEncapsulation } from '@angular/core';
import { ConfigurableFocusTrap, ConfigurableFocusTrapFactory } from '@angular/cdk/a11y';
import { MatMenuTrigger } from '@angular/material/menu';
import { SearchCategory, SearchWidgetContainerComponent,  } from '@alfresco/adf-content-services';
import * as moment from 'moment';
import { IMrbauSearchComponent } from '../mrbau-search-table-declarations';

@Component({
  selector: 'mrbau-search-widget-chip',
  templateUrl: './mrbau-search-widget-chip.component.html',
  encapsulation: ViewEncapsulation.None
})
export class MrbauSearchWidgetChipComponent  {

    @Input()
    category: SearchCategory;

    @Input()
    parent: IMrbauSearchComponent;

    @ViewChild('menuContainer', { static: false })
    menuContainer: ElementRef;

    @ViewChild('menuTrigger', { static: false })
    menuTrigger: MatMenuTrigger;

    @ViewChild(SearchWidgetContainerComponent, { static: false })
    widgetContainerComponent: SearchWidgetContainerComponent;

    focusTrap: ConfigurableFocusTrap;

    constructor(private focusTrapFactory: ConfigurableFocusTrapFactory) {}

    onMenuOpen() {
        if (this.menuContainer && !this.focusTrap) {
            this.focusTrap = this.focusTrapFactory.create(this.menuContainer.nativeElement);
            this.focusTrap.focusInitialElement();
        }
    }

    onClosed() {
        this.focusTrap.destroy();
        this.focusTrap = null;
    }

    onRemove() {
      switch (this.widgetContainerComponent.selector) {
        case 'check-list': this.onResetCheckList();break;
        case 'date-range': this.onResetDateRange();break;
      }

      this.menuTrigger.closeMenu();
    }

    onApply() {
      switch (this.widgetContainerComponent.selector) {
        case 'check-list': this.onApplyCheckList();break;
        case 'date-range': this.onApplyDateRange();break;
      }

      this.menuTrigger.closeMenu();
    }

    onResetCheckList() {
      const id = this.widgetContainerComponent.componentRef.instance.id;

      this.widgetContainerComponent.componentRef.instance.isActive = false;
      this.widgetContainerComponent.componentRef.instance.options.items.forEach((opt) => {
          opt.checked = false;
      });

      if (id && this.parent?.queryBuilder) {
        this.widgetContainerComponent.componentRef.instance.updateDisplayValue();

        this.parent.queryBuilder.queryFragments[id] = '';
        this.parent.queryBuilder.execute();
      }
    }

    onApplyCheckList() {
      const id = this.widgetContainerComponent.componentRef.instance.id;
      const operator = this.widgetContainerComponent.componentRef.instance.operator;

      const checkedValues = this.widgetContainerComponent.componentRef.instance.options.items
      .filter((option) => option.checked)
      .map((option) => option.value);
      const query = checkedValues.join(` ${operator} `);

      if (id && this.parent?.queryBuilder) {
        this.widgetContainerComponent.componentRef.instance.updateDisplayValue();

        this.parent.queryBuilder.queryFragments[id] = query;
        this.parent.queryBuilder.execute();
      }
    }

    onResetDateRange() {
      const id = this.widgetContainerComponent.componentRef.instance.id;

      this.widgetContainerComponent.componentRef.instance.isActive = false;
      this.widgetContainerComponent.componentRef.instance.form.reset({
            from: '',
            to: ''
        });
      this.widgetContainerComponent.componentRef.instance.setFromMaxDate();
      this.widgetContainerComponent.componentRef.instance.updateDisplayValue();

      this.parent.queryBuilder.queryFragments[id] = '';
      this.parent.queryBuilder.execute();
    }

    onApplyDateRange() {
      const id = this.widgetContainerComponent.componentRef.instance.id;
      const valid = this.widgetContainerComponent.componentRef.instance.form.valid;
      if (!valid){
        return;
      }
      const field = this.widgetContainerComponent.settings.field;
      const value = this.widgetContainerComponent.componentRef.instance.form.value;
      if (!value) {
        return;
      }
      const start = moment(value.from).startOf('day').format();
      const end = moment(value.to).endOf('day').format();

      if (valid && id && this.parent?.queryBuilder)
      {
        this.widgetContainerComponent.componentRef.instance.updateDisplayValue();

        this.parent.queryBuilder.queryFragments[id] = `${field}:['${start}' TO '${end}']`;
        this.parent.queryBuilder.execute();
      }
    }

    onEnterKeydown(): void {
        this.menuTrigger.openMenu();
    }
}
