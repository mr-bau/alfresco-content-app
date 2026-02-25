import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ResultNode } from '@alfresco/js-api';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatStepperModule } from '@angular/material/stepper';
import { FormlyFieldConfig, FormlyModule } from '@ngx-formly/core';
import { FormlyMaterialModule } from '@ngx-formly/material';
import { MrbauNewTaskDialogComponent } from '../../dialogs/mrbau-new-task-dialog/mrbau-new-task-dialog.component';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MrbauCalcDeductionDialogComponent } from '../../dialogs/mrbau-calc-deduction-dialog/mrbau-calc-deduction-dialog.component';
import { MrbauCompareDocumentsComponent } from '../../dialogs/mrbau-compare-documents/mrbau-compare-documents.component';
import { MrbauConfirmTaskDialogComponent } from '../../dialogs/mrbau-confirm-task-dialog/mrbau-confirm-task-dialog.component';
import { MrbauDelegateTaskDialogComponent } from '../../dialogs/mrbau-delegate-task-dialog/mrbau-delegate-task-dialog.component';
import { EMRBauTaskCategory, MRBauTask } from '../../declaration/mrbau-task-declarations';
import { MrbauInboxAssignDialogComponent } from '../../dialogs/mrbau-inbox-assign-dialog/mrbau-inbox-assign-dialog.component';
import { MrbauShowDocTaskDialogComponent } from '../../dialogs/mrbau-show-doc-task-dialog/mrbau-show-doc-task-dialog.component';
import { MrbauShowModifyCompanyDialogComponent } from '../../dialogs/mrbau-show-modify-company-dialog/mrbau-show-modify-company-dialog.component';
import { MrbauTagDoneLinkedDocsDialogComponent } from '../../dialogs/mrbau-tag-done-docs-dialog/mrbau-tag-done-docs-dialog.component';
import { MrbauPrintLinkedDocsDialogComponent } from '../../dialogs/mrbau-print-linked-docs-dialog/mrbau-print-linked-docs-dialog.component';
import { FormlyMatDatepickerModule } from '@ngx-formly/material/datepicker';

@Component({
  standalone:true,
  imports:[
    CommonModule,
    ReactiveFormsModule,
    FormlyModule,
    FormlyMaterialModule,
    MatStepperModule,
    MatIconModule,
    MatListModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule, MatIconModule,
    FormlyMatDatepickerModule
  ],
  selector: 'mrbau-formly-test',
  template: `
    <div id="main" style="margin-left:10px">
      <h2>Formly Test</h2>
      <form [formGroup]="form" (ngSubmit)="onSubmit(model)">
        <formly-form [form]="form" [fields]="fields" [model]="model"></formly-form>
        <button type="submit" class="btn btn-default">Submit</button>
      </form>
      <h2>Select Dialog</h2>
      <div style=" display: flex; flex-direction: row;">
        <form [formGroup]="form2">
          <mat-selection-list [formControl]="optionControl" name="shoes" [multiple]="false">
            <mat-list-option *ngFor="let opt of options" [value]="opt.value">{{opt.name}}</mat-list-option>
          </mat-selection-list>
        </form>
      </div>
      <button mat-raised-button type="button" class="mat-flat-button mat-button-base mat-primary" color="primary" (click)="testDialog()">Open Dialog</button>
  `,
  styleUrls: ['../../form/mrbau-form-global.scss'],
  encapsulation: ViewEncapsulation.None
})
export class MrbauFormlyTestComponent implements OnInit {
  form2: FormGroup;
  task : MRBauTask = {
    id: '8523702b-742d-4f4b-9e70-18c757321292',
    category: EMRBauTaskCategory.Uninitialized,
    desc: 'description',
    status: 0,
    associatedDocumentRef: [],
    associatedDocumentName: [],
    companyName: '',
    costCarrierNumber: '',
    updateWithNodeData: function (node: ResultNode): void {
      node;
      throw new Error('Function not implemented.');
    },
    updateDueDate: function (date: Date): void {
      date;
      throw new Error('Function not implemented.');
    },
    isInNotifyState: function (): boolean {
      throw new Error('Function not implemented.');
    },
    isInPausedState: function (): boolean {
      throw new Error('Function not implemented.');
    },
    isTaskInDoneState: function (): boolean {
      throw new Error('Function not implemented.');
    },
    isTaskInNormalState: function (): boolean {
      throw new Error('Function not implemented.');
    },
    isTaskModificationUiVisible: function (): boolean {
      throw new Error('Function not implemented.');
    },
    isCommonTask: function (): boolean {
      throw new Error('Function not implemented.');
    },
    isNewDocumentTask: function (): boolean {
      throw new Error('Function not implemented.');
    },
    getStateLabel: function (): string {
      throw new Error('Function not implemented.');
    },
    isTaskInNotifyOrDoneState: function (): boolean {
      throw new Error('Function not implemented.');
    },
    getStateAsString: function (): string {
      throw new Error('Function not implemented.');
    }
  }
  readonly nodeIdDoc1 = 'ff68441f-34cf-4b8b-b34c-a2e53b6252e1';
  readonly nodeIdDoc2 = 'a36703db-ac59-466e-b5a4-f747001b3834';

  options = [
    {value: {class:MrbauCalcDeductionDialogComponent}, name: 'MrbauCalcDeductionDialogComponent'},
    {value: {class:MrbauCompareDocumentsComponent, payload: {left: {nodeId: this.nodeIdDoc1}, right: {nodeId:this.nodeIdDoc2}}, width: '95vw'}, name: 'MrbauCompareDocumentsComponent'},
    {value: {class:MrbauConfirmTaskDialogComponent}, name: 'MrbauConfirmTaskDialogComponent'},
    {value: {class:MrbauDelegateTaskDialogComponent, payload: this.task }, name: 'MrbauDelegateTaskDialogComponent'},
    {value: {class:MrbauInboxAssignDialogComponent}, name: 'MrbauInboxAssignDialogComponent'},
    {value: {class:MrbauNewTaskDialogComponent}, name: 'MrbauNewTaskDialogComponent'},
    {value: {class:MrbauPrintLinkedDocsDialogComponent, payload: {nodes: [{entry : {id : this.nodeIdDoc1}}]} }, name: 'MrbauPrintLinkedDocsDialogComponent'},
    {value: {class:MrbauShowDocTaskDialogComponent, payload: {nodes: [{entry : {id : this.nodeIdDoc1}}]}}, name: 'MrbauShowDocTaskDialogComponent'},
    {value: {class:MrbauShowModifyCompanyDialogComponent}, name: 'MrbauShowModifyCompanyDialogComponent'},
    {value: {class:MrbauTagDoneLinkedDocsDialogComponent}, name: 'MrbauTagDoneLinkedDocsDialogComponent'},
  ];
  optionControl = new FormControl();

  constructor(private dialog: MatDialog)
  {
      this.dialog;
      this.form2 = new FormGroup({dialogs: this.optionControl});
  }

  ngOnInit(): void {

  }

  form = new FormGroup({});
  model = { email: 'email@gmail.com' };
  fields: FormlyFieldConfig[] = [
    {
      className: 'flex-1',
      key: 'ignore:mrbauNewCompanyButton',
      type: 'mrbauFormlyButton',
      props: {
        //appearance:"fill",
        label: 'Firma anlegen',
        text: 'FIRMA ANLEGEN',
        btnType: 'default',
        onClick: () => {
          console.log('click');
        },
      },
    },
    {
      key: 'mrbauFormlyAllSet',
      type: 'mrbauFormlyAllSet',
      props: {
        //appearance:"fill",
        icon : 'fingerprint',
        title : 'PARAPHIEREN UND SIGNIEREN',
        subtitle : 'Prüfen, Paraphieren und Signieren Sie den Auftrag. Anschließend deligieren Sie den Auftrag an die technische Assistenz zum Versand an den Auftragnehmer.',
        additionalText : ['1) Prüfen und Paraphieren (Bauleiter)', '2) Signieren (Unternehmensbereichsleiter)', '3) Signieren (Geschäftsführer)','4) Deligieren an technische Assistenz für den Versand']
      }
    },
    {
      key: 'email',
      type: 'input',
      props: {
        label: 'Email address',
        placeholder: 'Enter email',
        required: true,
      }
    },
    {
      fieldGroupClassName: 'flex-container-min-width',
      fieldGroup: [
        {
          className: 'flex-4',
          key: 'auditor1',
          type: 'select',
          props: {
            label: 'Bauleiter',
            description: 'Bauleiter',
            options: ['test1', 'test2', 'test3'],
            valueProp: 'id',
            labelProp: 'displayName',
            required: false,
          },
        },
        {
          className: 'flex-1',
          key: 'ignore:mrbauResetAuditor1',
          type: 'mrbauFormlyButton',
          props: {
            text: 'Reset',
            btnType: 'default',
            onClick: (field:any) => {field.form.get('auditor1')?.setValue(null);},
          },
        },
      ]
    },
  ];

  onSubmit(model:any) {
    console.log(model);
  }

  testDialog() {
    if (!this.optionControl.value[0]) {
      console.log("Select a dialog first!")
      return;
    }
    //this.dialog.open(MrbauNewTaskDialogComponent, {
    this.dialog.open(this.optionControl.value[0].class, {
      data: { payload: this.optionControl.value[0].payload || null },
      width: this.optionControl.value[0].width || undefined,
      //height : 'auto'
    });


  }
}
