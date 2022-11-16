import { Component, EventEmitter, Input, Output} from '@angular/core';
import { Node } from '@alfresco/js-api';
import { NodePermissionService } from '@alfresco/aca-shared';
import { MrbauCommonService } from '../services/mrbau-common.service';
@Component({
  selector: 'aca-linked-document-detail',
  template: `
    <details>
      <summary>
        <button *ngIf="removeButtonVisible" mat-button (click)="onRemoveButtonClicked(node?.id)" matTooltip="Link Entfernen"><mat-icon>delete</mat-icon></button>
        <div [adf-file-draggable]="true" class="drag-and-drop-border"
          (filesDropped)="onFilesDropped(node, $event)"
          (folderEntityDropped)="onFolderEntityDropped($event)"
          dropzone="" webkitdropzone="*" #dragAndDropArea>
          <ng-content></ng-content>
          {{prefix}}<a href="javascript: void(0);" (click)="onNodeClicked()" matTooltip="Dokument Anzeigen">{{node?.name}}</a>
          <button *ngIf="uploadNewVersionButtonVisible" mat-button
            matTooltip="Neue Version hochladen"
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
        </div>
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
    private nodePermissionService: NodePermissionService,
    private mrbauCommonService : MrbauCommonService,
  )
  {}

  onFilesDropped(node : Node, files:File[])
  {
    if (files.length != 1)
    {
      this.mrbauCommonService.showError("Fehler: Nur eine einzelne Datei kann als neue Version hochgeladen werden.");
      return;
    }
    if (!this.isVersionUpdateAllowed())
    {
      this.mrbauCommonService.showError("Fehler: Keine Berechtigung für den Upload von neuen Versionen.");
      return;
    }

    this.mrbauCommonService.uploadNewVersionWithDialog(node, files[0]);
  }

  onFolderEntityDropped(event)
  {
    event;
    this.mrbauCommonService.showError("Fehler: Ordner können nicht als neue Version verwendet werden.");
  }

  onUploadNewVersionClicked(node : Node, ev){
    this.mrbauCommonService.uploadNewVersionWithDialog(node, ev.target.files[0]);
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
