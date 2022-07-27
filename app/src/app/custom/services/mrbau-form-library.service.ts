import { Injectable } from '@angular/core';

import { FormlyFieldConfig } from '@ngx-formly/core';
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
    key: 'category',
    type: 'select',
    templateOptions: {
      label: 'Dokumenten-Art auswählen',
      options: this.mrbauConventionsService.getArchiveModelTypesFormOptions(),
      required: true,
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
    key: 'status',
    templateOptions: {
      label: 'Status',
      options: MRBauTaskStatusNamesReduced
    },
  };

  mrbt_description : FormlyFieldConfig =
  {
    className: 'flex-6',
    key: 'description',
    type: 'input',
    templateOptions: {
      label: 'Aufgabe',
      description: 'Bezeichnung',
      maxLength: CONST.MAX_LENGTH_TASK_DESC,
      required: true,
    },
  }

  mrbt_fullDescription : FormlyFieldConfig =
  {
    className: 'flex-6',
    key: 'fullDescription',
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
    key: 'dueDateValue',
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
    key: 'priority',
    type: 'select',
    templateOptions: {
      label: 'Priorität',
      placeholder: 'Placeholder',
      required: true,
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
    key: 'category',
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
      required: true,
    },
  }

  mrbt_assignedUserName : FormlyFieldConfig =
  {
    className: 'flex-2',
    key: 'assignedUserName',
    type: 'select',
    templateOptions: {
      label: 'Mitarbeiter',
      options: this.mrbauCommonService.getPeopleObservable(),
      valueProp: 'id',
      labelProp: 'displayName',
      required: true,
    },
  }

  mrba_organisationUnit : FormlyFieldConfig =
  {
    className: 'flex-4',
    key: 'organisationUnit',
    type: 'select',
    templateOptions: {
      label: 'Mandant auswählen',
      options: this.mrbauConventionsService.getOrganisationUnitFormOptions(),
      required: true,
    },
  };

  mrba_companyIdentifier : FormlyFieldConfig =
  {
    className: 'flex-4',
    key: 'companyIdentifier',
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
    key: 'archivedDateValue',
    type: 'input',
    templateOptions: {
      label: 'Eingangs Datum',
      type: 'date',
      required: true,
    }
  };

  mrba_fiscalYear : FormlyFieldConfig =
  {
    className: 'flex-2',
    key: 'fiscalYear',
    type: 'input',
    templateOptions: {
      label: 'Fiskal-Jahr',
      type: 'number',
      min: new Date().getFullYear()-1,
      max: new Date().getFullYear()+1,
      required: true,
    }
  }

  mrba_documentTopic : FormlyFieldConfig =
  {
    className: 'flex-2',
    key: 'documentTopic',
    type: 'input',
    templateOptions: {
      label: 'Bezeichnung',
      required: true,
    }
  }

  mrba_documentNumber : FormlyFieldConfig =
  {
    className: 'flex-2',
    key: 'documentNumber',
    type: 'input',
    templateOptions: {
      label: 'Nummer',
      required: true,
    }
  }

  mrba_documentDate : FormlyFieldConfig =
  {
    className: 'flex-2',
    key: 'documentDate',
    type: 'input',
    templateOptions: {
      label: 'Datum',
      type: 'date',
      required: true,
    }
  }

  mrba_netAmount : FormlyFieldConfig =
  {
    className: 'flex-2',
    key: 'netAmount',
    type: 'input',
    templateOptions: {
      label: 'Netto Betrag',
      type: 'number',
      required: true,
    }
  }

  mrba_grossAmount : FormlyFieldConfig =
  {
    className: 'flex-2',
    key: 'grossAmount',
    type: 'input',
    templateOptions: {
      label: 'Brutto Betrag',
      type: 'number',
      required: true,
    }
  }

  mrba_taxRate : FormlyFieldConfig =
  {
    className: 'flex-2',
    key: 'taxRate',
    type: 'select',
    templateOptions: {
      label: 'Steuersatz',
      options: [
        {label: '20 %', value: 20},
        {label: '10 %', value: 10},
        {label: ' 0 %', value:  0},
      ],
      required: true,
    }
  }

  mrba_taxRateComment : FormlyFieldConfig =
  {
    className: 'flex-2',
    key: 'taxRateComment',
    type: 'input',
    templateOptions: {
      label: 'Optionaler Kommentar',
      type: 'number',
    }
  }

  mrba_costCarrierNumber : FormlyFieldConfig =
  {
    className: 'flex-2',
    key: 'costCarrierNumber',
    type: 'input',
    templateOptions: {
      label: 'Kostenträger',
      pattern: /^[0-9]*$/,
      type: 'number',
      required: true,
    },
    validation: {
      messages: {
        pattern: () => `Ungültige Nummer`,
      },
    },
  }

  mrba_projectName: FormlyFieldConfig =
  {
    className: 'flex-2',
    key: 'projectName',
    type: 'input',
    templateOptions: {
      label: 'Projektbezeichnung',
    }
  }



  // ASPEKT GROUPS

  readonly aspect_mrba_documentIdentityDetails : FormlyFieldConfig = {
    fieldGroupClassName: 'flex-container',
    fieldGroup: [
        this.mrba_documentTopic,
        this.mrba_documentNumber,
        this.mrba_documentDate,
        //this.mrbauFormLibraryService.mrba_documentDateValue
    ]
  };

  readonly aspect_mrba_amountDetails_mrba_taxRate : FormlyFieldConfig = {
    fieldGroupClassName: 'flex-container',
    fieldGroup: [
      //this.mrbauFormLibraryService.mrba_netAmountCents,    // d:int kept in sync with mrba:netAmount
      this.mrba_netAmount,         // d:text
      //this.mrbauFormLibraryService.mrba_grossAmountCents",  // d:intkept in sync with mrba:netAmount
      this.mrba_grossAmount,       // d:text
      this.mrba_taxRate,        // d:text
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

  readonly aspect_mrba_costCarrierDetails : FormlyFieldConfig = {
    fieldGroupClassName: 'flex-container',
    fieldGroup: [
      this.mrba_costCarrierNumber, //d:int
      this.mrba_projectName, //d:text
    ]
  };
}
