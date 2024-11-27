import { FieldTypeConfig } from '@ngx-formly/core';
import { FieldType } from '@ngx-formly/core';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';

@Component({
  selector: 'aca-mrbau-formly-label',
  template: `
  <p>{{value}}</p>
  `,
 })
 export class MrbauFormlyLabelComponent extends FieldType<FieldTypeConfig> implements OnInit {
  value : any;

  constructor(private cdr: ChangeDetectorRef) {
    super();
  }

  ngOnInit(): void {
    super.formControl.registerOnChange(() => {
      this.value = this.getValue();
      this.cdr.detectChanges();
    })
    this.value = this.getValue();
  }


  getValue() : any {
    if (this.props.disabled) {
      return '-';
    }
    return (this.formControl.value == null || this.formControl.value === "") ? this.props.placeholder : this.formControl.value;
  }

 }
