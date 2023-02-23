import { Component, ElementRef, Input, ViewChild, ViewEncapsulation } from '@angular/core';
import { ConfigurableFocusTrap, ConfigurableFocusTrapFactory } from '@angular/cdk/a11y';
import { MatMenuTrigger } from '@angular/material/menu';
import { FacetField, SearchFacetFieldComponent } from '@alfresco/adf-content-services';
import { IMrbauSearchComponent } from '../mrbau-search-table-declarations';
import { MrbauSearchFacetFieldComponent } from '../mrbau-search-facet-field/mrbau-search-facet-field.component';

@Component({
  selector: 'mrbau-search-facet-chip',
  templateUrl: './mrbau-search-facet-chip.component.html',
  encapsulation: ViewEncapsulation.None
})
export class MrbauSearchFacetChipComponent {
    @Input()
    field: FacetField;

    @Input()
    parent: IMrbauSearchComponent;

    @ViewChild('menuContainer', { static: false })
    menuContainer: ElementRef;

    @ViewChild('menuTrigger', { static: false })
    menuTrigger: MatMenuTrigger;

    @ViewChild(MrbauSearchFacetFieldComponent, { static: false })
    facetFieldComponent: SearchFacetFieldComponent;

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
        this.facetFieldComponent.reset();
        this.menuTrigger.closeMenu();
    }

    onApply() {
        this.facetFieldComponent.submitValues();
        this.menuTrigger.closeMenu();
    }

    onEnterKeydown(): void {
        this.menuTrigger.openMenu();
    }
}
