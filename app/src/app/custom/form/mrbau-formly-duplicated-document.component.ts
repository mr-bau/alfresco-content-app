
import { Component } from '@angular/core';
import { FieldType, FieldTypeConfig, FormlyFieldConfig,  } from '@ngx-formly/core';

@Component({
  selector: 'aca-mrbau-duplicated-document',
  template: `
    <h2>duplicated node found - todo</h2>
    <p>cancel task and delete document due to duplicate</p>
    <p>add document as new version</p>
  `,
})
export class MrbauFormlyDuplicatedDocumentComponent extends FieldType<FieldTypeConfig> {

  isValid(field: FormlyFieldConfig) {
    field;
    return false;
  }
}
