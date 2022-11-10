import { Component, EventEmitter, Input, Output} from '@angular/core';
import { Node } from '@alfresco/js-api';
import { ContentManagementService } from '../../services/content-management.service';
import { NodePermissionService } from '@alfresco/aca-shared';
@Component({
  selector: 'aca-linked-document-detail',
  template: `
    <details>
      <summary>
        <button *ngIf="removeButtonVisible" mat-button (click)="onRemoveButtonClicked(node?.id)" matTooltip="Link Entfernen"><mat-icon>delete</mat-icon></button>
        {{prefix}}<a href="javascript: void(0);" (click)="onNodeClicked()" matTooltip="Dokument Anzeigen">{{node?.name}}</a>
        <button *ngIf="uploadNewVersionButtonVisible" mat-button
          [title]="'Neue Version hochladen'"
          [disabled]="!isVersionUpdateAllowed()"
          (click)="uploadNewVersion.click()">
          <mat-icon>file_upload</mat-icon>
          <input #uploadNewVersion
            style="display: none;"
            [type]="'file'"
            id="uploadNewVersion"
            name="uploadNewVersion"
            accept=".pdf"
            (change)="onUploadNewVersionClicked(node, $event)"
          >
        </button>
      </summary>
      <ul class="node-detail-list">
        <li class="status">Pfad: {{node?.path?.name || 'unbekannt'}}</li>
        <li class="status">ID {{node?.id || 'unbekannt'}} -
          erzeugt am {{node?.createdAt | date:'medium' || 'unbekannt'}}
          von {{node?.createdByUser?.displayName || 'unbekannt'}}
          - {{node?.content?.sizeInBytes || '?'}} Bytes</li>
      </ul>
    </details>
  `,
  styleUrls: [],
})
export class LinkedDocumentDetailComponent  {
  @Input() prefix : string = '';
  @Input() node : Node = new Node();
  @Input() removeButtonVisible : boolean = false;
  @Input() uploadNewVersionButtonVisible : boolean = false;
  @Output() clickDocument = new EventEmitter();
  @Output() clickRemoveButton = new EventEmitter<string>();

  constructor(
    private contentManagementService: ContentManagementService,
    private nodePermissionService: NodePermissionService,
  )
  {}

  onUploadNewVersionClicked(node, ev){
    this.contentManagementService.versionUpdateDialog(node, ev.target.files[0]);
  }

  onNodeClicked()
  {
    this.clickDocument.emit();
  }
  onRemoveButtonClicked(id:string)
  {
    this.clickRemoveButton.emit(id);
  }

  isVersionUpdateAllowed() :boolean
  {
    return this.nodePermissionService.check(this.node, ['update']);
  }
}
