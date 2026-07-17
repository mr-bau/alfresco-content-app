import { FieldTypeConfig } from '@ngx-formly/core';
import { FieldType } from '@ngx-formly/core';
import { Component, OnInit } from '@angular/core';

@Component({
  standalone:true,
  imports:[

  ],
  selector: 'mrbau-formly-label',
  template: `
  <span>{{value}}</span>
  `,
 })
 export class MrbauFormlyLabelComponent extends FieldType<FieldTypeConfig> implements OnInit {
  value : any;

  constructor() {
    super();
  }

  ngOnInit(): void {
    super.formControl.registerOnChange(() => {
      this.value = ''+this.getValue();
    })
    this.value = ''+this.getValue();
  }


  getValue() : any {
    if (this.props.disabled) {
      return '-';
    }
    return (this.formControl.value == null || this.formControl.value === "") ? this.props.placeholder : this.formControl.value;
  }
 }
