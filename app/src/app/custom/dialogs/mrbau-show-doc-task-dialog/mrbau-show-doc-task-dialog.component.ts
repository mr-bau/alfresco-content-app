import { SelectionState } from '@alfresco/adf-extensions';
import { Node, ResultSetPaging, SearchRequest } from '@alfresco/js-api';
import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { CONST } from '../../mrbau-global-declarations';
import { MrbauCommonService } from '../../services/mrbau-common.service';
import { MrbauFormLibraryService } from '../../services/mrbau-form-library.service';
import { MrbauBaseDialogComponent } from '../mrbau-base-dialog/mrbau-base-dialog.component';
import { MrbauNewTaskDialogComponent } from '../mrbau-new-task-dialog/mrbau-new-task-dialog.component';

@Component({
  selector: 'aca-mrbau-show-doc-task-dialog',
  template: `
  <h2 mat-dialog-title>Aufgabe auswählen</h2>
  <mat-dialog-content>
    <form [formGroup]="form">
      <formly-form [form]="form" [fields]="fields" [options]="options" [model]="model" (modelChange)="modelChangeEvent()"></formly-form>
    </form>
  </mat-dialog-content>
  <mat-dialog-actions>
    <!-- The mat-dialog-close directive optionally accepts a value as a result for the dialog. -->
    <button mat-button color="primary" [mat-dialog-close]="true" [disabled]="formIsInValid()">WEITER</button>
    <button mat-button mat-dialog-close>ABBRECHEN</button>
  </mat-dialog-actions>
  `,
  styleUrls: ['../mrbau-dialog-global.scss', '../../form/mrbau-form-global.scss',],
  encapsulation: ViewEncapsulation.None
})
export class MrbauShowDocTaskDialogComponent extends MrbauBaseDialogComponent implements OnInit {
  node:Node;

    fields : FormlyFieldConfig[] = [
      {
        fieldGroupClassName: 'flex-container-min-width',
        fieldGroup: [
          {
            className: 'flex-container-column',
            key: 'taskId',
            type: 'radio',
            props: {
              label: 'Aufgabe aus der Liste auswählen',
              description: 'suche...',
              required: true,
              options: [],
            },
          }
        ]
      }
    ];

    constructor(
                private router : Router,
                private mrbauFormLibraryService: MrbauFormLibraryService,
                private mrbauCommonService : MrbauCommonService,
                private dialogRef: MatDialogRef<MrbauNewTaskDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: {payload: any}
    ) {
      super();
      this.router;
      this.mrbauFormLibraryService

      if (data && data.payload)
      {
        const selection = data.payload as SelectionState;
        selection.nodes.forEach(nodeEntry => {
          this.node = nodeEntry.entry;
          this.searchCMIS().then(rs => {
            rs.list.entries
            let options: any[] = [];
            rs.list.entries.forEach(element => {
              options.push({value:element.entry.id, label:element.entry.properties['mrbt:description'], tooltip:element.entry.name, node: element.entry});
            });
            this.fields[0].fieldGroup[0].props.description = (rs.list.entries.length == 1) ? '1 Aufgabe gefunden' : ''+ rs.list.entries.length + ' Aufgaben gefunden';
            this.fields[0].fieldGroup[0].props.options = options;
            if (rs.list.entries.length == 1)
            {
              this.dialogRef.close();
              this.routeTo(rs.list.entries[0].entry.id)
            }
          })
        });
      }
    }

    searchAFTS() : Promise<ResultSetPaging>
    {
      let query : SearchRequest = {
        query: {
          query: '*',
          language: 'afts'
        },
        filterQueries: [
          { query: `=TYPE:"mrbt:task"`},
          { query: `=mrbt:associatedDocumentRef:"${this.node.id}"`},
        ],
        paging : {skipCount: 0, maxItems:  999},
        sort: [{type:'FIELD', field:'cm:created', ascending:true}],
        fields: CONST.SEARCH_REQUEST_DEFAULT_FIELDS,
        include: CONST.SEARCH_REQUEST_DEFAULT_INCLUDE
      };

      return this.mrbauCommonService.queryNodes(query);
    }

    searchCMIS() : Promise<ResultSetPaging>
    {
      let query : SearchRequest = {
        query: {
          //query:`SELECT * FROM mrbt:task A JOIN mrbt:taskCoreDetails B ON A.cmis:objectId = B.cmis:objectId WHERE ANY B.mrbt:associatedDocumentRef IN ('workspace://SpacesStore/${this.node.id}')`+
          query:`SELECT * FROM mrbt:task A JOIN mrbt:taskCoreDetails B ON A.cmis:objectId = B.cmis:objectId WHERE 'workspace://SpacesStore/${this.node.id}' = ANY B.mrbt:associatedDocumentRef`+
          ' ORDER BY A.cmis:creationDate DESC',
          language: 'cmis'
        },
        fields: CONST.SEARCH_REQUEST_DEFAULT_FIELDS,
        include: CONST.SEARCH_REQUEST_DEFAULT_INCLUDE
      }
      return this.mrbauCommonService.queryNodes(query);
    }

    ngOnInit(): void {
      this.dialogRef.afterClosed().subscribe(result => {
        this.onDialogClose(result);
      });
    }

    onDialogClose(result : boolean)
    {
      if (result && this.model.taskId)
      {
        this.routeTo(this.model.taskId);
      }
    }

    routeTo(id:string)
    {
      this.router.navigate(['/tasks', id]);
    }

    modelChangeEvent()
    {
    }
  }

