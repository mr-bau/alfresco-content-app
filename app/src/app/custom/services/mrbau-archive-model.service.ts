import { Injectable } from '@angular/core';
import { EMRBauDocumentCategory, IMRBauDocumentType, MrbauArchiveModel } from '../mrbau-doc-declarations';
import { EMRBauTaskCategory, MRBauTaskCategoryNames } from '../mrbau-task-declarations';
import { ISelectFormOptions } from './mrbau-conventions.service';
import { MrbauWorkflowService } from './mrbau-workflow.service';

@Injectable({
  providedIn: 'root'
})
export class MrbauArchiveModelService {

  constructor(
    private mrbauWorkflowService : MrbauWorkflowService,
    )
  {}

  private _mrbauArchiveModel : MrbauArchiveModel;
  get mrbauArchiveModel() {
    this._mrbauArchiveModel = this._mrbauArchiveModel ?? new MrbauArchiveModel(this.mrbauWorkflowService);
    return this._mrbauArchiveModel;
  }

  getArchiveModelTypesFormOptions() : ISelectFormOptions[] {
    return this.mrbauArchiveModel.mrbauArchiveModelTypes.filter((x) => x.mrbauFormDefinitions != null).map( d => ({label: d.title, value : d.category, group: d.group.label}));
  }

  getArchiveModelNodeTye(category:EMRBauDocumentCategory) : string
  {
    let docModel : IMRBauDocumentType[] = this.mrbauArchiveModel.mrbauArchiveModelTypes.filter( d => d.category == category);
    if (docModel.length > 0)
    {
      return docModel[0].name;
    }
    else
    {
      return undefined;
    }
  }

  getArchiveModelNodeTitle(category:EMRBauDocumentCategory) : string
  {
    let docModel : IMRBauDocumentType[] = this.mrbauArchiveModel.mrbauArchiveModelTypes.filter( d => d.category == category);
    if (docModel.length > 0)
    {
      return docModel[0].title;
    }
    else
    {
      return undefined;
    }
  }

  getTaskDescription(task: EMRBauTaskCategory, documentCategory? : EMRBauDocumentCategory, client? : number) : string
  {
    if (task == EMRBauTaskCategory.NewDocumentValidateAndArchive)
    {
      return MRBauTaskCategoryNames['2001'] + (documentCategory ? " - "+this.getArchiveModelNodeTitle(documentCategory) : "");
    }

    return "description for "+task+" "+client+" "+ documentCategory;
  }
}

