import { Injectable } from '@angular/core';

import { FormlyFieldConfig } from '@ngx-formly/core';
import { CONST } from '../mrbau-global-declarations';
import { EMRBauTaskCategory, MRBauTaskStatusNamesReduced } from '../mrbau-task-declarations';
import { MrbauCommonService } from './mrbau-common.service';
import { MrbauConventionsService, SelectFormOptions } from './mrbau-conventions.service';
import { MrbauArchiveModelService } from './mrbau-archive-model.service';
import { of } from 'rxjs';
import { notAValidValueValidationMessage, REGEX_mrba_germanDecimalOneDecimalPlace, REGEX_mrba_germanDecimalTwoDecimalPlace, REGEX_nonNegativeInt } from '../form/mrbau-formly-validators';

@Injectable({
  providedIn: 'root'
})
export class MrbauFormLibraryService {

  constructor(
    private mrbauConventionsService:MrbauConventionsService,
    private mrbauCommonService : MrbauCommonService,
    private mrbauArchiveModelService : MrbauArchiveModelService
    ) { }

    filterDefaultValues(name: string, values: string[]) {
      return values.filter(state =>
        state.toLowerCase().indexOf(name.toLowerCase()) === 0);
    }

    filterDefaultValuesSelectFormOptions(value: SelectFormOptions, values: SelectFormOptions[]) {
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
        result.forEach((fc) => this.patchFormFieldConfigRecursive(fc, formDefinition.mandatoryRequiredProperties));
      }
    }
    return result;
  }

  patchFormFieldConfigRecursive(formlyFieldConfig: FormlyFieldConfig, mandatoryRequiredProperties: string[])
  {
    let key = formlyFieldConfig.key as string;
    if (key)
    {
      if (mandatoryRequiredProperties.indexOf(key) >= 0)
      {
        formlyFieldConfig.templateOptions.required = true;
      }
      // else set not required
      else if (formlyFieldConfig.templateOptions && formlyFieldConfig.templateOptions.required)
      {
        formlyFieldConfig.templateOptions.required = false;
      }
    }
    if (formlyFieldConfig.fieldGroup)
    {
      formlyFieldConfig.fieldGroup.forEach( (fc) => this.patchFormFieldConfigRecursive(fc, mandatoryRequiredProperties))
    }
  }

  readonly common_comment : FormlyFieldConfig =
  {
    className: 'flex-1',
    key: 'comment',
    type: 'textarea',
    templateOptions: {
      label: 'Neuer Kommentar',
      description: 'Kommentar',
      lines: 10
    }
  }

  readonly common_archiveModelTypes : FormlyFieldConfig =
  {
    className: 'flex-4',
    key: 'archiveModelTypes',
    type: 'select',
    templateOptions: {
      label: 'Dokumenten-Art auswählen',
      options: this.mrbauConventionsService.getArchiveModelTypesFormOptions(),
    },
  }

  readonly common_taskLinkedDocuments : FormlyFieldConfig =
  {
    className: 'flex-3',
    type: 'taskLinkedDocuments',
    key: ['fileRefs','fileNames'],
    templateOptions: {
      text: 'Dokumente Hinzufügen',
      description: 'Verknüpfte Dokumente',
    },
  }

  readonly mrbt_status : FormlyFieldConfig =
  {
    className: 'flex-1',
    type: 'select',
    key: 'mrbt:status',
    templateOptions: {
      label: 'Status',
      options: MRBauTaskStatusNamesReduced
    },
  };

  readonly mrbt_description : FormlyFieldConfig =
  {
    className: 'flex-6',
    key: 'mrbt:description',
    type: 'input',
    templateOptions: {
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
    templateOptions: {
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
    templateOptions: {
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
    templateOptions: {
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
    templateOptions: {
      label: 'Aufgabe auswählen',
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
    templateOptions: {
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
    templateOptions: {
      label: 'Mandant auswählen',
      options: this.mrbauConventionsService.getOrganisationUnitFormOptions(),
    },
  };

  readonly mrba_companyId : FormlyFieldConfig =
  {
    className: 'flex-4',
    key: 'mrba:companyId',
    type: 'mrbauFormlyAutocompleteSelectFormOptions',
    templateOptions: {
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
    validators: {
      validation: [{ name: 'mrbauAutocompleteValidator', options: { values: this.mrbauConventionsService.getVendorListFormOptions() } }],
    },
  }

  readonly mrba_archivedDateValue : FormlyFieldConfig =
  {
    className: 'flex-2',
    key: 'mrba:archivedDateValue',
    type: 'input',
    templateOptions: {
      label: 'Eingangs Datum',
      type: 'date',
    }
  };

  readonly mrba_fiscalYear : FormlyFieldConfig =
  {
    className: 'flex-2',
    key: 'mrba:fiscalYear',
    type: 'input',
    templateOptions: {
      label: 'Fiskal-Jahr',
      type: 'number',
      min: new Date().getFullYear()-1,
      max: new Date().getFullYear()+1,
    }
  }

  readonly mrba_documentTopic : FormlyFieldConfig =
  {
    className: 'flex-2',
    key: 'mrba:documentTopic',
    type: 'input',
    templateOptions: {
      label: 'Bezeichnung',

    }
  }

  readonly mrba_documentNumber : FormlyFieldConfig =
  {
    className: 'flex-2',
    key: 'mrba:documentNumber',
    type: 'input',
    templateOptions: {
      label: 'Nummer',
    }
  }

  readonly mrba_documentDateValue : FormlyFieldConfig =
  {
    className: 'flex-2',
    key: 'mrba:documentDateValue',
    type: 'input',
    templateOptions: {
      label: 'Datum',
      type: 'date',
    }
  }

  readonly mrba_netAmount : FormlyFieldConfig =
  {
    className: 'flex-2',
    key: 'mrba:netAmount',
    type: 'input',
    templateOptions: {
      label: 'Netto Betrag',
      placeholder: 'Netto Betrag (e.g € 1.005,20)',
      pattern: REGEX_mrba_germanDecimalTwoDecimalPlace,
    }
  }

  readonly mrba_grossAmount : FormlyFieldConfig =
  {
    className: 'flex-2',
    key: 'mrba:grossAmount',
    type: 'input',
    templateOptions: {
      label: 'Brutto Betrag',
      placeholder: 'Brutto Betrag (e.g € 1.005,20)',
      pattern: REGEX_mrba_germanDecimalTwoDecimalPlace,
    }
  }

  readonly mrba_taxRate : FormlyFieldConfig =
  {
    className: 'flex-2',
    key: 'mrba:taxRate', // d:text, mrba:germanDecimalOneDecimalPlace
    type: 'mrbauFormlyAutocomplete',
    templateOptions: {
      label: 'Steuersatz',
      placeholder: 'Steuersatz in % z.B. 20,00',
      filter: (term) => of(term ? this.filterDefaultValues(term, this.mrbauConventionsService.taxRateDefaultValues) : this.mrbauConventionsService.taxRateDefaultValues.slice()),
      pattern: REGEX_mrba_germanDecimalOneDecimalPlace,
    }
  }

  readonly mrba_taxRateComment : FormlyFieldConfig =
  {
    className: 'flex-2',
    key: 'mrba:taxRateComment',
    type: 'input',
    templateOptions: {
      label: 'Optionaler Kommentar',
      type: 'number',
    }
  }
/*
  readonly mrba_costCarrierNumber : FormlyFieldConfig =
  {
    className: 'flex-2',
    key: 'mrba:costCarrierNumber',
    type: 'input',
    templateOptions: {
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
    templateOptions: {
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
    validators: {
      validation: [{ name: 'mrbauAutocompleteValidator', options: { values: this.mrbauConventionsService.getKtListFormOptions() } }],
    },
  }

  readonly mrba_projectName: FormlyFieldConfig =
  {
    className: 'flex-2',
    key: 'mrba:projectName',
    type: 'input',
    templateOptions: {
      label: 'Projektbezeichnung',
    }
  }

  readonly duplicated_document_form : FormlyFieldConfig = {
    key: 'mrbauFormlyDuplicatedDocument',
    type: 'mrbauFormlyDuplicatedDocument',
  };

  readonly workflow_all_set_form : FormlyFieldConfig = {
      key: 'mrbauFormlyAllSet',
      type: 'mrbauFormlyAllSet',
  };

  readonly mrba_orderType : FormlyFieldConfig =
  {
    className: 'flex-4',
    key: 'mrba:orderType',
    type: 'select',
    defaultValue: this.mrbauConventionsService.getOrderTypeFormOptions()[0].value,
    templateOptions: {
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
    templateOptions: {
      label: 'Prüffrist Anzahlungsrechnungen (Tage)',
      placeholder: 'z.B. 14',
      filter: (term) => of(term ? this.filterDefaultValues(term, this.mrbauConventionsService.reviewDaysDefaultValues) : this.mrbauConventionsService.reviewDaysDefaultValues.slice()),
      pattern: REGEX_nonNegativeInt,
    }
  }

  readonly mrba_reviewDaysFinalInvoice: FormlyFieldConfig =
  {
    className: 'flex-2',
    key: 'mrba:reviewDaysFinalInvoice',
    type: 'mrbauFormlyAutocomplete',
    templateOptions: {
      label: 'Prüffrist Schlussrechnungen (Tage)',
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
    templateOptions: {
      label: 'Nettofrist (Tage)',
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
    templateOptions: {
      label: 'Skontofrist 1 (Tage)',
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
    templateOptions: {
      label: 'Skontofrist 2 (Tage)',
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
    templateOptions: {
      label: 'Skonto 1 (%)',
      placeholder: 'Skonto in % z.B. 3,00',
      filter: (term) => of(term ? this.filterDefaultValues(term, this.mrbauConventionsService.discountDefaultValues) : this.mrbauConventionsService.discountDefaultValues.slice()),
      pattern: REGEX_mrba_germanDecimalTwoDecimalPlace,
    },
  }

  readonly mrba_earlyPaymentDiscountPercent2 : FormlyFieldConfig =
  {
    className: 'flex-2',
    key: 'mrba:earlyPaymentDiscountPercent2', //d:text mrba:germanDecimalTwoDecimalPlaces
    type: 'mrbauFormlyAutocomplete',
    templateOptions: {
      label: 'Skonto 2 (%)',
      placeholder: 'Skonto in % z.B. 2,00',
      filter: (term) => of(term ? this.filterDefaultValues(term, this.mrbauConventionsService.discountDefaultValues) : this.mrbauConventionsService.discountDefaultValues.slice()),
      pattern: REGEX_mrba_germanDecimalTwoDecimalPlace,
    },
    validation: {
      messages: {pattern: notAValidValueValidationMessage},
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
}


