/*!
 * @license
 * Alfresco Example Content Application
 *
 * Copyright (C) 2005 - 2020 Alfresco Software Limited
 *
 * This file is part of the Alfresco Example Content Application.
 * If the software was purchased under a paid Alfresco license, the terms of
 * the paid license agreement will prevail.  Otherwise, the software is
 * provided under the following open source license terms:
 *
 * The Alfresco Example Content Application is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * The Alfresco Example Content Application is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with Alfresco. If not, see <http://www.gnu.org/licenses/>.
 */

import { BrowserModule, HammerModule } from '@angular/platform-browser';
import { NgModule, LOCALE_ID } from '@angular/core';
import { RouterModule } from '@angular/router';
import { BrowserAnimationsModule, NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TRANSLATION_PROVIDER, CoreModule, AppConfigService, DebugAppConfigService } from '@alfresco/adf-core';
import { ContentModule, ContentVersionService } from '@alfresco/adf-content-services';
import { SharedModule } from '@alfresco/aca-shared';

import { AppComponent } from './app.component';
import { APP_ROUTES } from './app.routes';

import { FilesComponent } from './components/files/files.component';
import { LibrariesComponent } from './components/libraries/libraries.component';
import { FavoriteLibrariesComponent } from './components/favorite-libraries/favorite-libraries.component';
import { NodeVersionsDialogComponent } from './dialogs/node-versions/node-versions.dialog';

import { AppStoreModule } from './store/app-store.module';
import { MaterialModule } from './material.module';
import { AppExtensionsModule } from './extensions.module';
import { CoreExtensionsModule } from './extensions/core.extensions.module';
import { AppInfoDrawerModule } from './components/info-drawer/info.drawer.module';
import { DirectivesModule } from './directives/directives.module';
import { ContextMenuModule } from './components/context-menu/context-menu.module';
import { ExtensionsModule } from '@alfresco/adf-extensions';
import { AppToolbarModule } from './components/toolbar/toolbar.module';
import { AppCreateMenuModule } from './components/create-menu/create-menu.module';
import { AppSidenavModule } from './components/sidenav/sidenav.module';
import { AppCommonModule } from './components/common/common.module';
import { AppLayoutModule } from './components/layout/layout.module';
import { AppSearchInputModule } from './components/search/search-input.module';
import { DocumentListCustomComponentsModule } from './components/dl-custom-components/document-list-custom-components.module';
import { AppSearchResultsModule } from './components/search/search-results.module';
import { AppLoginModule } from './components/login/login.module';
import { AppHeaderModule } from './components/header/header.module';
import { AppNodeVersionModule } from './components/node-version/node-version.module';
import { FavoritesComponent } from './components/favorites/favorites.component';
import { RecentFilesComponent } from './components/recent-files/recent-files.component';
import { SharedFilesComponent } from './components/shared-files/shared-files.component';
import { CreateFromTemplateDialogComponent } from './dialogs/node-template/create-from-template.dialog';
import { environment } from '../environments/environment';
import { DetailsComponent } from './components/details/details.component';
import { ContentUrlService } from './services/content-url.service';

import { DatePipe, registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import localeDe from '@angular/common/locales/de';
import localeIt from '@angular/common/locales/it';
import localeEs from '@angular/common/locales/es';
import localeJa from '@angular/common/locales/ja';
import localeNl from '@angular/common/locales/nl';
import localePt from '@angular/common/locales/pt';
import localeNb from '@angular/common/locales/nb';
import localeRu from '@angular/common/locales/ru';
import localeCh from '@angular/common/locales/zh';
import localeAr from '@angular/common/locales/ar';
import localeCs from '@angular/common/locales/cs';
import localePl from '@angular/common/locales/pl';
import localeFi from '@angular/common/locales/fi';
import localeDa from '@angular/common/locales/da';
import localeSv from '@angular/common/locales/sv';

// custom imports 3rd party
import { MatTableModule } from '@angular/material/table';
import { MatSortModule  } from '@angular/material/sort';
import { MatPaginatorModule  } from '@angular/material/paginator';
import { AngularSplitModule } from 'angular-split';
import { NgxEchartsModule } from 'ngx-echarts';
import 'echarts/theme/royal.js';
import { FormlyModule } from '@ngx-formly/core';
import { FormlyMaterialModule } from '@ngx-formly/material';
import { MatStepperModule } from '@angular/material/stepper';

// custom imports
import { BelegsammlungComponent } from './custom/belegsammlung/belegsammlung.component';
import { FoerdermanagerComponent } from './custom/foerdermanager/foerdermanager.component';
import { TestComponent } from './custom/test/test.component';
import { LoaderoverlayComponent } from './custom/loaderoverlay/loaderoverlay.component';
import { ErrormsgpaneComponent } from './custom/errormsgpane/errormsgpane.component';
import { TasksComponent } from './custom/tasks/tasks.component';
import { SplitpaneComponent } from './custom/splitpane/splitpane.component';
import { PdfpreviewComponent } from './custom/pdfpreview/pdfpreview.component';
import { TasksTableComponent } from './custom/taskstable/taskstable.component';
import { TaskIndicatorComponent } from './custom/task-indicator/task-indicator.component';
import { TasksdetailComponent } from './custom/tasksdetail/tasksdetail.component';
import { MrbauNewTaskDialogComponent } from './custom/dialogs/mrbau-new-task-dialog/mrbau-new-task-dialog.component';
import { MrbauFormlyNewTaskStepper, dateFutureValidator } from './custom/form/mrbau-stepper-validators';
import { MRBauTaskStatusPipe, MRBauTaskCategoryPipe } from './custom/mrbau-task-declarations';
import { MrbauDelegateTaskDialogComponent } from './custom/dialogs/mrbau-delegate-task-dialog/mrbau-delegate-task-dialog.component';
import { MrbauBaseTaskDialogComponent } from './custom/dialogs/mrbau-base-task-dialog/mrbau-base-task-dialog.component';
import { TaskVersionlistComponent } from './custom/task-versionlist/task-versionlist.component';
import { MrbauConfirmTaskDialogComponent } from './custom/dialogs/mrbau-confirm-task-dialog/mrbau-confirm-task-dialog.component';
import { TaskLinkedDocumentsComponent } from './custom/task-linked-documents/task-linked-documents.component';
import { FormlyFieldTaskLinkedDocumentsComponent } from './custom/formly-field-task-linked-documents/formly-field-task-linked-documents.component';
import { TaskCommentlistComponent } from './custom/task-commentlist/task-commentlist.component';

registerLocaleData(localeFr);
registerLocaleData(localeDe);
registerLocaleData(localeIt);
registerLocaleData(localeEs);
registerLocaleData(localeJa);
registerLocaleData(localeNl);
registerLocaleData(localePt);
registerLocaleData(localeNb);
registerLocaleData(localeRu);
registerLocaleData(localeCh);
registerLocaleData(localeAr);
registerLocaleData(localeCs);
registerLocaleData(localePl);
registerLocaleData(localeFi);
registerLocaleData(localeDa);
registerLocaleData(localeSv);

@NgModule({
  imports: [
    BrowserModule,
    environment.e2e ? NoopAnimationsModule : BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forRoot(APP_ROUTES, {
      useHash: true,
      enableTracing: false // enable for debug only
    }),
    MaterialModule,
    CoreModule.forRoot(),
    ContentModule.forRoot(),
    SharedModule.forRoot(),
    AppStoreModule,
    CoreExtensionsModule.forRoot(),
    ExtensionsModule.forRoot(),
    AppExtensionsModule,
    AppLoginModule,
    AppCommonModule,
    AppLayoutModule,
    DirectivesModule,
    ContextMenuModule,
    AppInfoDrawerModule,
    AppToolbarModule,
    AppSidenavModule,
    AppCreateMenuModule,
    DocumentListCustomComponentsModule,
    AppSearchInputModule,
    AppSearchResultsModule,
    AppHeaderModule,
    AppNodeVersionModule,
    HammerModule,
    BrowserModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatStepperModule,
    AngularSplitModule,
    NgxEchartsModule.forRoot({
      /**
       * This will import all modules from echarts.
       * If you only need custom modules,
       * please refer to [Custom Build] section.
       */
      echarts: () => import('echarts'), // or import('./path-to-my-custom-echarts')
    }),
    FormlyModule.forRoot({
      validators: [
        {
          name: 'date-future',
          validation: dateFutureValidator,
          options: { days: 0 },
        },
      ],
      types: [
        { name: 'newWorkflowStepper', component: MrbauFormlyNewTaskStepper, wrappers: [] },
        { name: 'taskLinkedDocuments', component: FormlyFieldTaskLinkedDocumentsComponent, wrappers: ['form-field'],
        defaultOptions: {
          templateOptions: {
              btnType: 'default',
              type: 'button',
            },
          },
        },
      ],
      extras: {
        checkExpressionOn: 'modelChange',
        lazyRender: true
        }
      }),
    FormlyMaterialModule
  ],
  declarations: [
    AppComponent,
    FilesComponent,
    DetailsComponent,
    LibrariesComponent,
    FavoriteLibrariesComponent,
    NodeVersionsDialogComponent,
    FavoritesComponent,
    RecentFilesComponent,
    SharedFilesComponent,
    CreateFromTemplateDialogComponent,
    BelegsammlungComponent,
    FoerdermanagerComponent,
    TestComponent,
    LoaderoverlayComponent,
    ErrormsgpaneComponent,
    TasksComponent,
    SplitpaneComponent,
    PdfpreviewComponent,
    TasksTableComponent,
    TaskIndicatorComponent,
    TasksdetailComponent,
    MrbauNewTaskDialogComponent,
    MrbauFormlyNewTaskStepper,
    MRBauTaskStatusPipe,
    MRBauTaskCategoryPipe,
    MrbauDelegateTaskDialogComponent,
    MrbauBaseTaskDialogComponent,
    TaskVersionlistComponent,
    MrbauConfirmTaskDialogComponent,
    TaskLinkedDocumentsComponent,
    FormlyFieldTaskLinkedDocumentsComponent,
    TaskCommentlistComponent
  ],
  providers: [
    { provide: AppConfigService, useClass: DebugAppConfigService },
    { provide: ContentVersionService, useClass: ContentUrlService },
    {
      provide: TRANSLATION_PROVIDER,
      multi: true,
      useValue: {
        name: 'app',
        source: 'assets'
      }
    },
    {
      provide: LOCALE_ID,
      useValue: 'de-AT' // 'de-DE' for Germany, 'fr-FR' for France ...
    },
    DatePipe
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
