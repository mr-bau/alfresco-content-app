import { Component, Input, ViewEncapsulation } from '@angular/core';

import { MatCheckboxChange } from '@angular/material/checkbox';

import { TranslationService } from '@alfresco/adf-core';
import { Subject } from 'rxjs';
import { FacetField, FacetFieldBucket, SearchFacetFiltersService } from '@alfresco/adf-content-services';
import { FacetWidget } from '@alfresco/adf-content-services/lib/search/models/facet-widget.interface';
import { IMrbauSearchComponent } from '../mrbau-search-table-declarations';

@Component({
  selector: 'mrbau-search-facet-field',
  templateUrl: './mrbau-search-facet-field.component.html',
  styleUrls: ['./mrbau-search-facet-field.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class MrbauSearchFacetFieldComponent implements FacetWidget {

    @Input()
    field!: FacetField;

    @Input()
    parent: IMrbauSearchComponent;

    displayValue$: Subject<string> = new Subject<string>();

    constructor(private searchFacetFiltersService: SearchFacetFiltersService,
                private translationService: TranslationService) {
    }

    get canUpdateOnChange() {
      return  this.field.settings?.allowUpdateOnChange ?? true;
    }

    onToggleBucket(event: MatCheckboxChange, field: FacetField, bucket: FacetFieldBucket) {
        if (event && bucket) {
            if (event.checked) {
                this.selectFacetBucket(field, bucket);
            } else {
                this.unselectFacetBucket(field, bucket);
            }
        }
    }

    selectFacetBucket(field: FacetField, bucket: FacetFieldBucket) {
        if (bucket) {
            bucket.checked = true;
            this.parent.queryBuilder.addUserFacetBucket(field, bucket);
            this.searchFacetFiltersService.updateSelectedBuckets();
            if (this.canUpdateOnChange) {
                this.updateDisplayValue();
                this.parent.queryBuilder.update();
            }
        }
    }

    unselectFacetBucket(field: FacetField, bucket: FacetFieldBucket) {
        if (bucket) {
            bucket.checked = false;
            this.parent.queryBuilder.removeUserFacetBucket(field, bucket);
            this.searchFacetFiltersService.updateSelectedBuckets();
            if (this.canUpdateOnChange) {
                this.updateDisplayValue();
                this.parent.queryBuilder.update();
            }
        }
    }

    canResetSelectedBuckets(field: FacetField): boolean {
        if (field && field.buckets) {
            return field.buckets.items.some((bucket) => bucket.checked);
        }
        return false;
    }

    resetSelectedBuckets(field: FacetField) {
        if (field && field.buckets) {
            for (const bucket of field.buckets.items) {
                bucket.checked = false;
                this.parent.queryBuilder.removeUserFacetBucket(field, bucket);
            }
            this.searchFacetFiltersService.updateSelectedBuckets();
            if (this.canUpdateOnChange) {
                this.parent.queryBuilder.update();
            }
        }
    }

    getBucketCountDisplay(bucket: FacetFieldBucket): string {
        return bucket.count === null ? '' : `(${bucket.count})`;
    }

    updateDisplayValue(): void {
        if (!this.field.buckets?.items) {
            this.displayValue$.next('');
        } else {
            const displayValue = this.field.buckets?.items?.filter((item) => item.checked)
                .map((item) => this.translationService.instant(item.display || item.label))
                .join(', ');
            this.displayValue$.next(displayValue);
        }
    }

    reset(): void {
        this.resetSelectedBuckets(this.field);
        this.updateDisplayValue();
        this.parent.queryBuilder.update();
    }

    submitValues(): void {
        this.updateDisplayValue();
        this.parent.queryBuilder.update();
    }
}
