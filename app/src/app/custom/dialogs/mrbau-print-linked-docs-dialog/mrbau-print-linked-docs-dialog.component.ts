import { SelectionState } from '@alfresco/adf-extensions';
import { Node } from '@alfresco/js-api';
import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { MrbauBaseDialogComponent } from '../mrbau-base-dialog/mrbau-base-dialog.component';
import { MrbauNewTaskDialogComponent } from '../mrbau-new-task-dialog/mrbau-new-task-dialog.component';
import { NodesApiService } from '@alfresco/adf-core';
import { CONST } from '../../mrbau-global-declarations';
import { MrbauCommonService } from '../../services/mrbau-common.service';
import { ContentApiService } from '../../../../../../projects/aca-shared/src/public-api';
import { saveAs } from 'file-saver';

@Component({
  selector: 'aca-mrbau-print-linked-docs-dialog',
  template: `
  <h2 mat-dialog-title>Verknüpfte Dokumente drucken</h2>
  <p class="mat-dialog-text">Alle in der zugeordneten Aufgabe verknüpften Dokumente werden gedruckt.</p>
  <mat-dialog-content>
    <form [formGroup]="form">
      <formly-form [form]="form" [fields]="fields" [options]="options" [model]="model" (modelChange)="modelChangeEvent()"></formly-form>
    </form>
  </mat-dialog-content>
  <mat-dialog-actions>
    <!-- The mat-dialog-close directive optionally accepts a value as a result for the dialog. -->
    <button mat-button color="primary" [mat-dialog-close]="true" [disabled]="formIsInValid()">DRUCKEN</button>
    <button mat-button mat-dialog-close>ABBRECHEN</button>
  </mat-dialog-actions>
  `,
  styleUrls: ['../mrbau-dialog-global.scss', '../../form/mrbau-form-global.scss',],
  encapsulation: ViewEncapsulation.None
})
export class MrbauPrintLinkedDocsDialogComponent extends MrbauBaseDialogComponent implements OnInit {
  nodes : Node[] = [];

  fields : FormlyFieldConfig[] = [
    {
      fieldGroupClassName: 'flex-container-min-width',
      fieldGroup: [
        {
          className: 'flex-4',
          key: 'selectDocTypes',
          type: 'select',
          props: {
            label: 'Dokument-Art Filter',
            placeholder: 'Alle Dokument Drucken',
            description: 'Einschränken auf die ausgewählte Dokument-Art (optional)',
            required: false,
            multiple: true,
            selectAllOption: 'Alles Auswählen',
            options: [
              { label: "Lieferschein",       value : "mrba:deliveryNote"},
              { label: "Rechnung",           value : "mrba:invoice"},
              { label: "Rechnungsprüfblatt", value : "mrba:invoiceReviewSheet"},
            ],
          },

          hooks: {},
          validators: { },
        },
      ]
    }
  ];

  constructor(
              private nodesApiService : NodesApiService,
              private mrbauCommonService : MrbauCommonService,
              private contentApiService : ContentApiService,
              private dialogRef: MatDialogRef<MrbauNewTaskDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: {payload: any}
  ) {
    super();

    if (data && data.payload)
    {
      const selection = data.payload as SelectionState;
      selection.nodes.forEach(nodeEntry => {
        this.nodes.push(nodeEntry.entry);
      });
    }
  }

  ngOnInit(): void {
    this.dialogRef.afterClosed().subscribe(result => {
      this.onDialogClose(result);
    });
  }

  async onDialogClose(result : boolean)
  {
    if (result)
    {
      try {
        for (let i=0; i< this.nodes.length; i++)
        {
          let docs : Node[] = [];

          // add document
          const node = this.nodes[i];
          docs.push(node);

          // get linked documents
          const targestAssociations = await this.nodesApiService.nodesApi.listTargetAssociations(node.id, {skipCount:0, maxItems: 999, include: CONST.GET_NODE_DEFAULT_INCLUDE});
          for (let k=0; k<targestAssociations.list.entries.length; k++) {
            const targetDoc = targestAssociations.list.entries[k];
            docs.push(targetDoc.entry);
          }

          // filter documents
          const selectedDocTypes : string[] = this.model.selectDocTypes;
          if (selectedDocTypes && selectedDocTypes.length > 0) {
            docs = docs.filter((doc) => selectedDocTypes.indexOf(doc.nodeType) >= 0)
          }

          // print documents
          for (let i=0; i<docs.length; i++) {
            const url = this.contentApiService.getContentUrl(docs[i].id)
            saveAs(url, docs[i].name);
          }
        }
      } catch(error) {
        console.log(error);
        this.mrbauCommonService.showError(error);
      }
    }
  }

  modelChangeEvent()
  {
  }
}

