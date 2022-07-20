import { Injectable } from '@angular/core';

import { FormlyFieldConfig } from '@ngx-formly/core';
import { MRBauTaskStatusNamesReduced,  } from '../mrbau-task-declarations';
import { MrbauConventionsService } from './mrbau-conventions.service';


@Injectable({
  providedIn: 'root'
})
export class MrbauFormLibraryService {

  constructor(private mrbauConventionsService:MrbauConventionsService) { }

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
