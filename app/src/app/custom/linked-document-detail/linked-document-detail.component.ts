import { Component, EventEmitter, Input, Output} from '@angular/core';
import { MinimalNodeEntity, Node } from '@alfresco/js-api';
import { NodePermissionService } from '@alfresco/aca-shared';
import { MrbauCommonService } from '../services/mrbau-common.service';
import { Store } from '@ngrx/store';
import { AppStore, NavigateToParentFolder } from '@alfresco/aca-shared/store';
import { TranslationService } from '@alfresco/adf-core';
@Component({
  selector: 'aca-linked-document-detail',
  template: `
    <details>
      <summary>
        <button *ngIf="removeButtonVisible" mat-button (click)="onRemoveButtonClicked(node?.id)" matTooltip="Link Entfernen"><mat-icon>delete</mat-icon></button>
        <div [adf-file-draggable]="uploadNewVersionButtonVisible" [class]="uploadNewVersionButtonVisible ? 'linked-document-name drag-and-drop-border' : 'linked-document-name'"
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
        <li class="status">Pfad: <a href="javascript: void(0);" (click)="goToLocation()" matTooltip="In Ordner Anzeigen">{{this.nodePath || ('APP.BROWSE.SEARCH.UNKNOWN_LOCATION' | translate)}}</a></li>
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
  //@Input() node : Node = new Node();
  nodePath : String;
  private _node : Node;
  @Input() set node(val : Node) {
    this._node = val;
    this.updateNodePath();
  }
  get node(){
    return this._node;
  }
  @Input() removeButtonVisible : boolean = false;
  @Input() uploadNewVersionButtonVisible : boolean = false;
  @Output() clickDocument = new EventEmitter();
  @Output() clickRemoveButton = new EventEmitter<string>();


  constructor(
    private nodePermissionService: NodePermissionService,
    private mrbauCommonService : MrbauCommonService,
    private translationService: TranslationService,
    private store: Store<AppStore>,
  )
  {}

  goToLocation() {
    if (this.node && this.node.path) {
      const node: MinimalNodeEntity = {entry : this.node};
      this.store.dispatch(new NavigateToParentFolder(node));
    }
  }

  updateNodePath()
  {
    // change path text from /Company Home/Sites/belegsammlung/documentLibrary/01 Mandant1/01 Belege/...
    // to Dateibibliotheken/belegsammlung/01 Mandant1/01 Belege/...

    if (this._node?.path?.name)
    {
      const path = this._node.path;
      const personalFiles = this.translationService.instant('APP.BROWSE.PERSONAL.TITLE');
      const fileLibraries = this.translationService.instant('APP.BROWSE.LIBRARIES.TITLE');

      const elements = path.elements.map((e) => Object.assign({}, e));
      if (elements[0].name === 'Company Home') {
        if (elements.length > 2)
        {
          if (elements[1].name === 'Sites') {
            elements[1].name = fileLibraries;
            // remove document library
            if (elements.length > 3) { elements.splice(3,1); }
            // remove company home
            elements.splice(0,1);
          }
          else if (elements[1].name === 'User Homes') {
            elements[1].name = personalFiles;
          }
        }
        this.nodePath = elements.map((e) => e.name).join('/');
      }
      else
      {
        this.nodePath = path.name;
      }
    }
    else
    {
      this.nodePath = undefined;
    }
  }

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
