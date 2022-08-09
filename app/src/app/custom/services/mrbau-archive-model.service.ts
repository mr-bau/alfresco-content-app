import { Injectable } from '@angular/core';
import { MrbauArchiveModel } from '../mrbau-doc-declarations';
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
}

