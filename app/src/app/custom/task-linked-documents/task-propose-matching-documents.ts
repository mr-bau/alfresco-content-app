
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
      this.filterSuggestions();
    }
  }

  querySuggestions()
  {
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
      this.filterSuggestions();
      this.errorMessage = null;
    })
    .catch((error) => {
        this.errorMessage = error;
    });
  }

  filterSuggestions()
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
