import { ContentNodeSelectorComponent, ContentNodeSelectorComponentData } from '@alfresco/adf-content-services';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FieldType } from '@ngx-formly/core';
import { Subject } from 'rxjs';
import { Node } from '@alfresco/js-api';

@Component({
  selector: 'aca-formly-field-task-linked-documents',
  template: `
      <aca-task-linked-documents [defaultExpanded]="defaultExpanded" [associatedDocumentName]="associatedDocumentName" [associatedDocumentRef]="associatedDocumentRef" (onAddAssociation)="onAdd()" (onRemoveAssociation)="onRemove($event)"></aca-task-linked-documents>
  `,
})
export class MrbauFormlyFieldTaskLinkedDocumentsComponent extends FieldType implements OnInit {
  associatedDocumentRef: string[] = [];
  associatedDocumentName: string[] = [];
  defaultExpanded: boolean = false;
  constructor(private _dialog: MatDialog)
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
      currentFolderId: null,
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
        for (let i=0; i< selections.length; i++)
        {
          this.associatedDocumentRef.push(selections[i].id);
          this.associatedDocumentName.push(selections[i].name);
        };
        this.model[this.key[0]] = this.associatedDocumentRef;
        this.model[this.key[1]] = this.associatedDocumentName;
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
      this.associatedDocumentRef.splice(i);
      this.associatedDocumentName.splice(i);
    }
    this.model[this.key[0]] = this.associatedDocumentRef;
    this.model[this.key[1]] = this.associatedDocumentName;
  }
}
