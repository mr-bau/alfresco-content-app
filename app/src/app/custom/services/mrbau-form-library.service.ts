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

  mrbt_dueDate : FormlyFieldConfig =
  {
    className: 'flex-2',
    key: 'dueDate',
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


}
