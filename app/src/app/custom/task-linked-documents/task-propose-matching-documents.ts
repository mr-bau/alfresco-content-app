
import { NodesApiService } from '@alfresco/adf-core';
import { NodeAssociationEntry, Node } from '@alfresco/js-api';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
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
          <a href="javascript: void(0);" (click)="onDocumentClicked(n.id)" matTooltip="Dokument Anzeigen">{{n.name}}</a>
        </mat-list-option>
      </mat-selection-list>
      <mat-list>
        <mat-list-item checkboxPosition="before" *ngFor="let nodeAssociation of taskNodeAssociations; index as i">
          <a href="javascript: void(0);" (click)="onDocumentClicked(nodeAssociation.entry.id)" matTooltip="Dokument Anzeigen">{{nodeAssociation.entry.name}}</a>
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

  ngOnChanges(changes: SimpleChanges)
  {
    if (changes.node != null)
    {
      this.querySuggestions();
    }
    else if (changes.taskNodeAssociations != null)
    {
      this.filterCurrentAssociations();
    }
  }

  querySuggestions()
  {
    if (this.node == null)
      return;

    this.errorMessage = "Loading...";
    let newProposedNodes : Node[] = [];
    // query
    this.mrbauWorkflowService.queryProposedDocuments(this.node)
    .then((result) => {
      if (result == null)
      {
        return;
      }
      for (let i = 0; i< result.list.entries.length; i++)
      {
        const node = result.list.entries[i].entry;
        newProposedNodes.push(node);
      }
      this.proposedNodes = newProposedNodes;
      this.filterProposedNodes();
    })
    .catch((error) => {
        this.errorMessage = error;
    });
  }

  async queryAssociationsAndFilter()
  {
    this.errorMessage = "Loading...";
    for (let i=this.resultNodes.length-1; i>=0; i--)
    {
      const node = this.resultNodes[i];
      await this.nodesApiService.nodesApi.listSourceAssociations(node.id, {skipCount:0, maxItems: 999})
      .then((result) => {
        if (this.shouldFilterNode(node.nodeType, result.list.entries))
        {
          this.resultNodes.splice(i);
        }
      })
      .catch((error) => {
        this.errorMessage = error;
        return;
      });
    }
    this.errorMessage = null;
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

  updateCurrentAssociations()
  {
    if (this.errorMessage != null)
    {
      return;
    }
    this.filterProposedNodes();
  }

  filterCurrentAssociations()
  {
    let newResultNodes : Node[] = [];
    if (this.taskNodeAssociations ==  null)
    {
      for (let i=this.proposedNodes.length - 1; i>= 0; i--)
      {
        newResultNodes.push(this.proposedNodes[i]);
      }
    }
    else for (let i=this.proposedNodes.length - 1; i>= 0; i--)
    {
      const n = this.proposedNodes[i];
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
