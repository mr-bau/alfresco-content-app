import { SelectionState } from '@alfresco/adf-extensions';
import { Node, NodeBodyUpdate } from '@alfresco/js-api';
import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { MrbauBaseDialogComponent } from '../mrbau-base-dialog/mrbau-base-dialog.component';
import { MrbauNewTaskDialogComponent } from '../mrbau-new-task-dialog/mrbau-new-task-dialog.component';
import { NodesApiService } from '@alfresco/adf-core';

@Component({
  selector: 'aca-mrbau-show-doc-task-dialog',
  template: `
  <h2 mat-dialog-title>Neue Firma zuordnen</h2>
  <p class="mat-dialog-text">Die ausgewählte Firma wird allen gewählten Dokumenten als neue Firma zugeordnet!</p>
  <mat-dialog-content>
    <form [formGroup]="form">
      <formly-form [form]="form" [fields]="fields" [options]="options" [model]="model" (modelChange)="modelChangeEvent()"></formly-form>
    </form>
  </mat-dialog-content>
  <mat-dialog-actions>
    <!-- The mat-dialog-close directive optionally accepts a value as a result for the dialog. -->
    <button mat-button color="primary" [mat-dialog-close]="true" [disabled]="formIsInValid()">ÜBERNEHMEN</button>
    <button mat-button mat-dialog-close>ABBRECHEN</button>
  </mat-dialog-actions>
  `,
  styleUrls: ['../mrbau-dialog-global.scss', '../../form/mrbau-form-global.scss',],
  encapsulation: ViewEncapsulation.None
})
export class MrbauShowModifyCompanyDialogComponent extends MrbauBaseDialogComponent implements OnInit {
  nodes : Node[] = [];

  fields : FormlyFieldConfig[] = [
    {
      fieldGroupClassName: 'flex-container-min-width',
      fieldGroup: [
        {
          className: 'flex-4',
          key: 'mrba:companyId',
          type: 'mrbauFormlySelectSearchVendor',
          props: {
            label: 'Firma auswählen',
            placeholder: 'Firma suchen z.B. %Elbe%',
            change: (field: FormlyFieldConfig) => {
              const mrba_company_fields = [
                'mrba:companyName',
                'mrba:companyVatID',
                'mrba:companyStreet',
                'mrba:companyZipCode',
                'mrba:companyCity',
                'mrba:companyCountryCode',
              ];
              if (field)
              {
                const vendor = field.model[field.key as string];
                for (const key of mrba_company_fields)
                {
                  field.model[key] = (vendor) ? vendor[key] : undefined;
                }
              }
            }
          },
          hooks: {},
          validators: { },
        }
      ]
    }
  ];

  constructor(
              private router : Router,
              private nodesApiService : NodesApiService,
              private dialogRef: MatDialogRef<MrbauNewTaskDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: {payload: any}
  ) {
    super();
    this.router;

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

  onDialogClose(result : boolean)
  {
    if (result)
    {
      for (let i=0; i< this.nodes.length; i++) {
        const node = this.nodes[i];
        let nodeBody : NodeBodyUpdate =  {
          properties: {
          }
        };
        Object.keys(this.model).forEach( key =>
        {
          if (key.startsWith('mrba:')) {
            let value = (this.model[key]?.value) ? (this.model[key].value) : this.model[key];
            if (value == '')
            {
              value = null;
            }
            let nodeValue = node.properties[key];
            if (value != nodeValue)
            {
              nodeBody.properties[key] = value;
            }
          }
        })
        // only update if a value has changed
        if (Object.keys(nodeBody.properties).length == 0)
        {
          console.log(node.id+': no values changed');
        }
        else
        {
          console.log(nodeBody);
          this.nodesApiService.nodesApi.updateNode(node.id, nodeBody, {}).then(() => {
            console.log(node.id+': OK');
          })
          .catch(error => {
            console.log(node.id+':');
            console.log(error);
          })
        }
      }
    }
  }

  modelChangeEvent()
  {
  }
}

