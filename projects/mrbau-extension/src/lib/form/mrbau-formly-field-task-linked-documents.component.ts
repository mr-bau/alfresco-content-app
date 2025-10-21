
import { ContentNodeSelectorComponent, ContentNodeSelectorComponentData } from '@alfresco/adf-content-services';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FieldType, FieldTypeConfig, FormlyModule } from '@ngx-formly/core';
import { Subject } from 'rxjs';
import { Node } from '@alfresco/js-api';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatRadioModule } from '@angular/material/radio';
import { TaskLinkedDocumentsComponent } from "../tasks/task-util/task-linked-documents/task-linked-documents.component";

@Component({
    standalone:true,
    imports: [
    CommonModule,
    MatButtonModule,
    MatRadioModule,
    ReactiveFormsModule,
    FormlyModule,
    TaskLinkedDocumentsComponent
],
  selector: 'mrbau-formly-field-task-linked-documents',
  template: `
      <mrbau-task-linked-documents [defaultExpanded]="defaultExpanded" [associatedDocumentName]="associatedDocumentName" [associatedDocumentRef]="associatedDocumentRef" (onAddAssociation)="onAdd()" (onRemoveAssociation)="onRemove($event)"></mrbau-task-linked-documents>
  `,
})
export class MrbauFormlyFieldTaskLinkedDocumentsComponent extends FieldType<FieldTypeConfig> implements OnInit {
  associatedDocumentRef: string[] = [];
  associatedDocumentName: string[] = [];
  defaultExpanded: boolean = false;
  constructor(
    private _dialog: MatDialog,
    private changeDetectorRef:ChangeDetectorRef,
  )
  {
    super();
  }

  ngOnInit(): void {
    if (this.model
      && this.model.fileRefs
      && this.model.fileRefs instanceof Array
      && this.model.fileNames
      && this.model.fileNames instanceof Array
      && this.model.fileRefs.length > 0
      && this.model.fileRefs.length == this.model.fileNames.length)
    {
      for (let i=0; i<this.model.fileRefs.length; i++)
      {
        this.associatedDocumentRef.push(this.model.fileRefs[i]);
        this.associatedDocumentName.push(this.model.fileNames[i]);
      }
      this.defaultExpanded =true;
    }
  }

  onAdd()
  {
    const data: ContentNodeSelectorComponentData = {
      title: "Datei auswählen",
      dropdownHideMyFiles: true,
      selectionMode: 'multiple',
      currentFolderId: '',
      select: new Subject<Node[]>()
    };
    this._dialog.open(
        ContentNodeSelectorComponent,
        {
            data,
            panelClass: 'adf-content-node-selector-dialog',
            minWidth: '630px'
        },
    );

    data.select.subscribe((selections: Node[]) => {
        // Use or store selection...
        for (let i=0; i<selections.length; i++)
        {
          this.associatedDocumentRef.push(selections[i].id);
          this.associatedDocumentName.push(selections[i].name);
        };
        const key : any = this.key;
        this.model[key[0]] = this.associatedDocumentRef;
        this.model[key[1]] = this.associatedDocumentName;
        this.changeDetectorRef.detectChanges();
    },
    (error)=>{
        //your error handling
        error;
        //this.errorMessage = error;
    },
    ()=>{
        //action called when an action or cancel is clicked on the dialog
        this._dialog.closeAll();
    });
  }

  onRemove(i:number)
  {
    if (this.associatedDocumentRef[i])
    {
      this.associatedDocumentRef.splice(i,1);
      this.associatedDocumentName.splice(i,1);
    }

    const key : any = this.key;
    this.model[key[0]] = this.associatedDocumentRef;
    this.model[key[1]] = this.associatedDocumentName;
  }
}
