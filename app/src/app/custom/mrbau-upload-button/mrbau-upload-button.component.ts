import { PermissionModel, UploadBase } from '@alfresco/adf-content-services';
import {
  ContentService, FileUtils,
  LogService, NodeAllowableOperationSubject, TranslationService, UploadService, AllowableOperationsEnum
} from '@alfresco/adf-core';
import { Component, EventEmitter, Input, NgZone, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { Subject } from 'rxjs';
import { Node } from '@alfresco/js-api';

@Component({
  selector: 'aca-mrbau-upload-button',
  template: `
    <button mat-raised-button type="button" color="primary" (click)="uploadSingleFile.click()" [matTooltip]="tooltip" [disabled]="disabled">
      <mat-icon>file_upload</mat-icon>
      {{this.staticTitle}}
      <input #uploadSingleFile
        id="upload-single-file"
        data-automation-id="upload-single-file"
        [type]="file ? 'button' : 'file'"
        name="uploadFiles"
        accept="{{acceptedFilesType}}"
        [attr.disabled]="isButtonDisabled()"
        [title]="tooltip"
        (change)="onFilesAdded($event)"
        (click)="onClickUploadButton()">
    </button>
  `,
  styles: ['input{display :none;}']
})
export class MrbauUploadButtonComponent extends UploadBase implements OnInit, OnChanges, NodeAllowableOperationSubject  {
  @Input() staticTitle : 'Prüfblatt Hochladen';
  @Input() tooltip : 'Rechnungs-Prüfblatt hochladen'
  @Input() file: File;

  /** Emitted when create permission is missing. */
  @Output()
  permissionEvent: EventEmitter<PermissionModel> = new EventEmitter<PermissionModel>();

  private hasAllowableOperations: boolean = false;
  protected permissionValue: Subject<boolean> = new Subject<boolean>();

  constructor(protected uploadService: UploadService,
    private contentService: ContentService,
    protected translationService: TranslationService,
    protected logService: LogService,
    protected ngZone: NgZone)
  {
    super(uploadService, translationService, ngZone);
  }

  ngOnInit() {
    this.permissionValue.subscribe((permission: boolean) => {
        this.hasAllowableOperations = permission;
    });
}

  ngOnChanges(changes: SimpleChanges) {
    const rootFolderId = changes['rootFolderId'];
    if (rootFolderId && rootFolderId.currentValue) {
        this.checkPermission();
    }
  }

  isButtonDisabled(): boolean {
    return this.disabled ? true : undefined;
  }

  onFilesAdded($event: any): void {
    const files: File[] = FileUtils.toFileArray($event.currentTarget.files);

    if (this.hasAllowableOperations) {
        this.uploadFiles(files);
    } else {
        this.permissionEvent.emit(new PermissionModel({ type: 'content', action: 'upload', permission: 'create' }));
    }
    // reset the value of the input file
    $event.target.value = '';
  }

  onClickUploadButton(): void {
      if (this.file) {
          const files: File[] = [this.file];

          if (this.hasAllowableOperations) {
              this.uploadFiles(files);
          } else {
              this.permissionEvent.emit(new PermissionModel({ type: 'content', action: 'upload', permission: 'create' }));
          }
      }
  }

  checkPermission() {
    if (this.rootFolderId) {
        const opts: any = {
            includeSource: true,
            include: ['allowableOperations']
        };

        this.contentService.getNode(this.rootFolderId, opts).subscribe(
            (res) => this.permissionValue.next(this.nodeHasPermission(res.entry, AllowableOperationsEnum.CREATE)),
            (error: { error: Error }) => {
                if (error && error.error) {
                    this.error.emit({ error: error.error.message } as any);
                } else {
                    this.error.emit({ error: 'FILE_UPLOAD.BUTTON.PERMISSION_CHECK_ERROR'} as any);
                }
            }
        );
    }
  }

  nodeHasPermission(node: Node, permission: AllowableOperationsEnum | string): boolean {
      return this.contentService.hasAllowableOperations(node, permission);
  }
}