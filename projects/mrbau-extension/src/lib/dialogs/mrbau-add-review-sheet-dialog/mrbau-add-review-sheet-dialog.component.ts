import { Node, NodeAssociationEntry, NodeBodyUpdate } from '@alfresco/js-api';
import { ChangeDetectionStrategy, Component, inject, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ErrormsgpaneComponent } from '@mrbau/mrbau-common';
import { Subject, takeUntil } from 'rxjs';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, provideNativeDateAdapter } from '@angular/material/core';
import { MrbauCalcService } from '../../services/mrbau-calc.service';
import { AspectAmountDetails, AspectDeductionDetails, AspectDocumentIdentityDetails, AspectInboundInvoiceReviewDetails, AspectPaymentConditionDetails, AspectRetentionDetails, OrderTypes } from '../../declaration/mrbau-mrba-aspects';
import { MrbauNumberInputDirective } from './mrbau-number-input.directive';
import { CONST } from '../../declaration/mrbau-global-declarations';
import { NodesApiService } from '@alfresco/adf-content-services';
import { MrbauPdfLibService } from '../../pdf/pdf-lib/mrbau-pdf-lib.service';
import { ReviewSheetData, ReviewSheetTemplate } from '../../pdf/pdf-lib/mrbau-reviewsheet-template';
import { EDataServiceEvents, EPDFEventCommands, IEventData } from '../../services/mrbau-data.service';

@Component({
  standalone:true,
  imports:[
    CommonModule,
    ErrormsgpaneComponent,
    MatDialogModule,
    MatDatepickerModule,
    MatButtonModule, MatIconModule,
    MatNativeDateModule,
    MatSelectModule,
    MatInputModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MrbauNumberInputDirective,
  ],
  providers: [provideNativeDateAdapter()],
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'mrbau-add-review-sheet-dialog',
  templateUrl: 'mrbau-add-review-sheet-dialog.component.html',
  styleUrls: ['./mrbau-add-review-sheet-dialog.component.scss',],
  //encapsulation: ViewEncapsulation.None
})
export class MrbauAddReviewSheetDialogComponent implements OnInit {
  // Service Injection
  private mrbauPdfLibService = inject(MrbauPdfLibService);

  private destroy$ = new Subject<void>();
  node : Node | undefined;
  nodeAssociations : NodeAssociationEntry[] | undefined;
  errorMessage : string | null = null;
  title = 'Rechnungsprüfblatt';
  subtitle = '';
  form!: FormGroup;

  invoiceType : string = '';
  taxRate : number = 0 ;

  constructor(
    private fb: FormBuilder,
    private mrbauCalcService : MrbauCalcService,
    private nodesApiService : NodesApiService,
    private dialogRef: MatDialogRef<MrbauAddReviewSheetDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {payload: any})
  {
    this.errorMessage = null;
    this.node = undefined;
    this.nodeAssociations = undefined;
    if (data && data.payload)
    {
      this.node = data.payload.model['ignore:taskNode'];
      this.nodeAssociations = data.payload.model['ignore:taskNodeAssociations'];

      if (this.node?.nodeType != 'mrba:invoice')
      {
        this.errorMessage = "Unbekannter Dokumententyp!";
        this.node = undefined;
        this.nodeAssociations = undefined;
      }
    }
  }

  ngOnInit() {
    if (!this.node)
      return;
    this.initData();
    this.initForm();
    this.initAuftragssumme();
    this.initFormData();
    this.initFormRecalculate();
  }

  isBauleistungsRechnung() : boolean {
    return (this.taxRate && this.taxRate > 0) ? false : true;
  }

  isTeilRechnung() : boolean {
    return (this.invoiceType == 'Teilrechnung')
  }

  initAuftragssumme() {
    if (!this.nodeAssociations || this.nodeAssociations.length == 0)
    {
      return;
    }
    let ordersum = 0;
    let zasum = 0;
    for (let i=0; i<this.nodeAssociations.length; i++)
    {
      const na = this.nodeAssociations[i].entry;
      if (na.nodeType == 'mrba:order')
      {
        const val = na.properties['mrba:netAmountCents']/100;
        if (na.properties['mrba:orderType'] == OrderTypes.Auftrag)
        {
          ordersum += val;
        }
        else
        {
          zasum += val;
        }
      }
    }
    this.form.get('auftragssumme')?.setValue(ordersum);
    this.form.get('zasumme')?.setValue(zasum);
  }

  initData() {
    this.invoiceType = this.getValueFromPayloadModel('mrba:invoiceType');
    this.taxRate = this.mrbauCalcService.getNumberFromString(this.getValueFromPayloadModel('mrba:taxRate'));
    this.subtitle = (this.isTeilRechnung()) ? "für Teilrechnungen" : "für Schlussrechnungen";
    this.subtitle += (this.taxRate > 0) ? " - MWSt Rechnung" : " - Bauleistung";
  }

  initFormData() {
    this.form.get('bvh')?.setValue(this.getValueFromPayloadModel('mrba:projectName'));
    this.form.get('kt')?.setValue(this.getValueFromPayloadModel('mrba:costCarrierNumber'));

    this.initStringField('rechnungsnr', AspectDocumentIdentityDetails.documentNumber.key);
    this.initStringField('rechnungsdatum', AspectDocumentIdentityDetails.documentDate.key);
    this.initNumberField('rechnungsbetragnetto', AspectAmountDetails.netAmount.key);
    this.initNumberField('rechnungsbetragnettokorr', AspectDeductionDetails.netAmountPreDeduction.key);
    this.initNumberField('nzbauschaedenprozent', AspectDeductionDetails.deductionDamageUnassignedPercent.key);

    this.initNumberField('bauschaedennetto', AspectDeductionDetails.deductionDamageAssignedNetAmount.key);
    this.initNumberField('sonderabzuege', AspectDeductionDetails.deductionSpecialNetAmount.key);
    this.initNumberField('sonderabzuegepercent', AspectDeductionDetails.deductionSpecialPercent.key);

    this.initNumberField('schuttprozent', AspectDeductionDetails.deductionWastePercent.key);
    this.initNumberField('reinigungprozent', AspectDeductionDetails.deductionCleaningPercent.key);
    this.initNumberField('wcprozent', AspectDeductionDetails.deductionToiletsPercent.key);
    this.initNumberField('wasserprozent', AspectDeductionDetails.deductionWaterPercent.key);
    this.initNumberField('stromprozent', AspectDeductionDetails.deductionElectricityPercent.key);

    this.initNumberField('teilznetto', AspectDeductionDetails.deductionPreviousPaymentsNetAmount.key);

    this.initNumberField('deckungsruecklasspercent', AspectRetentionDetails.retentionDRLPercent.key);
    this.initNumberField('haftruecklasspercent', AspectRetentionDetails.retentionHRLPercent.key);
    this.initNumberField('skontopercent1', AspectPaymentConditionDetails.earlyPaymentDiscountPercent1.key);
    this.initNumberField('skontopercent2', AspectPaymentConditionDetails.earlyPaymentDiscountPercent2.key);
    this.initStringField('datumnet', AspectInboundInvoiceReviewDetails.paymentDateNet.key);
    this.initStringField('datumskonto1', AspectInboundInvoiceReviewDetails.paymentDateDiscount1.key);
    this.initStringField('datumskonto2', AspectInboundInvoiceReviewDetails.paymentDateDiscount2.key);

  }

  initStringField(name:string, key:string) {
    const value = this.getValueFromPayloadModel(key);
    this.form.get(name)?.setValue(value, { emitEvent: false });
  }

  initNumberField(name:string, key:string) {
    const value = this.mrbauCalcService.getNumberFromString(this.getValueFromPayloadModel(key));
    this.form.get(name)?.setValue(value, { emitEvent: false });
  }

  initForm() {
    this.form = this.fb.group({
      auftragssumme: [],
      zasumme: [],
      gesamtsumme: [{ value: null }],
      uebernahmedate: [],
      maengelfreimeldung: [],
      bvh: [],
      kt: [],
      gewerk: [],
      rechnungsnr: [],
      rechnungsdatum: [],
      rechnungsbetragnetto: [],
      rechnungskorrekturnetto: [],
      rechnungsbetragnettokorr : [],
      rechnungsbetragbruttokorr: [],
      rechnungsbetragbruttokorrref1: [],
      rechnungsbetragbruttokorrref2: [],
      nzbauschaedenprozent: [],
      rechnungsbetragnettokorr2: [],
      nzbauschaedennetto: [],
      sonderabzuegepercent: [],
      rechnungsbetragnettokorr3: [],
      sonderabzuegepercentnetto: [],
      bauschaedennetto: [],
      sonderabzuege: [],
      summeabzuegenetto: [],
      sumnetto1ref1: [],
      sumnetto1ref2: [],
      sumnetto1ref3: [],
      sumnetto1ref4: [],
      sumnetto1ref5: [],
      schuttprozent: [],
      schuttnetto: [],
      reinigungprozent: [],
      reinigungnetto: [],
      wcprozent: [],
      wcnetto: [],
      wasserprozent: [],
      wassernetto: [],
      stromprozent: [],
      stromnetto: [],
      sumumlage: [],
      sumnetto2: [],
      ustsumnetto2: [],
      brutto2: [],
      teilznetto: [],
      teilzmwst: [],
      teilzbrutto: [],
      einbehalt: [],
      deckungsruecklasspercent: [],
      deckungsruecklass: [],
      haftruecklasspercent: [],
      haftruecklass: [],
      haftruecklassdate: [],
      offenerbetrag: [],
      rechnungsbetragbruttokorrref3 : [],
      rechnungsbetragbruttokorrref4 : [],
      skontopercent1: [],
      skonto1: [],
      offenerbetragskonto1: [],
      datumnet: [],
      datumskonto1: [],
      datumskonto2: [],
      skontopercent2: [],
      skonto2: [],
      offenerbetragskonto2: [],
    });
  }

  initFormRecalculate() {
        /*this.form.get('auftragssumme')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.recalculate());*/
    this.form.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.recalculate();
    });
    this.recalculate();
  }

  onCalcValuesClicked() {
    this.recalculate();
  }

  private recalculate() {
    // Auftragssumme
    const auftragssumme = Number(this.form.get('auftragssumme')?.value) || 0;
    const zasumme = Number(this.form.get('zasumme')?.value) || 0;
    const gesamtsumme = auftragssumme + zasumme;
    this.form.get('gesamtsumme')?.setValue(gesamtsumme, { emitEvent: false });

    // Rechnung
    const rechnungsbetragnetto = Number(this.form.get('rechnungsbetragnetto')?.value) || 0
    const rechnungsbetragnettokorr = Number(this.form.get('rechnungsbetragnettokorr')?.value) || 0
    const rechnungskorrekturnetto = rechnungsbetragnetto - rechnungsbetragnettokorr;
    const rechnungsbetragbruttokorr = this.calcGross(rechnungsbetragnettokorr);
    this.form.get('rechnungskorrekturnetto')?.setValue(rechnungskorrekturnetto, { emitEvent: false });
    this.form.get('rechnungsbetragbruttokorr')?.setValue(rechnungsbetragbruttokorr, { emitEvent: false });
    this.form.get('rechnungsbetragbruttokorrref1')?.setValue(rechnungsbetragbruttokorr, { emitEvent: false });

    // Abzüge
    const nzbauschaedenprozent = Number(this.form.get('nzbauschaedenprozent')?.value) || 0;
    const nzbauschaedennetto = this.calcPercent(rechnungsbetragnettokorr, nzbauschaedenprozent);
    const bauschaedennetto = Number(this.form.get('bauschaedennetto')?.value) || 0;
    const sonderabzuege = Number(this.form.get('sonderabzuege')?.value) || 0;
    const sonderabzuegepercent = Number(this.form.get('sonderabzuegepercent')?.value) || 0;
    const sonderabzuegepercentnetto = this.calcPercent(rechnungsbetragnettokorr, sonderabzuegepercent);
    const summeabzuegenetto = nzbauschaedennetto + bauschaedennetto + sonderabzuege + sonderabzuegepercentnetto;
    this.form.get('rechnungsbetragnettokorr2')?.setValue(rechnungsbetragnettokorr, { emitEvent: false });
    this.form.get('rechnungsbetragnettokorr3')?.setValue(rechnungsbetragnettokorr, { emitEvent: false });
    this.form.get('nzbauschaedennetto')?.setValue(nzbauschaedennetto, { emitEvent: false });
    this.form.get('sonderabzuegepercentnetto')?.setValue(sonderabzuegepercentnetto, { emitEvent: false });
    this.form.get('summeabzuegenetto')?.setValue(summeabzuegenetto, { emitEvent: false });

    // Umlage
    this.form.get('sumnetto1ref1')?.setValue(rechnungsbetragnettokorr, { emitEvent: false });
    this.form.get('sumnetto1ref2')?.setValue(rechnungsbetragnettokorr, { emitEvent: false });
    this.form.get('sumnetto1ref3')?.setValue(rechnungsbetragnettokorr, { emitEvent: false });
    this.form.get('sumnetto1ref4')?.setValue(rechnungsbetragnettokorr, { emitEvent: false });
    this.form.get('sumnetto1ref5')?.setValue(rechnungsbetragnettokorr, { emitEvent: false });
    const schuttprozent = Number(this.form.get('schuttprozent')?.value) || 0;
    const schuttnetto = this.calcPercent(rechnungsbetragnettokorr, schuttprozent);
    this.form.get('schuttnetto')?.setValue(schuttnetto, { emitEvent: false });
    const reinigungprozent = Number(this.form.get('reinigungprozent')?.value) || 0;
    const reinigungnetto = this.calcPercent(rechnungsbetragnettokorr, reinigungprozent);
    this.form.get('reinigungnetto')?.setValue(reinigungnetto, { emitEvent: false });
    const wcprozent = Number(this.form.get('wcprozent')?.value) || 0;
    const wcnetto = this.calcPercent(rechnungsbetragnettokorr, wcprozent);
    this.form.get('wcnetto')?.setValue(wcnetto, { emitEvent: false });
    const wasserprozent = Number(this.form.get('wasserprozent')?.value) || 0;
    const wassernetto = this.calcPercent(rechnungsbetragnettokorr, wasserprozent);
    this.form.get('wassernetto')?.setValue(wassernetto, { emitEvent: false });
    const stromprozent = Number(this.form.get('stromprozent')?.value) || 0;
    const stromnetto = this.calcPercent(rechnungsbetragnettokorr, stromprozent);
    this.form.get('stromnetto')?.setValue(stromnetto, { emitEvent: false });
    const sumumlage = schuttnetto + reinigungnetto + wcnetto + wassernetto + stromnetto;
    this.form.get('sumumlage')?.setValue(sumumlage, { emitEvent: false });

    const sumnetto2 = rechnungsbetragnettokorr - summeabzuegenetto - sumumlage;
    const brutto2 = this.calcGross(sumnetto2);
    const ustsumnetto2 = brutto2 - sumnetto2;
    this.form.get('sumnetto2')?.setValue(sumnetto2, { emitEvent: false });
    this.form.get('ustsumnetto2')?.setValue(ustsumnetto2, { emitEvent: false });
    this.form.get('brutto2')?.setValue(brutto2, { emitEvent: false });
    this.form.get('rechnungsbetragbruttokorrref1')?.setValue(rechnungsbetragbruttokorr, { emitEvent: false });
    this.form.get('rechnungsbetragbruttokorrref2')?.setValue(rechnungsbetragbruttokorr, { emitEvent: false });
    this.form.get('rechnungsbetragbruttokorrref3')?.setValue(rechnungsbetragbruttokorr, { emitEvent: false });
    this.form.get('rechnungsbetragbruttokorrref4')?.setValue(rechnungsbetragbruttokorr, { emitEvent: false });

    const teilznetto = Number(this.form.get('teilznetto')?.value) || 0;
    const teilzbrutto = this.calcGross(teilznetto);
    const teilzmwst = teilzbrutto - teilznetto;
    const einbehalt = Number(this.form.get('einbehalt')?.value) || 0;
    const deckungsruecklasspercent = Number(this.form.get('deckungsruecklasspercent')?.value || 0);
    const haftruecklasspercent = Number(this.form.get('haftruecklasspercent')?.value) || 0;
    const deckungsruecklass = this.isTeilRechnung() ? this.calcPercent(rechnungsbetragbruttokorr, deckungsruecklasspercent) : 0;
    this.form.get('deckungsruecklass')?.setValue(deckungsruecklass, { emitEvent: false });
    let haftruecklass = this.calcHaftrücklass(rechnungsbetragbruttokorr, haftruecklasspercent);
    this.form.get('haftruecklass')?.setValue(haftruecklass, { emitEvent: false });

    const offenerbetrag = brutto2 - teilzbrutto - einbehalt - deckungsruecklass - haftruecklass;
    this.form.get('teilznetto')?.setValue(teilznetto, { emitEvent: false });
    this.form.get('teilzmwst')?.setValue(teilzmwst, { emitEvent: false });
    this.form.get('teilzbrutto')?.setValue(teilzbrutto, { emitEvent: false });

    this.form.get('offenerbetrag')?.setValue(offenerbetrag, { emitEvent: false });

    const skontopercent1 = Number(this.form.get('skontopercent1')?.value) || 0;
    const skonto1 = this.calcPercent(rechnungsbetragnettokorr, skontopercent1);
    const offenerbetragskonto1 = offenerbetrag - skonto1;
    this.form.get('skonto1')?.setValue(skonto1, { emitEvent: false });
    this.form.get('offenerbetragskonto1')?.setValue(offenerbetragskonto1, { emitEvent: false });

    const skontopercent2 = Number(this.form.get('skontopercent2')?.value) || 0;
    const skonto2 = this.calcPercent(rechnungsbetragnettokorr, skontopercent2);
    const offenerbetragskonto2 = offenerbetrag - skonto2;
    this.form.get('skonto2')?.setValue(skonto2, { emitEvent: false });
    this.form.get('offenerbetragskonto2')?.setValue(offenerbetragskonto2, { emitEvent: false });
  }

  private calcHaftrücklass(betrag:number, percent:number) : number
  {
    if (this.isTeilRechnung())
    {
      return 0;
    }
    let haftruecklass = this.calcPercent(betrag, percent);
    if (haftruecklass <= this.mrbauCalcService.getRetentionMinimumThreshold(this.invoiceType)) {
      haftruecklass = 0;
    }
    return haftruecklass;
  }

  getHaftruecklassLabel() {
    return this.isTeilRechnung() ? '' : '(>'+this.mrbauCalcService.getRetentionMinimumThreshold(this.invoiceType)+' oder 0)';
  }

  private getValueFromPayloadModel(key :string) {
    if (!this.node)
      return;
    // get data from form or node
    const propVal = this.node.properties[key];
    const modelVal = this.data.payload.model[key];
    return (modelVal) ? modelVal : propVal;
  }

  private calcGross(value:number) : number {
    if (this.taxRate && this.taxRate > 0) {
      const gross : number = Math.round(value * (100+this.taxRate) + Number.EPSILON)/100;
      return gross;
    }
    return value;
  }

  private calcNet(value:number) : number {
    if (this.taxRate && this.taxRate > 0) {
      const net = value / (1 + this.taxRate / 100);
      return Math.round((net + Number.EPSILON) * 100) / 100;
    }
    return value;
  }

  private calcPercent(value:number, percent:number) : number {
    if (percent > 0) {
      const gross : number = Math.round(value * percent + Number.EPSILON)/100;
      return gross;
    }
    return 0;
  }

  formatFormNumberAsString(name:string) {
    const val = this.form.get(name)?.value || 0;
    return this.mrbauCalcService.formatNumber(val);
  }

  async saveData(node : Node) : Promise<Node>
  {
    // save Properties to node
    let nodeBody : NodeBodyUpdate = {};
    nodeBody.properties = {};

    nodeBody.properties[AspectDeductionDetails.netAmountPreDeduction.key] = this.formatFormNumberAsString('rechnungsbetragnettokorr');
    nodeBody.properties[AspectDeductionDetails.deductionDamageUnassignedPercent.key] = this.formatFormNumberAsString('nzbauschaedenprozent');
    nodeBody.properties[AspectDeductionDetails.deductionDamageAssignedNetAmount.key] = this.formatFormNumberAsString('bauschaedennetto');
    nodeBody.properties[AspectDeductionDetails.deductionSpecialNetAmount.key] = this.formatFormNumberAsString('sonderabzuege');
    nodeBody.properties[AspectDeductionDetails.deductionSpecialPercent.key] = this.formatFormNumberAsString('sonderabzuegepercent');;
    nodeBody.properties[AspectDeductionDetails.deductionWastePercent.key] = this.formatFormNumberAsString('schuttprozent');;
    nodeBody.properties[AspectDeductionDetails.deductionCleaningPercent.key] = this.formatFormNumberAsString('reinigungprozent');;
    nodeBody.properties[AspectDeductionDetails.deductionToiletsPercent.key] = this.formatFormNumberAsString('wcprozent');
    nodeBody.properties[AspectDeductionDetails.deductionWaterPercent.key] = this.formatFormNumberAsString('wasserprozent');
    nodeBody.properties[AspectDeductionDetails.deductionElectricityPercent.key] = this.formatFormNumberAsString('stromprozent');;
    nodeBody.properties[AspectDeductionDetails.deductionPreviousPaymentsNetAmount.key] = this.formatFormNumberAsString('teilznetto');
    nodeBody.properties[AspectRetentionDetails.retentionDRLPercent.key] = this.formatFormNumberAsString('deckungsruecklasspercent');
    nodeBody.properties[AspectRetentionDetails.retentionHRLPercent.key] = this.formatFormNumberAsString('haftruecklasspercent');

    nodeBody.properties[AspectInboundInvoiceReviewDetails.grossAmountVerified.key] = this.formatFormNumberAsString('offenerbetrag');
    const ctr : any = this.form.controls;
    nodeBody.properties[AspectInboundInvoiceReviewDetails.netAmountVerified.key] = this.mrbauCalcService.formatNumber(this.calcNet(ctr['offenerbetrag'].value));
    const updatedNode = await this.nodesApiService.nodesApi.updateNode(node.id, nodeBody, {include:CONST.GET_NODE_DEFAULT_INCLUDE});
    return updatedNode.entry;
  }

    saveButtonDisabled() {
      return this.formIsInValid() || this.errorMessage;
    }

    formIsInValid() : boolean {
      return this.form.invalid;
    }

    async createPDFDocument() {
      if (!this.node)
        return;

      try {
        const newNode = await this.saveData(this.node);
        const pdfBytes = await this.createPDFFromData(this.node);

        // return updated node and new data
        this.node = newNode;
        const result : IEventData = {node: newNode, eventType : EDataServiceEvents.PDF_VIEWER_EVENT, eventCommand : EPDFEventCommands.ADD_PAGE_FIRST, eventData : pdfBytes}
        this.dialogRef.close(result);
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

    private createPDFFromData(node:Node) : Promise<Uint8Array<ArrayBufferLike>>
    {
      //this.node
      const data : ReviewSheetData = {
        node: node,
        auftragssumme: this.form.get('auftragssumme')?.value || 0,
        zasumme: this.form.get('zasumme')?.value || 0,
        gesamtsumme: this.form.get('gesamtsumme')?.value || 0,
        uebernahmedate: this.form.get('uebernahmedate')?.value,
        maengelfreimeldung: this.form.get('maengelfreimeldung')?.value,
        bvh: this.form.get('bvh')?.value || '',
        kt: this.form.get('kt')?.value || '',
        gewerk: this.form.get('gewerk')?.value || '',
        rechnungsnr: this.form.get('rechnungsnr')?.value || '',
        rechnungsdatum: this.form.get('rechnungsdatum')?.value || '',
        rechnungsbetragnetto: this.form.get('rechnungsbetragnetto')?.value || 0,
        rechnungskorrekturnetto: this.form.get('rechnungskorrekturnetto')?.value || 0,
        rechnungsbetragnettokorr: this.form.get('rechnungsbetragnettokorr')?.value || 0,
        rechnungsbetragbruttokorr: this.form.get('rechnungsbetragbruttokorr')?.value || 0,
        nzbauschaedenprozent: this.form.get('nzbauschaedenprozent')?.value || 0,
        nzbauschaedennetto: this.form.get('nzbauschaedennetto')?.value || 0,
        bauschaedennetto: this.form.get('bauschaedennetto')?.value || 0,
        sonderabzuege: this.form.get('sonderabzuege')?.value || 0,
        sonderabzuegepercent: this.form.get('sonderabzuegepercent')?.value || 0,
        sonderabzuegepercentnetto: this.form.get('sonderabzuegepercentnetto')?.value || 0,
        summeabzuegenetto: this.form.get('summeabzuegenetto')?.value || 0,
        schuttprozent: this.form.get('schuttprozent')?.value || 0,
        schuttnetto: this.form.get('schuttnetto')?.value || 0,
        reinigungprozent: this.form.get('reinigungprozent')?.value || 0,
        reinigungnetto: this.form.get('reinigungnetto')?.value || 0,
        wcprozent: this.form.get('wcprozent')?.value || 0,
        wcnetto: this.form.get('wcnetto')?.value || 0,
        wasserprozent: this.form.get('wasserprozent')?.value || 0,
        wassernetto: this.form.get('wassernetto')?.value || 0,
        stromprozent: this.form.get('stromprozent')?.value || 0,
        stromnetto: this.form.get('stromnetto')?.value || 0,
        sumumlage: this.form.get('sumumlage')?.value || 0,
        sumnetto2: this.form.get('sumnetto2')?.value || 0,
        ustsumnetto2: this.form.get('ustsumnetto2')?.value || 0,
        brutto2: this.form.get('brutto2')?.value || 0,
        taxRate: this.taxRate,
        teilznetto: this.form.get('teilznetto')?.value || 0,
        teilzmwst: this.form.get('teilzmwst')?.value || 0,
        teilzbrutto: this.form.get('teilzbrutto')?.value || 0,
        einbehalt: this.form.get('einbehalt')?.value || 0,
        deckungsruecklasspercent: this.form.get('deckungsruecklasspercent')?.value || 0,
        deckungsruecklass: this.form.get('deckungsruecklass')?.value || 0,
        haftruecklasspercent: this.form.get('haftruecklasspercent')?.value || 0,
        haftruecklass: this.form.get('haftruecklass')?.value || 0,
        haftruecklassdate: this.form.get('haftruecklassdate')?.value,
        haftruecklassLabel: this.getHaftruecklassLabel(),
        datumnet: this.form.get('datumnet')?.value,
        offenerbetrag: this.form.get('offenerbetrag')?.value || 0,
        skontopercent1: this.form.get('skontopercent1')?.value || 0,
        skonto1: this.form.get('skonto1')?.value || 0,
        offenerbetragskonto1: this.form.get('offenerbetragskonto1')?.value || 0,
        datumskonto1: this.form.get('datumskonto1')?.value,
        skontopercent2: this.form.get('skontopercent2')?.value || 0,
        skonto2: this.form.get('skonto2')?.value || 0,
        offenerbetragskonto2: this.form.get('offenerbetragskonto2')?.value || 0,
        datumskonto2: this.form.get('datumskonto2')?.value,
        isBauleistungsRechnung: this.isBauleistungsRechnung(),
        isTeilRechnung: this.isTeilRechnung(),
      };
      return this.mrbauPdfLibService.createFromTemplate(ReviewSheetTemplate, data);
    }


}

