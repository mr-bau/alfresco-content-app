import { EnvironmentProviders, importProvidersFrom, inject, LOCALE_ID, NgModule, Provider } from '@angular/core';
import localeDe from '@angular/common/locales/de';
import { CommonModule, CurrencyPipe, DatePipe, DecimalPipe, registerLocaleData } from '@angular/common';
import { RouterModule } from '@angular/router';
import { provideExtensionConfig, provideExtensions } from '@alfresco/adf-extensions';
import { ADF_COMMENTS_SERVICE, provideTranslations } from '@alfresco/adf-core';
import { MrbauExtensionService } from './services/mrbau-extension.service';
import { MrbauExtensionMainComponent } from './test/mrbau-extension-main/mrbau-extension-main.component';
//import { MrbauExtensionTasksComponent } from './test/mrbau-extension-tasks/mrbau-extension-tasks.component';
import { MrbauExtensionMridComponent } from './test/mrbau-extension-mrid/mrbau-extension-mrid.component';
import { MrbauRuleFalse, MrbauRuleHasOnlyFileOrNoSelection, MrbauRuleHasOnlyFileSelection, MrbauRuleIsMrbaArchiveDocument } from './mrbau-extension.rules';
import { BelegsammlungComponent } from './belegsammlung/belegsammlung.component';
import { MrbauSettingsComponent } from './mrbau-settings/mrbau-settings.component';
import { NodeCommentsService } from '@alfresco/adf-content-services';
import { MrbauFormlyTestComponent } from './test/mrbau-formly-test/mrbau-formly-test.component';
import { PdfpreviewwrapperComponent } from './pdf/pdfpreviewwrapper/pdfpreviewwrapper.component';
import { TaskMainComponent } from './tasks/task-main/task-main.component';
import { TaskSingleViewComponent } from './tasks/task-single-view/task-single-view.component';
import { provideEffects } from '@ngrx/effects';
import { FormlyModule } from '@ngx-formly/core';
import { autocompleteNotValidValidationMessage, autocompleteValueFromListValidator, dateFutureValidator, germanDecimalValidatorAndConverter, maxlengthValidationMessage, maxValidationMessage, minlengthValidationMessage, minValidationMessage, netGrossTaxMismatchMessage, netGrossTaxRateValidatorAndConverter, notAValidValueValidationMessage, regexValidator, requiredValidationMessage } from './form/mrbau-formly-validators';
import { MrbauFormlyLabelWrapperComponent } from './form/wrapper/mrbau-formly-label-wrapper-component';
import { MrbauFormlyMarginWrapperComponent } from './form/wrapper/mrbau-formly-margin-wrapper.component';
import { MrbauFormlyNewTaskStepper } from './form/mrbau-formly-new-task-stepper.component';
import { MrbauFormlyAutocompleteComponent } from './form/mrbau-formly-autocomplete.component';
import { MrbauFormlyLabelComponent } from './form/mrbau-formly-label.component';
import { MrbauFormlyButtonComponent } from './form/mrbau-formly-button.component';
import { MrbauFormlyAllSetComponent } from './form/mrbau-formly-all-set.component';
import { MrbauFormlyAutocompleteSelectFormOptionsComponent } from './form/mrbau-formly-autocomplete-select-form-options.component';
import { MrbauFormlySelectSearchVendorComponent } from './form/selectsearch/mrbau-formly-selectsearch-vendor.component';
import { MrbauFormlySelectSearchProjectComponent } from './form/selectsearch/mrbau-formly-selectsearch-project.component';
import { MrbauFormlyDuplicatedDocumentComponent } from './form/mrbau-formly-duplicated-document.component';
import { MrbauFormlyFieldTaskLinkedDocumentsComponent } from './form/mrbau-formly-field-task-linked-documents.component';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { MrbauEffects } from './store/effects/mrbau.effects';
import { ReactiveFormsModule } from '@angular/forms';
import { MAT_DATE_LOCALE, MAT_DATE_FORMATS } from '@angular/material/core';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
//import { MRBAU_EXTENSION_ROUTES } from './mrbau-extension.routes';

registerLocaleData(localeDe);

export const MRBAU_GERMAN_DATE_FORMATS = {
  parse: {
    dateInput: 'DD.MM.YYYY',
  },
  display: {
    dateInput: 'DD.MM.YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

export function provideMrbauExtensionExtension(): (Provider| EnvironmentProviders)[]
{
  return [
    provideTranslations('mrbau-extension', 'assets/mrbau-extension'),
    provideExtensionConfig(['mrbau-extension.json']),
    provideEffects(MrbauEffects),
    provideExtensions({
      components: {
        'mrbau-extension.main.component' : MrbauExtensionMainComponent,
        //'mrbau-extension.tasks.component' : MrbauExtensionTasksComponent,
        'mrbau-extension.tasks.component' : TaskMainComponent,
        'mrbau-extension.tasks.single.component' : TaskSingleViewComponent,
        'mrbau-extension.mrid.component' : MrbauExtensionMridComponent,
        'mrbau-extension.belegsammlung.component' : BelegsammlungComponent,
        'mrbau-extension.mrbausettings.component' : MrbauSettingsComponent,
        'mrbau-extension.mrbauformlytest.component' : MrbauFormlyTestComponent,
        'mrbau-extension.mrbaupdfview.component' : PdfpreviewwrapperComponent,
      },
      evaluators: {
        'mrbau-extension.disabled': () => { const mrbauExtensionService = inject(MrbauExtensionService); return !mrbauExtensionService.mrbauExtensionEnabled();},
        'mrbau.extension.rule.only-files-selected': MrbauRuleHasOnlyFileSelection,
        'mrbau.extension.rule.nothing-or-only-files-selected': MrbauRuleHasOnlyFileOrNoSelection,
        'mrbau.extension.rule.is-mrba-archiveDocument' : MrbauRuleIsMrbaArchiveDocument,
        'mrbau.extension.rule.FALSE' : MrbauRuleFalse,
      },
    }),
    importProvidersFrom (
      CommonModule,
      RouterModule,
      ReactiveFormsModule,
      MatMomentDateModule,
      FormlyModule.forRoot(
        {
          validationMessages: [
            { name: 'required', message: requiredValidationMessage },
            { name: 'minLength', message: minlengthValidationMessage },
            { name: 'maxLength', message: maxlengthValidationMessage },
            { name: 'min', message: minValidationMessage },
            { name: 'max', message: maxValidationMessage },
            { name: 'pattern', message: notAValidValueValidationMessage},
            { name: 'autocomplete', message: autocompleteNotValidValidationMessage},
            { name: 'netGrossTaxMismatch', message: netGrossTaxMismatchMessage },
          ],
          validators: [
            { name: 'date-future', validation: dateFutureValidator, options: { 'days': 0 } },
            { name: 'mrbauAutocompleteValidator', validation: autocompleteValueFromListValidator, options: {} },
            { name: 'mrbauGermanDecimalValidatorAndConverter', validation: germanDecimalValidatorAndConverter, options: {} },
            { name: 'mrbauNetGrossTaxRateValidatorAndConverter', validation: netGrossTaxRateValidatorAndConverter, options: {} },
            //{ name: 'mrbauNetGrossValidator', validation: netGrossValidator, options: {} },
            { name: 'mrbauRegexValidator', validation: regexValidator, options: {} }
          ],
          wrappers: [
            { name: 'mrbauFormlyLabelWrapper', component: MrbauFormlyLabelWrapperComponent },
            { name: 'mrbauFormlyMarginWrapper', component: MrbauFormlyMarginWrapperComponent },
          ],
          types: [
            { name: 'mrbauFormlySelectSearchVendor', component: MrbauFormlySelectSearchVendorComponent, wrappers: ['form-field'] },
            { name: 'mrbauFormlySelectSearchProject', component: MrbauFormlySelectSearchProjectComponent, wrappers: ['form-field'] },
            { name: 'mrbauFormlyNewTaskStepper', component: MrbauFormlyNewTaskStepper, wrappers: [] },
            { name: 'mrbauFormlyDuplicatedDocument', component: MrbauFormlyDuplicatedDocumentComponent, wrappers: [], defaultOptions: { props: {required: true}}},
            { name: 'mrbauFormlyAutocomplete', component: MrbauFormlyAutocompleteComponent, wrappers: ['form-field']},
            { name: 'mrbauFormlyLabel', component: MrbauFormlyLabelComponent, wrappers: ['mrbauFormlyLabelWrapper']},
            { name: 'mrbauFormlyButton', component: MrbauFormlyButtonComponent, wrappers: [], defaultOptions: { props: { btnType: 'default', type: 'button'}},},
            { name: 'mrbauFormlyAllSet', component: MrbauFormlyAllSetComponent, wrappers: [], defaultOptions: { props: { icon : 'done', title : 'Alle Schritte wurden erledigt.', subtitle : 'Klicken Sie auf Erledigen um den Workflow abzuschließen.'}}},
            { name: 'mrbauFormlyAutocompleteSelectFormOptions', component: MrbauFormlyAutocompleteSelectFormOptionsComponent, wrappers: ['form-field']},
            { name: 'mrbauFormlyTaskLinkedDocuments', component: MrbauFormlyFieldTaskLinkedDocumentsComponent, wrappers: ['mrbauFormlyMarginWrapper'], defaultOptions: { props: { btnType: 'default', type: 'button'}}},
          ],
          extras: {
            checkExpressionOn: 'modelChange',
            lazyRender: true
          }
        }
      )
    ),
    MrbauExtensionService,
    { provide: LOCALE_ID, useValue: 'de-DE' },
    { provide: MAT_DATE_LOCALE, useValue: 'de-DE' },
    { provide: MAT_DATE_FORMATS, useValue: MRBAU_GERMAN_DATE_FORMATS },
    DatePipe,
    DecimalPipe,
    CurrencyPipe,
    {
      provide: ADF_COMMENTS_SERVICE,
      useClass: NodeCommentsService
    },
    //{ provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: {appearance: 'outline'}}
    { provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: {appearance: 'fill'}}
  ];
}
/* @deprecated use `provideMrbauExtensionExtension()` provider api instead */
@NgModule({
  imports: [],
  providers: [...provideMrbauExtensionExtension()]
})
export class MrbauExtensionModule {}

/*
@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    //RouterModule.forChild(MRBAU_EXTENSION_ROUTES),
    //ShellModule.withRoutes({
    //  shellChildren: [MRBAU_EXTENSION_LAYOUT_ROUTES]
    //}),
    // Forms / Formly
    //EmptyContentComponent
    FormlyModule.forRoot(
      {
        validationMessages: [
          { name: 'required', message: requiredValidationMessage },
          { name: 'minLength', message: minlengthValidationMessage },
          { name: 'maxLength', message: maxlengthValidationMessage },
          { name: 'min', message: minValidationMessage },
          { name: 'max', message: maxValidationMessage },
          { name: 'pattern', message: notAValidValueValidationMessage},
          { name: 'autocomplete', message: autocompleteNotValidValidationMessage},
          { name: 'netGrossTaxMismatch', message: netGrossTaxMismatchMessage },
        ],
        validators: [
          { name: 'date-future', validation: dateFutureValidator, options: { 'days': 0 } },
          { name: 'mrbauAutocompleteValidator', validation: autocompleteValueFromListValidator, options: {} },
          { name: 'mrbauGermanDecimalValidatorAndConverter', validation: germanDecimalValidatorAndConverter, options: {} },
          { name: 'mrbauNetGrossTaxRateValidatorAndConverter', validation: netGrossTaxRateValidatorAndConverter, options: {} },
          //{ name: 'mrbauNetGrossValidator', validation: netGrossValidator, options: {} },
          { name: 'mrbauRegexValidator', validation: regexValidator, options: {} }
        ],
        wrappers: [
          { name: 'mrbauFormlyLabelWrapper', component: MrbauFormlyLabelWrapperComponent },
          { name: 'mrbauFormlyMarginWrapper', component: MrbauFormlyMarginWrapperComponent },
        ],
        types: [
          { name: 'mrbauFormlySelectSearchVendor', component: MrbauFormlySelectSearchVendorComponent, wrappers: ['form-field'] },
          { name: 'mrbauFormlySelectSearchProject', component: MrbauFormlySelectSearchProjectComponent, wrappers: ['form-field'] },
          { name: 'mrbauFormlyNewTaskStepper', component: MrbauFormlyNewTaskStepper, wrappers: [] },
          { name: 'mrbauFormlyDuplicatedDocument', component: MrbauFormlyDuplicatedDocumentComponent, wrappers: [], defaultOptions: { props: {required: true}}},
          { name: 'mrbauFormlyAutocomplete', component: MrbauFormlyAutocompleteComponent, wrappers: ['form-field']},
          { name: 'mrbauFormlyLabel', component: MrbauFormlyLabelComponent, wrappers: ['mrbauFormlyLabelWrapper']},
          { name: 'mrbauFormlyButton', component: MrbauFormlyButtonComponent, wrappers: [], defaultOptions: { props: { btnType: 'default', type: 'button'}},},
          { name: 'mrbauFormlyAllSet', component: MrbauFormlyAllSetComponent, wrappers: [], defaultOptions: { props: { icon : 'done', title : 'Alle Schritte wurden erledigt.', subtitle : 'Klicken Sie auf Erledigen um den Workflow abzuschließen.'}}},
          { name: 'mrbauFormlyAutocompleteSelectFormOptions', component: MrbauFormlyAutocompleteSelectFormOptionsComponent, wrappers: ['form-field']},
          { name: 'mrbauFormlyTaskLinkedDocuments', component: MrbauFormlyFieldTaskLinkedDocumentsComponent, wrappers: ['mrbauFormlyMarginWrapper'], defaultOptions: { props: { btnType: 'default', type: 'button'}}},
        ],
        extras: {
          checkExpressionOn: 'modelChange',
          lazyRender: true
        }
      }
    ),
  ],
  declarations: [
  ],
  providers: [
    {
      provide: TRANSLATION_PROVIDER,
      multi: true,
      useValue: {
          name: 'mrbau-extension',
          source: 'assets/mrbau-extension',
      },
    },
    MrbauExtensionService,
    provideExtensionConfig(['mrbau-extension.json']),
    {
      provide: LOCALE_ID,
      useValue: 'de-DE' // 'de-DE' for Germany, 'fr-FR' for France ...
    },
    DatePipe,
    DecimalPipe,
    CurrencyPipe,
    {
      provide: ADF_COMMENTS_SERVICE,
      useClass: NodeCommentsService
    },
    //{ provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: {appearance: 'outline'}}
    { provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: {appearance: 'fill'}}
  ],
  exports: [
   ]
})
export class MrbauExtensionModule {
  constructor(extensionService: ExtensionService, mrbauExtensionService: MrbauExtensionService) {
    extensionService.setComponents({
      'mrbau-extension.main.component' : MrbauExtensionMainComponent,
      //'mrbau-extension.tasks.component' : MrbauExtensionTasksComponent,
      'mrbau-extension.tasks.component' : TaskMainComponent,
      'mrbau-extension.tasks.single.component' : TaskSingleViewComponent,
      'mrbau-extension.mrid.component' : MrbauExtensionMridComponent,
      'mrbau-extension.belegsammlung.component' : BelegsammlungComponent,
      'mrbau-extension.mrbausettings.component' : MrbauSettingsComponent,
      'mrbau-extension.mrbauformlytest.component' : MrbauFormlyTestComponent,
      'mrbau-extension.mrbaupdfview.component' : PdfpreviewwrapperComponent,
    });
    extensionService.setEvaluators({
       'mrbau-extension.disabled': () => !mrbauExtensionService.mrbauExtensionEnabled(),
       'mrbau.extension.rule.only-files-selected': MrbauRuleHasOnlyFileSelection,
       'mrbau.extension.rule.nothing-or-only-files-selected': MrbauRuleHasOnlyFileOrNoSelection,
       'mrbau.extension.rule.is-mrba-archiveDocument' : MrbauRuleIsMrbaArchiveDocument,
       'mrbau.extension.rule.FALSE' : MrbauRuleFalse,
    });
  }
}
*/
