import { Component, EventEmitter, Input, Output} from '@angular/core';
import { Node } from '@alfresco/js-api';
@Component({
  selector: 'aca-linked-document-detail',
  template: `
    <details>
      <summary>
        {{prefix}}<a href="javascript: void(0);" (click)="onTaskNodeClicked()" matTooltip="Dokument Anzeigen">{{taskNode?.name}}</a><br/>
      </summary>
      <ul class="node-detail-list">
        <li class="status">Pfad: {{taskNode?.path?.name || 'unbekannt'}}</li>
        <li class="status">ID {{taskNode?.id || 'unbekannt'}} -
          erzeugt am {{taskNode?.createdAt | date:'medium' || 'unbekannt'}}
          von {{taskNode?.createdByUser?.displayName || 'unbekannt'}}
          - {{taskNode?.content?.sizeInBytes || '?'}} Bytes</li>
      </ul>
    </details>
  `,
  styleUrls: [],
})
export class LinkedDocumentDetailComponent  {
  @Input() prefix : string = '';
  @Input() taskNode : Node = new Node();
  @Output() click = new EventEmitter();

  onTaskNodeClicked()
  {
    this.click.emit();
  }
}
