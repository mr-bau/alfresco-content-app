
import { NodesApiService } from '@alfresco/adf-core';
import { NodeAssociationEntry, Node } from '@alfresco/js-api';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { Mutex } from 'async-mutex';
import { MrbauWorkflowService } from '../services/mrbau-workflow.service';
import { IFileSelectData } from '../tasks/tasks.component';

@Component({
  selector: 'aca-task-propose-matching-documents',
  template: `
    <p>Wählen Sie die passenden Dokumente aus. Die ausgewählten Dokumente werden mit diesem Dokument verknüpft. Folgende Dokumente wurden gefunden: </p>
    <div *ngIf="errorMessage; then thenBlock else elseBlock"></div>
    <ng-template #thenBlock>
      <div>{{errorMessage}}</div>
    </ng-template>
    <ng-template #elseBlock>
      <mat-selection-list #selectionList [(ngModel)]="selectedOptions">
        <mat-list-option checkboxPosition="before" [value]="n.id" *ngFor="let n of resultNodes as ResultNode">
          <span><a href="javascript: void(0);" (click)="onDocumentClicked(n.id)" matTooltip="Dokument Anzeigen">{{n.name}}</a>&nbsp;{{createInfoString(n)}}</span>
        </mat-list-option>
      </mat-selection-list>
      <mat-list>
        <mat-list-item checkboxPosition="before" *ngFor="let nodeAssociation of taskNodeAssociations; index as i">
          <span><a href="javascript: void(0);" (click)="onDocumentClicked(nodeAssociation.entry.id)" matTooltip="Dokument Anzeigen">{{nodeAssociation.entry.name}}</a>&nbsp;{{createInfoString(nodeAssociation.entry)}}</span>
        </mat-list-item>
      </mat-list>
    </ng-template>
  `,
})
export class TaskProposeMatchingDocuments implements OnChanges {
  @Input() node : Node;
  @Input() taskNodeAssociations : NodeAssociationEntry[] = [];
  @Output() onAssociation = new EventEmitter<IFileSelectData>();

  proposedNodes : Node[] = [];
  resultNodes : Node[] = [];
  selectedOptions: string[] = [];
  errorMessage : string;

  constructor(
    private mrbauWorkflowService : MrbauWorkflowService,
    private nodesApiService : NodesApiService,
  )
  {}

  mutex = new Mutex();
  async ngOnChanges(changes: SimpleChanges)
  {
    // make sure that only one query is running at a time
    await this.mutex.runExclusive(async() => {
      //console.log('start query');
      //await new Promise((resolve) => { console.log('in');
      //setTimeout((resolve) => resolve(null), 5000, resolve)});
      //console.log('finished query');
      if (changes.node != null)
      {
        await this.querySuggestions(); // fill proposedNodes
        await this.filterProposedNodes(); // filter proposed Nodes and create resultNodes
      }
      else if (changes.taskNodeAssociations != null)
      {
        await this.filterProposedNodes();
      }
     });
  }

  async querySuggestions()
  {
    this.proposedNodes = [];
    if (this.node == null)
    {
      return;
    }

    this.errorMessage = "Loading...";
    let newProposedNodes : Node[] = [];
    // query
    await this.mrbauWorkflowService.queryProposedDocuments(this.node)
    .then((result) => {
      if (result == null)
      {
        return;
      }
      for (const e of result.list.entries)
      {
        const node = e.entry;
        newProposedNodes.push(node);
      }
      this.proposedNodes = newProposedNodes;
    })
    .catch((error) => {
        this.errorMessage = error;
    });
  }

  createInfoString(node: Node) : string {
    if (node?.properties["mrba:orderType"] == "Auftrag") {
      return ('(KT/KS: '+node?.properties["mrba:costCarrierNumber"] +' - Status: '+node?.properties["mrba:signingStatus"]+')')
    }
    else {
      return "";
    }
  }

  async queryAssociationsAndFilter()
  {
    this.nodesApiService;
    /*
    for (let i=this.resultNodes.length-1; i>=0; i--)
    {
      const node = this.resultNodes[i];
      await this.nodesApiService.nodesApi.listSourceAssociations(node.id, {skipCount:0, maxItems: 999})
      .then((result) => {
        console.log(result);
        if (this.shouldFilterNode(node.nodeType, result.list.entries))
        {
          this.resultNodes.splice(i);
        }
      })
      .catch((error) => {
        this.errorMessage = error;
        return;
      });
    }*/
  }

  shouldFilterNode(nodeType:string, sourceAssociations:NodeAssociationEntry[] ) : boolean
  {
    if (nodeType == "mrba:frameworkContract")
    {
      return false;
    }
    // only list document if it has not been associated already at least one time
    for (const sa of sourceAssociations)
    {
      if (sa.entry.association.assocType == nodeType)
      {
        return true;
      }
    }
    return false;
  }

  async filterProposedNodes() {
    this.errorMessage = "Filtering...";
    this.filterCurrentAssociations();
    this.filterLatestFrameworkContract();
    await this.queryAssociationsAndFilter();
    this.errorMessage = null;
  }

  filterLatestFrameworkContract()
  {
    let frameworkContracts : Node[] = this.resultNodes.filter((node) => node.nodeType == "mrba:frameworkContract");
    if (frameworkContracts.length > 1)
    {
      frameworkContracts.sort((a,b) => (a.modifiedAt.getTime() - b.createdAt.getTime()));
      let newResultNodes : Node[] = this.resultNodes.filter((node) => node.nodeType != "mrba:frameworkContract");
      newResultNodes.push(frameworkContracts[0]);
      this.resultNodes = newResultNodes;
    }
  }

  filterCurrentAssociations()
  {
    let newResultNodes : Node[] = [];
    if (this.taskNodeAssociations ==  null)
    {
      for (const n of this.proposedNodes)
      {
        newResultNodes.push(n);
      }
    }
    else for (const n of this.proposedNodes)
    {
      const filteredResult = this.taskNodeAssociations.filter((element) => element.entry.id == n.id);
      if (filteredResult.length == 0)
      {
        newResultNodes.push(n);
      }
    }
    this.resultNodes = newResultNodes;
  }

  onDocumentClicked(id:string)
  {
    this.onAssociation.emit({nodeId : id});
  }
}
