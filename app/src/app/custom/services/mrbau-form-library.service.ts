import { Injectable } from '@angular/core';

import { FormlyFieldConfig } from '@ngx-formly/core';
import { CONST } from '../mrbau-global-declarations';
import { EMRBauTaskCategory, MRBauTaskStatusNamesReduced } from '../mrbau-task-declarations';
import { MrbauCommonService } from './mrbau-common.service';
import { MrbauConventionsService, ISelectFormOptions } from './mrbau-conventions.service';
import { MrbauArchiveModelService } from './mrbau-archive-model.service';
import { of } from 'rxjs';
import { germanParseFloat, REGEX_mrba_currencyIgnoreCharacters, REGEX_mrba_germanDecimalOneDecimalPlace, REGEX_mrba_germanDecimalTwoDecimalPlace, REGEX_mrba_taxRateIgnoreCharacters, REGEX_nonNegativeInt } from '../form/mrbau-formly-validators';

@Injectable({
  providedIn: 'root'
})
export class MrbauFormLibraryService {

  constructor(
    private mrbauConventionsService:MrbauConventionsService,
    private mrbauCommonService : MrbauCommonService,
    private mrbauArchiveModelService : MrbauArchiveModelService
    ) { }

  filterDefaultValues(name: string, values: string[]) : string[] {
    return values.filter(state => state.indexOf(name) === 0);
  }

  filterDefaultValuesSelectFormOptions(value: ISelectFormOptions, values: ISelectFormOptions[]) {
    const name = typeof value === 'string' ? value : value?.label;
    return values.filter(state =>
      state.label.toLowerCase().indexOf(name.toLowerCase()) === 0);
  }

  getByName(name : string) : FormlyFieldConfig
  {
    let val = eval("this."+name);
    return val;
  }

  getFormForNodeType(formTypeName : string, nodeType: string) :FormlyFieldConfig[]
  {
    // extract from doc model types
    let result : FormlyFieldConfig[] = [];
    let docModel = this.mrbauArchiveModelService.mrbauArchiveModel.mrbauArchiveModelTypes.filter(doc => doc.name == nodeType);
    //console.log(formTypeName+" "+nodeType);
    //console.log(docModel);
    if (docModel.length > 0)
    {
      const formDefinition = docModel[0].mrbauFormDefinitions[formTypeName]
      if (formDefinition)
      {
        formDefinition.formlyFieldConfigs.forEach((formElement) => result.push(this.getByName(formElement)))
        result.forEach((fc) => this.mrbauCommonService.patchFormFieldConfigRequiredPropertyRecursive(fc, formDefinition.mandatoryRequiredProperties));
      }
    }
    return result;
  }

  readonly common_comment : FormlyFieldConfig =
  {
    className: 'flex-1',
    key: 'comment',
    type: 'textarea',
    props: {
      label: 'Neuer Kommentar',
      description: 'Kommentar',
      maxLength: CONST.MAX_LENGTH_COMMENT,
      lines: 10
    }
  }

  readonly common_archiveModelTypes : FormlyFieldConfig =
  {
    className: 'flex-4',
    key: 'archiveModelTypes',
    type: 'select',
    props: {
      label: 'Dokumenten-Art auswählen',
      options: this.mrbauArchiveModelService.getArchiveModelTypesFormOptions(),
    },
  }

  readonly common_taskLinkedDocuments : FormlyFieldConfig =
  {
    className: 'flex-2',
    type: 'mrbauFormlyTaskLinkedDocuments',
    key: ['fileRefs','fileNames'],
    props: {
      text: 'Dokumente Hinzufügen',
      description: 'Verknüpfte Dokumente',
    },
  }

  readonly mrbt_status : FormlyFieldConfig =
  {
    className: 'flex-1',
    type: 'select',
    key: 'mrbt:status',
    props: {
      label: 'Status',
      options: MRBauTaskStatusNamesReduced
    },
  };

  readonly mrbt_description : FormlyFieldConfig =
  {
    className: 'flex-6',
    key: 'mrbt:description',
    type: 'input',
    props: {
      label: 'Aufgabe',
      description: 'Bezeichnung',
      maxLength: CONST.MAX_LENGTH_TASK_DESC,
    },
  }

  readonly mrbt_fullDescription : FormlyFieldConfig =
  {
    className: 'flex-6',
    key: 'mrbt:fullDescription',
    type: 'textarea',
    props: {
      label: 'Beschreibung',
      description: 'Beschreibung',
      maxLength: CONST.MAX_LENGTH_TASK_FULL_DESC,
      required: false,
    },
  }

  readonly mrbt_dueDateValue : FormlyFieldConfig =
  {
    className: 'flex-2',
    key: 'mrbt:dueDateValue',
    type: 'input',
    props: {
      label: 'Fällig bis',
      type: 'date',
    },
    validators: {
      validation: ['date-future'],
    },
  }

  readonly mrbt_priority : FormlyFieldConfig =
  {
    className: 'flex-2',
    key: 'mrbt:priority',
    type: 'select',
    props: {
      label: 'Priorität',
      placeholder: 'Placeholder',
      options: [
        { value: 1, label: 'Hoch' },
        { value: 2, label: 'Mittel', default: true },
        { value: 3, label: 'Niedrig'  },
      ],
    },
  }

  readonly mrbt_category : FormlyFieldConfig =
  {
    className: 'flex-3',
    key: 'mrbt:category',
    type: 'select',
    modelOptions: {
      updateOn: 'blur',
    },
    props: {
      label: 'Aufgabe auswählen',
      required: true,
      //change: (field , $event) => {console.log($event);console.log(field.model); },
      options: [
        {label: 'Eine Aufgabe sich selbst oder einem Kollegen zuweisen', value: EMRBauTaskCategory.CommonTaskGeneral, group: 'Allgemeine Aufgaben'},
        {label: 'Zur Information übermitteln', value: EMRBauTaskCategory.CommonTaskInfo, group: 'Allgemeine Aufgaben'},
        {label: 'Überprüfen und genehmigen (ein Überprüfer)', value: EMRBauTaskCategory.CommonTaskApprove, group: 'Allgemeine Aufgaben'},

        //{label: 'Spezielle Aufgabe 1', value: '2001', group: 'Spezielle Aufgabe'},
        //{label: 'Spezielle Aufgabe 2', value: '2002', group: 'Spezielle Aufgabe'},
        //{label: 'Spezielle Aufgabe 3', value: '2003', group: 'Spezielle Aufgabe'},
      ],
    },
  }

  readonly mrbt_assignedUserName : FormlyFieldConfig =
  {
    className: 'flex-2',
    key: 'mrbt:assignedUserName',
    type: 'select',
    props: {
      label: 'Mitarbeiter',
      options: this.mrbauCommonService.getPeopleObservable(),
      valueProp: 'id',
      labelProp: 'displayName',
    },
  }

  readonly mrba_organisationUnit : FormlyFieldConfig =
  {
    className: 'flex-4',
    key: 'mrba:organisationUnit',
    type: 'select',
    props: {
      label: 'Mandant auswählen',
      options: this.mrbauConventionsService.getOrganisationUnitFormOptions(),
    },
  };

  readonly mrba_companyId : FormlyFieldConfig =
  {
    className: 'flex-4',
    key: 'mrba:companyId',
    type: 'mrbauFormlyAutocompleteSelectFormOptions',
    props: {
      label: 'Firma auswählen',
      filter: (term) => of(term ? this.filterDefaultValuesSelectFormOptions(term, this.mrbauConventionsService.getVendorListFormOptions()) : this.mrbauConventionsService.getVendorListFormOptions().slice()),
      change: (field: FormlyFieldConfig) => {
        const mrba_company_fields = [
          'mrba:companyName',
          'mrba:companyVatID',
          'mrba:companyStreet',
          'mrba:companyZipCode',
          'mrba:companyCity',
          'mrba:companyCountryCode',
          ];
        if (field)
        {
          const data = field.model[field.key as string];
          const value = (data) ? data.value : undefined;
          const vendor = this.mrbauConventionsService.getVendor(value);
          for (const key of mrba_company_fields)
          {
            field.model[key] = (vendor) ? vendor[key] : undefined;
          }
        }
      }
    },
    hooks: {
      onInit : (field : FormlyFieldConfig) => {
          const key = field.key as string;
          if (field.model[key] || field.model[key] === 0)
          {
            // replace id value with entry object from list
            field.model[key] = this.mrbauConventionsService.getVendorListFormOption(field.model[key]);
          }
      }
    },
    validators: {
      validation: [{ name: 'mrbauAutocompleteValidator'}],
    },
  }

  readonly mrba_archivedDateValue : FormlyFieldConfig =
  {
    className: 'flex-2',
    key: 'mrba:archivedDateValue',
    type: 'input',
    props: {
      label: 'Eingangs Datum',
      type: 'date',
    }
  };

  readonly mrba_fiscalYear : FormlyFieldConfig =
  {
    className: 'flex-2',
    key: 'mrba:fiscalYear',
    type: 'input',
    props: {
      label: 'Fiskal-Jahr',
      type: 'number',
      min: new Date().getFullYear()-1,
      max: new Date().getFullYear()+1,
    },
    validators : {
      validation: [
        { name: 'mrbauRegexValidator', options: REGEX_nonNegativeInt }
      ],
    }
  }

  readonly mrba_documentTopic : FormlyFieldConfig =
  {
    className: 'flex-2',
    key: 'mrba:documentTopic',
    type: 'input',
    props: {
      label: 'Bezeichnung',
    }
  }

  readonly mrba_documentNumber : FormlyFieldConfig =
  {
    className: 'flex-2',
    key: 'mrba:documentNumber',
    type: 'input',
    props: {
      label: 'Nummer',
    }
  }

  readonly mrba_documentDateValue : FormlyFieldConfig =
  {
    className: 'flex-2',
    key: 'mrba:documentDateValue',
    type: 'input',
    props: {
      label: 'Datum',
      type: 'date',
    }
  }

  readonly mrba_netAmount : FormlyFieldConfig =
  {
    className: 'flex-2',
    key: 'mrba:netAmount',
    type: 'input',
    props: {
      label: 'Netto Betrag [€]',
      placeholder: 'Netto Betrag (z.B. 1.005,20)',
    },
    modelOptions: {
      updateOn: 'blur',
    },
    validators: {
      validation: [
        { name: 'mrbauGermanDecimalValidatorAndConverter', options: { regExp : REGEX_mrba_currencyIgnoreCharacters } },
        { name: 'mrbauRegexValidator', options: REGEX_mrba_germanDecimalTwoDecimalPlace },
        { name: 'mrbauNetGrossTaxRateValidatorAndConverter'},
      ],
    }
  }

  readonly mrba_grossAmount : FormlyFieldConfig =
  {
    className: 'flex-2',
    key: 'mrba:grossAmount',
    type: 'input',
    props: {
      label: 'Brutto Betrag [€]',
      placeholder: 'Brutto Betrag (z.B. 1.005,20)',
    },
    modelOptions: {
      updateOn: 'blur',
    },
    validators: {
      validation: [
        { name: 'mrbauGermanDecimalValidatorAndConverter', options: { regExp : REGEX_mrba_currencyIgnoreCharacters } },
        { name: 'mrbauRegexValidator', options: REGEX_mrba_germanDecimalTwoDecimalPlace },
        { name: 'mrbauNetGrossTaxRateValidatorAndConverter'},
      ],
    }

  }

  readonly mrba_taxRate : FormlyFieldConfig =
  {
    className: 'flex-2',
    key: 'mrba:taxRate', // d:text, mrba:germanDecimalOneDecimalPlace
    type: 'mrbauFormlyAutocomplete',
    props: {
      label: 'Steuersatz [%]',
      placeholder: 'Steuersatz in % z.B. 20,0',
      filter: (term) => of(term ? this.filterDefaultValues(term, this.mrbauConventionsService.taxRateDefaultValues) : this.mrbauConventionsService.taxRateDefaultValues.slice()),
    },
    modelOptions: {
      updateOn: 'blur',
    },
    validators: {
      validation: [
        { name: 'mrbauGermanDecimalValidatorAndConverter', options: { regExp : REGEX_mrba_taxRateIgnoreCharacters, fractionDigits : 1 } },
        { name: 'mrbauRegexValidator', options: REGEX_mrba_germanDecimalOneDecimalPlace },
        { name: 'mrbauNetGrossTaxRateValidatorAndConverter'},
      ],
    }
  }

  readonly mrba_taxRateComment : FormlyFieldConfig =
  {
    className: 'flex-2',
    key: 'mrba:taxRateComment',
    type: 'input',
    props: {
      label: 'Optionaler Kommentar',
    }
  }
/*
  readonly mrba_costCarrierNumber : FormlyFieldConfig =
  {
    className: 'flex-2',
    key: 'mrba:costCarrierNumber',
    type: 'input',
    props: {
      label: 'Kostenträger',
      pattern: /^[0-9]*$/,
      type: 'number',
    },
    validation: {
      messages: {
        pattern: () => 'Ungültige Nummer',
      },
    },
  }
*/
  readonly mrba_costCarrierNumber : FormlyFieldConfig =
  {
    className: 'flex-2',
    key: 'mrba:costCarrierNumber',
    type: 'mrbauFormlyAutocompleteSelectFormOptions',
    props: {
      label: 'Kostenträger',
      filter: (term) => of(term ? this.filterDefaultValuesSelectFormOptions(term, this.mrbauConventionsService.getKtListFormOptions()) : this.mrbauConventionsService.getKtListFormOptions().slice()),
      change: (field: FormlyFieldConfig) => {
        if (field)
        {
          const data = field.model[field.key as string];
          const value = (data) ? data.value : undefined;
          const kt = this.mrbauConventionsService.getCostCarrier(value);
          if (kt)
          {
            const control = field.form.get('mrba:projectName');
            if (control)
            {
              control.setValue(kt['mrba:projectName']);
            }
          }
        }
      }
    },
    hooks: {
      onInit : (field : FormlyFieldConfig) => {
          const key = field.key as string;
          if (field.model[key] || field.model[key] === 0)
          {
            // replace id value with entry object from list
            field.model[key] = this.mrbauConventionsService.getKtListFormOption(field.model[key]);
          }
      }
    },
    validators: {
      validation: [{ name: 'mrbauAutocompleteValidator', options: { values: this.mrbauConventionsService.getKtListFormOptions() } }],
    },
  }

  readonly mrba_projectName: FormlyFieldConfig =
  {
    className: 'flex-2',
    key: 'mrba:projectName',
    type: 'input',
    props: {
      label: 'Projektbezeichnung',
    }
  }

  readonly mrba_accountingId: FormlyFieldConfig =
  {
    className: 'flex-2',
    key: 'mrba:accountingId',
    type: 'input',
    props: {
      label: 'BMD Beleg Nr.',
      placeholder: 'z.B. ER102',
      maxLength: 32,
      minLength: 3,
    }
  }

  readonly duplicated_document_form : FormlyFieldConfig = {
    key: 'ignore:mrbauFormlyDuplicatedDocument',
    type: 'mrbauFormlyDuplicatedDocument',
    props: {
      required : true,
    }
  };

  readonly workflow_all_set_form : FormlyFieldConfig = {
      key: 'mrbauFormlyAllSet',
      type: 'mrbauFormlyAllSet',
  };

  readonly workflow_formal_review : FormlyFieldConfig = {
    key: 'mrbauFormlyAllSet',
    type: 'mrbauFormlyAllSet',
    props: {
      icon : 'send',
      title : 'Formale Rechnungsprüfung abgeschlossen.',
      subtitle : 'Klicken Sie auf Weiterleiten um die Sachliche Rechnungsprüfung zu starten.'
    }
  };

  readonly workflow_invoice_review : FormlyFieldConfig = {
    key: 'mrbauFormlyAllSet',
    type: 'mrbauFormlyAllSet',
    props: {
      icon : 'send',
      title : 'Sachliche Rechnungsprüfung abgeschlossen.',
      subtitle : 'Klicken Sie auf Weiterleiten um die Rechnung an die Buchhaltung weiterzuleiten.'
    }
  };

  readonly workflow_invoice_approval : FormlyFieldConfig = {
    key: 'mrbauFormlyAllSet',
    type: 'mrbauFormlyAllSet',
    props: {
      icon : 'send',
      title : 'Freigabe',
      subtitle : 'Klicken Sie auf Weiterleiten um die Rechnung an die Buchhaltung weiterzuleiten.'
    }
  };

  readonly mrba_orderType : FormlyFieldConfig =
  {
    className: 'flex-4',
    key: 'mrba:orderType',
    type: 'select',
    defaultValue: this.mrbauConventionsService.getOrderTypeFormOptions()[0].value,
    props: {
      label: 'Auftrags-Typ auswählen',
      options: this.mrbauConventionsService.getOrderTypeFormOptions(),
      required: true,
    },
  };

  readonly mrba_reviewDaysPartialInvoice: FormlyFieldConfig =
  {
    className: 'flex-2',
    key: 'mrba:reviewDaysPartialInvoice',
    type: 'mrbauFormlyAutocomplete',
    props: {
      label: 'Prüffrist Anzahlungsrechnungen [Tage]',
      placeholder: 'z.B. 14',
      filter: (term) => of(term ? this.filterDefaultValues(term, this.mrbauConventionsService.reviewDaysDefaultValues) : this.mrbauConventionsService.reviewDaysDefaultValues.slice()),
      pattern: REGEX_nonNegativeInt,
    },
    expressions: {
      hide: "model['mrba:inboundInvoiceType']!='Anzahlung'",
    }
  }

  readonly mrba_reviewDaysFinalInvoice: FormlyFieldConfig =
  {
    className: 'flex-2',
    key: 'mrba:reviewDaysFinalInvoice',
    type: 'mrbauFormlyAutocomplete',
    props: {
      label: 'Prüffrist Schlussrechnungen [Tage]',
      placeholder: 'z.B. 30',
      filter: (term) => of(term ? this.filterDefaultValues(term, this.mrbauConventionsService.reviewDaysDefaultValues) : this.mrbauConventionsService.reviewDaysDefaultValues.slice()),
      pattern: REGEX_nonNegativeInt,
    }
  }

  readonly mrba_paymentTargetDays: FormlyFieldConfig =
  {
    className: 'flex-2',
    key: 'mrba:paymentTargetDays',
    type: 'mrbauFormlyAutocomplete',
    props: {
      label: 'Nettofrist [Tage]',
      placeholder: 'z.B. 60',
      filter: (term) => of(term ? this.filterDefaultValues(term, this.mrbauConventionsService.reviewDaysDefaultValues) : this.mrbauConventionsService.reviewDaysDefaultValues.slice()),
      pattern: REGEX_nonNegativeInt,
    }
  }
  readonly mrba_earlyPaymentDiscountDays1: FormlyFieldConfig =
  {
    className: 'flex-2',
    key: 'mrba:earlyPaymentDiscountDays1',
    type: 'mrbauFormlyAutocomplete',
    props: {
      label: 'Skontofrist 1 [Tage]',
      placeholder: 'z.B. 28',
      filter: (term) => of(term ? this.filterDefaultValues(term, this.mrbauConventionsService.reviewDaysDefaultValues) : this.mrbauConventionsService.reviewDaysDefaultValues.slice()),
      pattern: REGEX_nonNegativeInt,
    }
  }
  readonly mrba_earlyPaymentDiscountDays2: FormlyFieldConfig =
  {
    className: 'flex-2',
    key: 'mrba:earlyPaymentDiscountDays2',
    type: 'mrbauFormlyAutocomplete',
    props: {
      label: 'Skontofrist 2 [Tage]',
      placeholder: 'z.B. 36',
      filter: (term) => of(term ? this.filterDefaultValues(term, this.mrbauConventionsService.reviewDaysDefaultValues) : this.mrbauConventionsService.reviewDaysDefaultValues.slice()),
      pattern: REGEX_nonNegativeInt,
    }
  }
  readonly mrba_earlyPaymentDiscountPercent1 : FormlyFieldConfig =
  {
    className: 'flex-2',
    key: 'mrba:earlyPaymentDiscountPercent1', //d:text mrba:germanDecimalTwoDecimalPlaces
    type: 'mrbauFormlyAutocomplete',
    props: {
      label: 'Skonto 1 [%]',
      placeholder: 'Skonto in % z.B. 3,00',
      filter: (term) => of(term ? this.filterDefaultValues(term, this.mrbauConventionsService.discountDefaultValues) : this.mrbauConventionsService.discountDefaultValues.slice()),
    },
    modelOptions: {
      updateOn: 'blur',
    },
    validators: {
      validation: [
        { name: 'mrbauGermanDecimalValidatorAndConverter', options: { regExp : REGEX_mrba_taxRateIgnoreCharacters, fractionDigits : 2 } },
        { name: 'mrbauRegexValidator', options: REGEX_mrba_germanDecimalTwoDecimalPlace },
      ],
    }
  }

  readonly mrba_earlyPaymentDiscountPercent2 : FormlyFieldConfig =
  {
    className: 'flex-2',
    key: 'mrba:earlyPaymentDiscountPercent2', //d:text mrba:germanDecimalTwoDecimalPlaces
    type: 'mrbauFormlyAutocomplete',
    props: {
      label: 'Skonto 2 [%]',
      placeholder: 'Skonto in % z.B. 2,00',
      filter: (term) => of(term ? this.filterDefaultValues(term, this.mrbauConventionsService.discountDefaultValues) : this.mrbauConventionsService.discountDefaultValues.slice()),
    },
    modelOptions: {
      updateOn: 'blur',
    },
    validators: {
      validation: [
        { name: 'mrbauGermanDecimalValidatorAndConverter', options: { regExp : REGEX_mrba_taxRateIgnoreCharacters, fractionDigits : 2 } },
        { name: 'mrbauRegexValidator', options: REGEX_mrba_germanDecimalTwoDecimalPlace },
      ],
    }
  }

  readonly mrba_inboundInvoiceType : FormlyFieldConfig =
  {
    className: 'flex-2',
    key: 'mrba:inboundInvoiceType', //d:text mrba:germanDecimalTwoDecimalPlaces
    type: 'select',
    defaultValue: this.mrbauConventionsService.getInvoiceTypeFormOptions()[0].value,
    props: {
      label: 'Rechnungs-Typ auswählen',
      options: this.mrbauConventionsService.getInvoiceTypeFormOptions(),
      required: true,
    },
  }

  readonly mrba_inboundPartialInvoiceNumber : FormlyFieldConfig =
  {
    className: 'flex-2',
    key: 'mrba:inboundPartialInvoiceNumber', //d:int
    type: 'input',
    props: {
      label: 'Teil-/Anzahlungsrechnung-Nummer (min=1, max=99)',
      placeholder: 'z.B. 1',
      type: 'number',
      min: 1,
      max: 99,
    },
    validation: {
      show: true,
    },
    expressions: {
      hide: "model['mrba:inboundInvoiceType']!='Anzahlung'",
      'props.required': "model['mrba:inboundInvoiceType']=='Anzahlung'",
    },
  }

  // ASPECT GROUPS
  readonly title_mrba_paymentConditionDetails : FormlyFieldConfig ={
    template: '<span class="form-group-title">Zahlungskonditionen</span>',
  };
  readonly aspect_mrba_paymentConditionDetails : FormlyFieldConfig = {
    //fieldGroupClassName: 'flex-container',
    fieldGroup: [ {
      fieldGroupClassName: 'flex-container',
      fieldGroup: [
        // netto
        this.mrba_paymentTargetDays,
        // Prüffristen
        this.mrba_reviewDaysFinalInvoice,
        this.mrba_reviewDaysPartialInvoice,
      ]},{
      fieldGroupClassName: 'flex-container',
      fieldGroup: [
        // Skonto 1
        this.mrba_earlyPaymentDiscountPercent1, // text
        //this.mrba_earlyPaymentDiscountPercentNumericValue1 //d:double kept in sync
        this.mrba_earlyPaymentDiscountDays1,
      ]},{
        fieldGroupClassName: 'flex-container',
        fieldGroup: [
        // Skonte 2
        this.mrba_earlyPaymentDiscountPercent2, // text
        //this.mrba_earlyPaymentDiscountPercentNumericValue2 //d:double kept in sync
        this.mrba_earlyPaymentDiscountDays2,
      ]}
    ]
  };

  readonly title_mrba_inboundInvoiceType : FormlyFieldConfig ={
    template: '<span class="form-group-title">Rechnungs-Typ</span>',
  };
  readonly element_mrba_inboundInvoiceType : FormlyFieldConfig = {
    fieldGroupClassName: 'flex-container',
    fieldGroup: [
      this.mrba_inboundInvoiceType,
      this.mrba_inboundPartialInvoiceNumber
    ],
  };

  readonly title_mrba_orderType : FormlyFieldConfig ={
    template: '<span class="form-group-title">Auftrags-Typ</span>',
  };
  readonly element_mrba_orderType : FormlyFieldConfig = {
    fieldGroupClassName: 'flex-container',
    fieldGroup: [this.mrba_orderType],
  };

  readonly title_mrba_companyId : FormlyFieldConfig ={
    template: '<span class="form-group-title">Firma</span>',
  };
  readonly element_mrba_companyId : FormlyFieldConfig = {
    fieldGroupClassName: 'flex-container',
    fieldGroup: [this.mrba_companyId],
  };

  readonly title_mrba_documentIdentityDetails : FormlyFieldConfig = {
    template: '<span class="form-group-title">Dokument Eigenschaften</span>',
  };
  readonly aspect_mrba_documentIdentityDetails : FormlyFieldConfig = {
    fieldGroupClassName: 'flex-container',
    fieldGroup: [
        this.mrba_documentTopic,
        this.mrba_documentNumber,
        this.mrba_documentDateValue,
        //this.mrba_documentDate
    ]
  };

  readonly title_mrba_amountDetails_mrba_taxRate : FormlyFieldConfig ={
    template: '<span class="form-group-title">Betrag und Steuersatz</span>',
  };
  readonly aspect_mrba_amountDetails_mrba_taxRate : FormlyFieldConfig = {
    fieldGroupClassName: 'flex-container',
    fieldGroup: [
      //this.mrbauFormLibraryService.mrba_netAmountCents,    // d:int kept in sync with mrba:netAmount
      this.mrba_netAmount,         // d:text
      //this.mrbauFormLibraryService.mrba_grossAmountCents",  // d:int kept in sync with mrba:netAmount
      this.mrba_grossAmount,       // d:text
      this.mrba_taxRate,        // d:text, mrba:germanDecimalOneDecimalPlace
      //mrba:taxRatePercent, // d:double kept in sync with mrba:taxRate
      this.mrba_taxRateComment, // d:text
    ]
  };

  readonly aspect_mrba_amountDetails : FormlyFieldConfig = {
    fieldGroupClassName: 'flex-container',
    fieldGroup: [
      //this.mrbauFormLibraryService.mrba_netAmountCents,    // d:int kept in sync with mrba:netAmount
      this.mrba_netAmount,         // d:text
      //this.mrbauFormLibraryService.mrba_grossAmountCents",  // d:intkept in sync with mrba:netAmount
      this.mrba_grossAmount,       // d:text
    ]
  };

  readonly aspect_mrba_taxRate : FormlyFieldConfig = {
    fieldGroupClassName: 'flex-container',
    fieldGroup: [
      this.mrba_taxRate,        // d:text
      //mrba:taxRatePercent, // d:double kept in sync with mrba:taxRate
      this.mrba_taxRateComment, // d:text
    ]
  };

  readonly title_mrba_costCarrierDetails : FormlyFieldConfig ={
    template: '<span class="form-group-title">Kostenträger</span>',
  };
  readonly aspect_mrba_costCarrierDetails : FormlyFieldConfig = {
    fieldGroupClassName: 'flex-container',
    fieldGroup: [
      this.mrba_costCarrierNumber, //d:int
      this.mrba_projectName, //d:text
    ]
  };


  // Labels

  readonly title_mrba_documentSummary : FormlyFieldConfig ={
    template: '<span class="form-group-title">Rechnungsangaben</span>',
  };


  readonly label_mrba_taxRate : FormlyFieldConfig = {
    className: 'flex-2',
    key: 'mrba:taxRate',
    type: 'mrbauFormlyLabel',
    props: {
      label: 'Steuersatz [%]',
      readonly: true,
    }
  }

  readonly label_mrba_taxRateComment : FormlyFieldConfig = {
    className: 'flex-2',
    key: 'mrba:taxRateComment',
    type: 'mrbauFormlyLabel',
    props: {
      label: 'Optionaler Kommentar',
      readonly: true,
    },
    hideExpression: (model) => model['mrba:taxRateComment'] == null,
  }

  readonly label_mrba_archivedDateValue : FormlyFieldConfig = {
    className: 'flex-2',
    key: 'mrba:archivedDateValue',
    type: 'mrbauFormlyLabel',
    props: {
      label: 'Eingangs Datum',
      type: 'date',
      readonly: true,
    }
  }

  readonly label_mrba_netAmount : FormlyFieldConfig = {
    className: 'flex-2',
    key: 'mrba:netAmount',
    type: 'mrbauFormlyLabel',
    props: {
      label: 'Netto Betrag [€]',
      placeholder: '-',
      readonly: true,
    }
  }

  readonly label_mrba_paymentTargetDays : FormlyFieldConfig = {
    className: 'flex-2',
    key: 'mrba:paymentTargetDays',
    type: 'mrbauFormlyLabel',
    props: {
      label: 'Nettofrist [Tage]',
      placeholder: '-',
      readonly: true,
    }
  }

  readonly label_mrba_reviewDaysPartialInvoice : FormlyFieldConfig = {
    className: 'flex-2',
    key: 'mrba:reviewDaysPartialInvoice',
    type: 'mrbauFormlyLabel',
    props: {
      label: 'Prüffrist Anzahlungsrechnungen [Tage]',
      placeholder: '-',
      readonly: true,
    },
    hideExpression: (model) => model['mrba:reviewDaysPartialInvoice'] == null,
  }

  readonly label_mrba_reviewDaysFinalInvoice : FormlyFieldConfig = {
    className: 'flex-2',
    key: 'mrba:reviewDaysFinalInvoice',
    type: 'mrbauFormlyLabel',
    props: {
      label: 'Prüffrist Schlussrechnungen [Tage]',
      placeholder: '-',
      readonly: true,
    }
  }

  readonly label_mrba_earlyPaymentDiscountPercent1 : FormlyFieldConfig = {
    className: 'flex-2',
    key: 'mrba:earlyPaymentDiscountPercent1',
    type: 'mrbauFormlyLabel',
    props: {
      label: 'Skonto 1 [%]',
      placeholder: '-',
      readonly: true,
    },
    hideExpression: (model) => model['mrba:earlyPaymentDiscountPercent1'] == null,
  }

  readonly label_mrba_earlyPaymentDiscountDays1 : FormlyFieldConfig =
  {
    className: 'flex-2',
    key: 'mrba:earlyPaymentDiscountDays1', //d:text mrba:germanDecimalTwoDecimalPlaces
    type: 'mrbauFormlyLabel',
    props: {
      label: 'Skontofrist 1 [Tage]',
      placeholder: '-',
      readonly: true,
    },
    hideExpression: (model) => model['mrba:earlyPaymentDiscountPercent1'] == null,
  }

  readonly label_mrba_earlyPaymentDiscountPercent2 : FormlyFieldConfig = {
    className: 'flex-2',
    key: 'mrba:earlyPaymentDiscountPercent2',
    type: 'mrbauFormlyLabel',
    props: {
      label: 'Skonto 2 [%]',
      placeholder: '-',
      readonly: true,
    },
    hideExpression: (model) => model['mrba:earlyPaymentDiscountPercent2'] == null,
  }

  readonly label_mrba_earlyPaymentDiscountDays2 : FormlyFieldConfig =
  {
    className: 'flex-2',
    key: 'mrba:earlyPaymentDiscountDays2', //d:text mrba:germanDecimalTwoDecimalPlaces
    type: 'mrbauFormlyLabel',
    props: {
      label: 'Skontofrist 2 [Tage]',
      placeholder: '-',
      readonly: true,
    },
    hideExpression: (model) => model['mrba:earlyPaymentDiscountPercent2'] == null,
  }

  readonly label_mrba_netAmountVerified : FormlyFieldConfig =
  {
    className: 'flex-2',
    key: 'mrba:netAmountVerified', //d:text mrba:germanDecimalTwoDecimalPlaces
    type: 'mrbauFormlyLabel',
    props: {
      label: 'Geprüfter Betrag Netto [€]',
      placeholder: '-',
      readonly: true,
    }
  }

  readonly label_mrba_verifyDateValue : FormlyFieldConfig = {
    className: 'flex-2',
    key: 'mrba:verifyDateValue',
    type: 'mrbauFormlyLabel',
    props: {
      label: 'Prüfdatum',
      type: 'date',
      readonly: true,
    }
  }

  readonly label_mrba_paymentDateNetValue : FormlyFieldConfig = {
    className: 'flex-2',
    key: 'mrba:paymentDateNetValue',
    type: 'mrbauFormlyLabel',
    props: {
      label: 'Überweisungsdatum Netto',
      type: 'date',
      readonly: true,
    },
  }

  multiplyPercent(field:FormlyFieldConfig, nameValue : string, namePercent:string, nameResult: string)
  {
    let val = germanParseFloat(field.form.get(nameValue) == null ? undefined : field.form.get(nameValue).value);
    const percent = germanParseFloat(field.form.get(namePercent) == null ? undefined : field.form.get(namePercent).value);
    const valueFloat = val*(100-percent)/100;
    const value = (isNaN(valueFloat)) ? '-' : valueFloat.toLocaleString('de-De', {minimumFractionDigits: 2, maximumFractionDigits: 2});
    const result = field.form.get(nameResult);
    if (result)
    {
      result.setValue(value);
    }
  }

  readonly label_calcPaymentValueDiscount1 : FormlyFieldConfig = {
    className: 'flex-2',
    key: 'ignore:calcPaymentValueDiscount1',
    type: 'mrbauFormlyLabel',
    props: {
      label: 'Betrag Skonto 1 [€]',
      readonly: true,
    },
    hooks: {
      afterContentInit: (field) => {
        this.multiplyPercent(field,'mrba:netAmountVerified', 'mrba:earlyPaymentDiscountPercent1','ignore:calcPaymentValueDiscount1');
      },
    },
    hideExpression: (model) => model['mrba:earlyPaymentDiscountPercent1'] == null,
  }

  readonly label_calcPaymentValueDiscount2 : FormlyFieldConfig = {
    className: 'flex-2',
    key: 'ignore:calcPaymentValueDiscount2',
    type: 'mrbauFormlyLabel',
    props: {
      label: 'Betrag Skonto 2 [€]',
      readonly: true,
    },
    hooks: {
      afterContentInit: (field) => {
        this.multiplyPercent(field,'mrba:netAmountVerified', 'mrba:earlyPaymentDiscountPercent2','ignore:calcPaymentValueDiscount2');
      },
    },
    hideExpression: (model) => model['mrba:earlyPaymentDiscountPercent2'] == null,
  }

  readonly label_mrba_paymentDateDiscount1Value : FormlyFieldConfig = {
    className: 'flex-2',
    key: 'mrba:paymentDateDiscount1Value',
    type: 'mrbauFormlyLabel',
    props: {
      label: 'Überweisungsdatum Skonto 1',
      type: 'date',
      readonly: true,
    },
    hideExpression: (model) => model['mrba:earlyPaymentDiscountPercent1'] == null,
  }

  readonly label_mrba_paymentDateDiscount2Value : FormlyFieldConfig = {
    className: 'flex-2',
    key: 'mrba:paymentDateDiscount2Value',
    type: 'mrbauFormlyLabel',
    props: {
      label: 'Überweisungsdatum Skonto 2',
      type: 'date',
      readonly: true,
    },
    hideExpression: (model) => model['mrba:earlyPaymentDiscountPercent2'] == null,
  }


  readonly label_group_taxRate : FormlyFieldConfig = {
    fieldGroupClassName: 'flex-container',
    fieldGroup: [
      this.label_mrba_taxRate,
      this.label_mrba_taxRateComment,
    ]
  };

  readonly label_group_paymentNet : FormlyFieldConfig = {
    fieldGroupClassName: 'flex-container',
    fieldGroup: [
      this.label_mrba_netAmountVerified,
      this.label_mrba_paymentDateNetValue,
    ]
  };

  readonly label_group_paymentDiscount1 : FormlyFieldConfig = {
    fieldGroupClassName: 'flex-container',
    fieldGroup: [
      this.label_calcPaymentValueDiscount1,
      this.label_mrba_earlyPaymentDiscountPercent1,
      this.label_mrba_paymentDateDiscount1Value,
    ]
  };

  readonly label_group_paymentDiscount2 : FormlyFieldConfig = {
    fieldGroupClassName: 'flex-container',
    fieldGroup: [
      this.label_calcPaymentValueDiscount2,
      this.label_mrba_earlyPaymentDiscountPercent2,
      this.label_mrba_paymentDateDiscount2Value,
    ]
  };

  readonly label_group_reviewDays : FormlyFieldConfig = {
    fieldGroupClassName: 'flex-container',
    fieldGroup: [
      this.label_mrba_archivedDateValue,
      this.label_mrba_reviewDaysFinalInvoice,
      this.label_mrba_reviewDaysPartialInvoice,
    ]
  };

  readonly label_group_netPayment : FormlyFieldConfig = {
    fieldGroupClassName: 'flex-container',
    fieldGroup: [
      this.label_mrba_netAmount,
      this.label_mrba_paymentTargetDays,
    ]
  };

  readonly label_group_earlyPaymentDiscount1 : FormlyFieldConfig = {
    fieldGroupClassName: 'flex-container',
    fieldGroup: [
      this.label_mrba_earlyPaymentDiscountPercent1,
      this.label_mrba_earlyPaymentDiscountDays1,
    ]
  };

  readonly label_group_earlyPaymentDiscount2 : FormlyFieldConfig = {
    fieldGroupClassName: 'flex-container',
    fieldGroup: [
      this.label_mrba_earlyPaymentDiscountPercent2,
      this.label_mrba_earlyPaymentDiscountDays2,
    ]
  };

  // TODO sachliche Rechnungskorrektur



  readonly mrba_netAmountVerified : FormlyFieldConfig =
  {
    className: 'flex-2',
    key: 'mrba:netAmountVerified',
    type: 'input',
    props: {
      label: 'Geprüfter Betrag Netto [€]',
      placeholder: 'Netto Betrag geprüft (z.B. 1.005,20)',
    },
    modelOptions: {
      updateOn: 'blur',
    },
    validators: {
      validation: [
        { name: 'mrbauGermanDecimalValidatorAndConverter', options: { regExp : REGEX_mrba_currencyIgnoreCharacters } },
        { name: 'mrbauRegexValidator', options: REGEX_mrba_germanDecimalTwoDecimalPlace },
        { name: 'mrbauNetGrossTaxRateValidatorAndConverter'},
      ],
    }
  }
  readonly mrba_verifyDateValue : FormlyFieldConfig =
  {
    className: 'flex-2',
    key: 'mrba:verifyDateValue',
    type: 'input',
    props: {
      label: 'Prüfdatum',
      type: 'date',
    }
  }
  readonly mrba_paymentDateNetValue : FormlyFieldConfig =
  {
    className: 'flex-2',
    key: 'mrba:paymentDateNetValue',
    type: 'input',
    props: {
      label: 'Überweisungsdatum Netto',
      type: 'date',
    }
  }
  readonly mrba_paymentDateDiscount1Value : FormlyFieldConfig =
  {
    className: 'flex-2',
    key: 'mrba:paymentDateDiscount1Value',
    type: 'input',
    props: {
      label: 'Überweisungsdatum Skonto 1',
      type: 'date',
    }
  }
  readonly mrba_paymentDateDiscount2Value : FormlyFieldConfig =
  {
    className: 'flex-2',
    key: 'mrba:paymentDateDiscount2Value',
    type: 'input',
    props: {
      label: 'Überweisungsdatum Skonto 2',
      type: 'date',
    }
  }

  readonly title_mrba_verifyData : FormlyFieldConfig ={
    template: '<span class="form-group-title">Geprüfter Betrag</span>',
  };
  readonly title_mrba_verifyData2: FormlyFieldConfig ={
    template: '<span class="form-group-title">Datum Zahlung</span>',
  };
  readonly aspect_mrba_verifyData : FormlyFieldConfig = {
    fieldGroupClassName: 'flex-container',
    fieldGroup: [
      this.mrba_netAmountVerified,
    ]
  };
  readonly aspect_mrba_verifyData2 : FormlyFieldConfig = {
    fieldGroupClassName: 'flex-container',
    fieldGroup: [
      this.mrba_verifyDateValue,
      this.mrba_paymentDateNetValue,
      this.mrba_paymentDateDiscount1Value,
      this.mrba_paymentDateDiscount2Value,
    ]
  };
}


