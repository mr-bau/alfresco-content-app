import { Node, NodeBodyUpdate } from '@alfresco/js-api';
import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { FormlyFieldConfig, FormlyModule } from '@ngx-formly/core';
import { MrbauBaseDialogComponent } from '../mrbau-base-dialog/mrbau-base-dialog.component';
import { MrbauNewTaskDialogComponent } from '../mrbau-new-task-dialog/mrbau-new-task-dialog.component';

import { MrbauCommonService } from '../../services/mrbau-common.service';
import { REGEX_mrba_currencyIgnoreCharacters, REGEX_mrba_germanDecimalTwoDecimalPlace, REGEX_mrba_taxRateIgnoreCharacters } from '../../form/mrbau-formly-validators';
import { of } from 'rxjs';
import { MrbauConventionsService } from '../../services/mrbau-conventions.service';
import { tap } from 'rxjs/operators';
import { CONST } from '../../declaration/mrbau-global-declarations';
import { IAspectDetailItem, AspectDeductionDetails, AspectRetentionDetails } from '../../declaration/mrbau-mrba-aspects';
import { MrbauCalcService } from '../../services/mrbau-calc.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { NodesApiService } from '@alfresco/adf-content-services';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormlyMaterialModule } from '@ngx-formly/material';
import { ErrormsgpaneComponent } from '@mrbau/mrbau-common';

//import { CONST } from '../../mrbau-global-declarations';
  export const ResultDetails : { [key:string]: IAspectDetailItem } = {
    netAmountVerified                            : {key:"mrba:netAmountVerified", label:"Geprüfter Betrag Netto [€]", label_short:""},
    grossAmountVerified                          : {key:"mrba:grossAmountVerified", label:"Geprüfter Betrag Brutto [€]", label_short:""},
  }

@Component({
  standalone:true,
  imports:[
    CommonModule,
    ErrormsgpaneComponent,
    MatDialogModule,
    MatButtonModule, MatIconModule,
    MatSelectModule,
    MatInputModule, MatFormFieldModule,
    ReactiveFormsModule,
    FormlyModule,
    FormlyMaterialModule,
  ],
  selector: 'mrbau-calc-deduction-dialog',
  template: `
  <h2 mat-dialog-title>Abzugsberechnung</h2>
  <mrbau-errormsgpane [errorMessage]="errorMessage"></mrbau-errormsgpane>
  <mat-dialog-content>
    <form [formGroup]="form">
      <formly-form [form]="form" [fields]="fields" [options]="options" [model]="model" (modelChange)="modelChangeEvent()"></formly-form>
    </form>
  </mat-dialog-content>
  <mat-dialog-actions>
    <!-- The mat-dialog-close directive optionally accepts a value as a result for the dialog. -->
    <button mat-button color="primary" (click)="onCalcValuesClicked()">BERECHNEN</button>
    <button mat-button color="primary" (click)="onSaveClicked()" [disabled]="saveButtonDisabled()">SPEICHERN</button>
    <button mat-button mat-dialog-close>ABBRECHEN</button>
  </mat-dialog-actions>
  `,
  styleUrls: ['../mrbau-dialog-global.scss', '../../form/mrbau-form-global.scss','./mrbau-calc-deduction-dialog.component.scss',],
  encapsulation: ViewEncapsulation.None
})
export class MrbauCalcDeductionDialogComponent extends MrbauBaseDialogComponent implements OnInit {
  node : Node | undefined;
  errorMessage : string | null = null;
  override fields : FormlyFieldConfig[] = [];
  taxRate : number | undefined;
  invoiceType : string = '';
  calculationInProgress = false;
  autoCalc = false;

  constructor(
              private nodesApiService : NodesApiService,
              private mrbauConventionsService : MrbauConventionsService,
              private mrbauCommonService : MrbauCommonService,
              private mrbauCalcService : MrbauCalcService,
              private dialogRef: MatDialogRef<MrbauNewTaskDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: {payload: any}
  ) {
    super();
    this.node = undefined;
    if (data && data.payload)
    {
      this.node = data.payload.model['ignore:taskNode'];
    }
  }

  override ngOnInit(): void {
    // reset touched attribute for each FormlyFieldConfig control to avoid validation message on dialog open
    this.fields.forEach((val) => {val.fieldGroup?.forEach((x)=> x.formControl?.markAsUntouched())});

    this.dialogRef.afterClosed().subscribe(result => {
      this.onDialogClose(result);
    });
    this.mrbauCommonService;
    this.calculationInProgress = false;
    this.autoCalc = false;
    this.getData();
  }

  private setLabel(label: string) {
    this.fields.push(
    {
      fieldGroupClassName: 'flex-container-calc',
      fieldGroup: [
        {
          className: 'flex-2',
          template: label,
        },
      ]
    });
  }

  private setPropertyDeductionAmount(key : string, placeholder?: string, defaultValue?: any) {
    if (!this.node)
      return;

    defaultValue = defaultValue || undefined;
    placeholder = placeholder || 'Netto Betrag (z.B. 1.005,20)'
    let value = this.node.properties[AspectDeductionDetails[key].key] || defaultValue;

    this.model[AspectDeductionDetails[key].key] = value;
    this.fields.push(
      {
        fieldGroupClassName: 'flex-container-calc',
        fieldGroup: [
          {
            className: 'flex-1',
            key: AspectDeductionDetails[key].key,
            type: 'input',

            props: {
              label: AspectDeductionDetails[key].label,
              placeholder: placeholder,
              //appearance:"fill",
              //change: (field, $event)=>{
              //  field; $event;
              //  $event.get
              //  console.log(field);
              //  console.log($event);
              //},
            },
            hooks: {
              onInit: (field) => {
                return field.formControl?.valueChanges
                  .pipe(tap(value => {
                    value;
                    this.updateCalculatedValues();
                  }));
              },
            },
            modelOptions: {
              updateOn: 'blur',
            },
            validators: {
              validation: [
                { name: 'mrbauGermanDecimalValidatorAndConverter', options: { regExp : REGEX_mrba_currencyIgnoreCharacters } },
                { name: 'mrbauRegexValidator', options: REGEX_mrba_germanDecimalTwoDecimalPlace }]
            }
          }
        ]
      }
    )
  }

  private setPropertyDeductionPercent(key : string, properties? : any ) {
    this.setPropertyPercent(AspectDeductionDetails, key, this.mrbauConventionsService.deductionDefaultValues, properties);
  }
  private setPropertyRetentionPercent(key : string,  properties? : any ) {
    this.setPropertyPercent(AspectRetentionDetails, key, this.mrbauConventionsService.retentionDefaultValues, properties);
  }
  private setPropertyPercent(base : { [key:string]: IAspectDetailItem }, key : string, filter: string[],  properties? : any ) {
    if (!this.node)
      return;

    const defaultValue = properties?.defaultValue || undefined;
    const placeholder = properties?.placeholder || '% z.B. 3,00';
    const labelBetrag = properties?.labelBetrag || 'Betrag';
    let value = this.node.properties[base[key].key] || defaultValue;
    const keyName = base[key].key;
    this.model[base[key].key] = value;

    this.fields.push( {
      fieldGroupClassName: 'flex-container-calc',
      fieldGroup: [
      {
        className: 'flex-2',
        key: keyName,
        type: 'mrbauFormlyAutocomplete',
        props: {
          label: base[key].label,
          placeholder: placeholder,
          //appearance:"fill",
          filter: () => of(filter),
        },
        modelOptions: {
          updateOn: 'blur',
        },
        hooks: {
          onInit: (field) => {
            return field.formControl?.valueChanges
              .pipe(tap(value => {
                value;
                this.updateCalculatedValues();
              }));
          },
        },
        validators: {
          validation: [
              { name: 'mrbauGermanDecimalValidatorAndConverter', options: { regExp : REGEX_mrba_taxRateIgnoreCharacters, fractionDigits : 2 } },
              { name: 'mrbauRegexValidator', options: REGEX_mrba_germanDecimalTwoDecimalPlace },
          ],
        }
      },
      {
        className: 'flex-2',
        key: keyName+'1',
        type: 'mrbauFormlyLabel',
        props: {
          label: 'von',
          placeholder: 'NA',
          readonly: true,
        },
      },
      {
        className: 'flex-2 alignRight',
        key:  keyName+'2',
        type: 'mrbauFormlyLabel',
        props: {
          label: labelBetrag,
          placeholder: 'NA',
          readonly: true,
        },
      }
    ]
    });
  }

  private setResultLabelAmount(key : string) {
    this.fields.push(
      {
        fieldGroupClassName: 'flex-container-calc',
        fieldGroup: [
          {
            className: 'flex-1 alignRight',
            key: ResultDetails[key].key,
            type: 'mrbauFormlyLabel',
            props: {
              label: ResultDetails[key].label,
              placeholder: "N/A",
            },
          }
        ]
      }
    )
  }

  private getValueFromPayloadModel(key :string) {
    if (!this.node)
      return;
    // get data from form or node
    const propVal = this.node.properties[key];
    const modelVal = this.data.payload.model[key];
    return (modelVal) ? modelVal : propVal;
  }

  private getRetention() {
    return (this.invoiceType=='Teilrechnung') ? 'retentionDRLPercent' :'retentionHRLPercent';
  }

  private getRetentionLabelBetrag() {
    return (this.invoiceType=='Teilrechnung') ? undefined : 'Betrag (>'+this.mrbauCalcService.getRetentionMinimumThreshold(this.invoiceType)+' oder 0)';
  }

  private getNumberFromModel(key : string) : number {
    return this.mrbauCalcService.getNumberFromString(this.model[key]);
  }

  private calcPercent(base: number, key: string) : number {
    const keyVal : number = this.getNumberFromModel(key);
    const key1Val : number = base;
    let key2Val : number = Math.round(keyVal*key1Val + Number.EPSILON)/100;
    const ctr : any = this.form.controls;
    ctr[key].setValue(keyVal.toLocaleString('de-De'));
    ctr[key+'1'].setValue(key1Val.toLocaleString('de-De', {minimumFractionDigits: 2, maximumFractionDigits: 2}));
    ctr[key+'2'].setValue(key2Val.toLocaleString('de-De', {minimumFractionDigits: 2, maximumFractionDigits: 2}));
    return key2Val;
  }

  private calcRetention(base: number, key: string, minimumThreshold?:number) : number {
    const keyVal : number = this.getNumberFromModel(key);
    const key1Val : number = base;
    let key2Val : number = Math.round(keyVal*key1Val + Number.EPSILON)/100;
    if (minimumThreshold) {
      key2Val = Math.round(key2Val);
    }
    if (minimumThreshold && key2Val <= minimumThreshold) {
      key2Val = 0;
    }
    const ctr : any = this.form.controls;
    ctr[key].setValue(keyVal.toLocaleString('de-De'));
    ctr[key+'1'].setValue(key1Val.toLocaleString('de-De', {minimumFractionDigits: 2, maximumFractionDigits: 2}));
    ctr[key+'2'].setValue(key2Val.toLocaleString('de-De', {minimumFractionDigits: 2, maximumFractionDigits: 2}));
    return key2Val;
  }

  private ensurePositiveNumber(key: string) : number {
    let keyVal : number = this.getNumberFromModel(key);
    if (keyVal < 0) {
      keyVal = -1*keyVal;
    }
    const ctr : any = this.form.controls;
    ctr[key].setValue(keyVal.toLocaleString('de-De', {minimumFractionDigits: 2, maximumFractionDigits: 2}));
    return keyVal;
  }

  private getData() {
    this.errorMessage = null;

    if (!this.node)
    {
      this.errorMessage="Fehler: Keine Node ID angegeben!"
      return;
    }
    // load node from server
    try {
      this.invoiceType = this.getValueFromPayloadModel('mrba:invoiceType');
      this.taxRate = this.mrbauCalcService.getNumberFromString(this.getValueFromPayloadModel('mrba:taxRate'));

      // CREATE FORM and set model data
      this.setPropertyDeductionAmount('netAmountPreDeduction' );
      this.setLabel('Abzüge')
      this.setPropertyDeductionPercent('deductionDamageUnassignedPercent');
      this.setPropertyDeductionAmount('deductionDamageAssignedNetAmount');
      this.setPropertyDeductionAmount('deductionSpecialNetAmount');
      this.setPropertyDeductionPercent('deductionSpecialPercent');
      this.setLabel('Umlagen')
      this.setPropertyDeductionPercent('deductionWastePercent');
      this.setPropertyDeductionPercent('deductionCleaningPercent');
      this.setPropertyDeductionPercent('deductionToiletsPercent');
      this.setPropertyDeductionPercent('deductionWaterPercent');
      this.setPropertyDeductionPercent('deductionElectricityPercent');
      this.setLabel('Rücklass')
      this.setPropertyRetentionPercent(this.getRetention(), { labelBetrag: this.getRetentionLabelBetrag()});
      this.setLabel('Abzüglich Geleistete Zahlungen')
      this.setPropertyDeductionAmount('deductionPreviousPaymentsNetAmount');
      this.setLabel('Geprüfte Summe')
      this.setResultLabelAmount('netAmountVerified');
      if (this.taxRate > 0) {
        this.setResultLabelAmount('grossAmountVerified');
      }

    } catch (error) {
      this.errorMessage=''+error;
    }
  }

  onCalcValuesClicked() {
    this.calculationInProgress = true;
    this.autoCalc = true;
    let key : string;
    const deductions : number[] = [];
    //const retentions : number[] = [];
    key = AspectDeductionDetails.netAmountPreDeduction.key;
    const netAmountPreDeduction : number = this.getNumberFromModel(key);
    const ctr : any = this.form.controls;
    ctr[key].setValue(netAmountPreDeduction.toLocaleString('de-De'));

    deductions.push(this.calcPercent(netAmountPreDeduction, AspectDeductionDetails.deductionDamageUnassignedPercent.key));
    deductions.push(this.ensurePositiveNumber(AspectDeductionDetails.deductionDamageAssignedNetAmount.key));
    deductions.push(this.ensurePositiveNumber(AspectDeductionDetails.deductionSpecialNetAmount.key));
    deductions.push(this.calcPercent(netAmountPreDeduction, AspectDeductionDetails.deductionSpecialPercent.key));

    deductions.push(this.calcPercent(netAmountPreDeduction, AspectDeductionDetails.deductionWastePercent.key));
    deductions.push(this.calcPercent(netAmountPreDeduction, AspectDeductionDetails.deductionCleaningPercent.key));
    deductions.push(this.calcPercent(netAmountPreDeduction, AspectDeductionDetails.deductionToiletsPercent.key));
    deductions.push(this.calcPercent(netAmountPreDeduction, AspectDeductionDetails.deductionWaterPercent.key));
    deductions.push(this.calcPercent(netAmountPreDeduction, AspectDeductionDetails.deductionElectricityPercent.key));

    deductions.push(this.ensurePositiveNumber(AspectDeductionDetails.deductionPreviousPaymentsNetAmount.key));

    deductions.push(this.calcRetention(netAmountPreDeduction, AspectRetentionDetails[this.getRetention()].key, this.mrbauCalcService.getRetentionMinimumThreshold(this.invoiceType)));

    let value = netAmountPreDeduction;
    for (let i=0; i<deductions.length; i++) {
      value -= deductions[i];
    }
    ctr[ResultDetails.netAmountVerified.key].setValue(value.toLocaleString('de-De', {minimumFractionDigits: 2, maximumFractionDigits: 2}));

    if (this.taxRate && this.taxRate > 0) {
      const gross : number = Math.round(value * (100+this.taxRate) + Number.EPSILON)/100;
      ctr[ResultDetails.grossAmountVerified.key].setValue(gross.toLocaleString('de-De', {minimumFractionDigits: 2, maximumFractionDigits: 2}));
    }

    this.calculationInProgress = false;
  }

  updateCalculatedValues() {
    if (this.calculationInProgress) {
      return;
    }
    if (this.autoCalc) {
      this.onCalcValuesClicked();
      return;
    }
  }

  async onSaveClicked()
  {
    this.errorMessage = null;
    try {
      // calc
      this.onCalcValuesClicked();

      // save Deduction Properties to node
      const properties : IAspectDetailItem[] = [...Object.values(AspectDeductionDetails), ...Object.values(AspectRetentionDetails), ...Object.values(ResultDetails)];
      let nodeBody : NodeBodyUpdate = { properties: {} };
      const ctr : any = this.form.controls;
      for (let i=0; i< properties.length; i++) {
        const key = properties[i].key;
        if (ctr[key] && nodeBody.properties) {
          nodeBody.properties[key] = ctr[key].value;
        }
      }
      if (nodeBody.properties && this.taxRate == 0) {
        nodeBody.properties[ResultDetails.grossAmountVerified.key] = ctr[ResultDetails.netAmountVerified.key].value;
      }
      if (this.node) {
        const updatedNode = await this.nodesApiService.nodesApi.updateNode(this.node.id, nodeBody, {include:CONST.GET_NODE_DEFAULT_INCLUDE});
        this.node = updatedNode.entry;
      }
      // return updated node
      this.dialogRef.close(this.node);
    } catch (error : any) {
      if (error?.error?.errorKey && error?.error?.briefSummary) {
        this.errorMessage= error.errorKey+' '+error.briefSummary;
      }
      else {
        this.errorMessage= ''+error;
      }
      console.log(error);
      return;
    }
  }

  onDialogClose(result:any) {
    result;
  }

  saveButtonDisabled() {
    return this.formIsInValid() || this.errorMessage || this.autoCalc == false;
  }
}

