import { Injectable } from '@angular/core';

import { FormlyFieldConfig } from '@ngx-formly/core';
import { MRBauArchiveModelTypes } from '../mrbau-doc-declarations';
import { CONST } from '../mrbau-global-declarations';
import { EMRBauTaskCategory, MRBauTaskStatusNamesReduced,  } from '../mrbau-task-declarations';
import { MrbauCommonService } from './mrbau-common.service';
import { MrbauConventionsService } from './mrbau-conventions.service';


@Injectable({
  providedIn: 'root'
})
export class MrbauFormLibraryService {

  constructor(
    private mrbauConventionsService:MrbauConventionsService,
    private mrbauCommonService : MrbauCommonService
    ) { }

  getByName(name : string) : FormlyFieldConfig
  {
    let val = eval("this."+name);
    return val;
  }

  getFormForNodeType(formTypeName : string, nodeType: string) :FormlyFieldConfig[]
  {
    // same for all document types
    if (formTypeName == 'FIELDS_METADATA_EXTRACT_1') {
      return [
        {
          fieldGroupClassName: 'flex-container',
          fieldGroup: [this.mrba_companyId],
        }
      ];
    }
    // extract from doc model types
    let result : FormlyFieldConfig[] = [];
    let docModel = MRBauArchiveModelTypes.filter(doc => doc.name == nodeType);
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
    if (key && mandatoryRequiredProperties.indexOf(key) >= 0)
    {
      formlyFieldConfig.templateOptions.required = true;
    }
    if (formlyFieldConfig.fieldGroup)
    {
      formlyFieldConfig.fieldGroup.forEach( (fc) => this.patchFormFieldConfigRecursive(fc, mandatoryRequiredProperties))
    }
  }

  common_comment : FormlyFieldConfig =
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

  common_archiveModelTypes : FormlyFieldConfig =
  {
    className: 'flex-4',
    key: 'archiveModelTypes',
    type: 'select',
    templateOptions: {
      label: 'Dokumenten-Art auswählen',
      options: this.mrbauConventionsService.getArchiveModelTypesFormOptions(),
    },
  }

  common_taskLinkedDocuments : FormlyFieldConfig =
  {
    className: 'flex-3',
    type: 'taskLinkedDocuments',
    key: ['fileRefs','fileNames'],
    templateOptions: {
      text: 'Dokumente Hinzufügen',
      description: 'Verknüpfte Dokumente',
    },
  }

  mrbt_status : FormlyFieldConfig =
  {
    className: 'flex-1',
    type: 'select',
    key: 'mrbt:status',
    templateOptions: {
      label: 'Status',
      options: MRBauTaskStatusNamesReduced
    },
  };

  mrbt_description : FormlyFieldConfig =
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

  mrbt_fullDescription : FormlyFieldConfig =
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

  mrbt_dueDateValue : FormlyFieldConfig =
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

  mrbt_priority : FormlyFieldConfig =
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

  mrbt_category : FormlyFieldConfig =
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

  mrbt_assignedUserName : FormlyFieldConfig =
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

  mrba_organisationUnit : FormlyFieldConfig =
  {
    className: 'flex-4',
    key: 'mrba:organisationUnit',
    type: 'select',
    templateOptions: {
      label: 'Mandant auswählen',
      options: this.mrbauConventionsService.getOrganisationUnitFormOptions(),
    },
  };

  mrba_companyId : FormlyFieldConfig =
  {
    className: 'flex-4',
    key: 'mrba:companyName',//TODO companyId companyName
    type: 'select',
    templateOptions: {
      label: 'Firma auswählen',
      options: this.mrbauConventionsService.getVendorListFormOptions(),
      required: true,
    },
  };

  mrba_archivedDateValue : FormlyFieldConfig =
  {
    className: 'flex-2',
    key: 'mrba:archivedDateValue',
    type: 'input',
    templateOptions: {
      label: 'Eingangs Datum',
      type: 'date',
    }
  };

  mrba_fiscalYear : FormlyFieldConfig =
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

  mrba_documentTopic : FormlyFieldConfig =
  {
    className: 'flex-2',
    key: 'mrba:documentTopic',
    type: 'input',
    templateOptions: {
      label: 'Bezeichnung',

    }
  }

  mrba_documentNumber : FormlyFieldConfig =
  {
    className: 'flex-2',
    key: 'mrba:documentNumber',
    type: 'input',
    templateOptions: {
      label: 'Nummer',
    }
  }

  mrba_documentDateValue : FormlyFieldConfig =
  {
    className: 'flex-2',
    key: 'mrba:documentDateValue',
    type: 'input',
    templateOptions: {
      label: 'Datum',
      type: 'date',
    }
  }

  mrba_netAmount : FormlyFieldConfig =
  {
    className: 'flex-2',
    key: 'mrba:netAmount',
    type: 'input',
    templateOptions: {
      label: 'Netto Betrag',
      type: 'number',
    }
  }

  mrba_grossAmount : FormlyFieldConfig =
  {
    className: 'flex-2',
    key: 'mrba:grossAmount',
    type: 'input',
    templateOptions: {
      label: 'Brutto Betrag',
      type: 'number',
    }
  }

  mrba_taxRate : FormlyFieldConfig =
  {
    className: 'flex-2',
    key: 'mrba:taxRate', // d:text, mrba:germanDecimalOneDecimalPlace
    type: 'select',
    templateOptions: {
      label: 'Steuersatz',
      options: [
        {label: '20 %', value: "20"},
        {label: '10 %', value: "10"},
        {label: ' 0 %', value:  "0"},
      ],
    }
  }

  mrba_taxRateComment : FormlyFieldConfig =
  {
    className: 'flex-2',
    key: 'mrba:taxRateComment',
    type: 'input',
    templateOptions: {
      label: 'Optionaler Kommentar',
      type: 'number',
    }
  }

  mrba_costCarrierNumber : FormlyFieldConfig =
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

  mrba_projectName: FormlyFieldConfig =
  {
    className: 'flex-2',
    key: 'mrba:projectName',
    type: 'input',
    templateOptions: {
      label: 'Projektbezeichnung',
    }
  }

  // ASPECT GROUPS
  readonly title_mrba_documentIdentityDetails : FormlyFieldConfig = {
    template: '<i>Dokument Eigenschaften</i>',
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
    template: '<i>Betrag und Steuersatz</i>',
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
    template: '<i>Kostenträger</i>',
  };
  readonly aspect_mrba_costCarrierDetails : FormlyFieldConfig = {
    fieldGroupClassName: 'flex-container',
    fieldGroup: [
      this.mrba_costCarrierNumber, //d:int
      this.mrba_projectName, //d:text
    ]
  };
}
