import { AlfrescoApiService } from '@alfresco/adf-core';
import { NodeEntry, NodesApi } from '@alfresco/js-api';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MrbauNodeService {

  constructor( private alfrescoApiService : AlfrescoApiService
    ) { }

  private _nodesApi: NodesApi;
  get nodesApi(): NodesApi {
    this._nodesApi = this._nodesApi ?? new NodesApi(this.alfrescoApiService.getInstance());
    return this._nodesApi;
  }

  async updateNodeContent(
    nodeId: string,
    content: any,
    majorVersion: boolean = true,
    comment?: string,
    newName?: string
  ): Promise<NodeEntry | null> {
    try {
      const opts = {
        majorVersion,
        comment,
        name: newName
      };
      return await this.nodesApi.updateNodeContent(nodeId, content, opts);
    } catch (error) {
      this.handleError(`${this.constructor.name} ${this.updateNodeContent.name}`, error);
      return null;
    }
  }

  protected handleError(message: string, response: any) {
    console.log(`${message} error :`);
    if (response.status && response.response) {
      try {
        console.log('Status: ', response.status);
        console.log('Text: ', response.response.text);
        console.log('Method: ', response.response.error.method);
        console.log('Path: ', response.response.error.path);
      } catch {
        console.log(response);
      }
    } else console.log(response);
  }

}
