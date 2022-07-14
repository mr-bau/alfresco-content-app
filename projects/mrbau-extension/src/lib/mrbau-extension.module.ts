import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from '@alfresco/adf-core';
import { DragDropModule } from '@angular/cdk/drag-drop';

import { ExtensionService, provideExtensionConfig } from '@alfresco/adf-extensions';
import { CoreModule, TRANSLATION_PROVIDER } from '@alfresco/adf-core';

import { MrbauExtensionService } from './mrbau-extension.service';

import { MrbauExtensionMainComponent } from './mrbau-extension-main/mrbau-extension-main.component';
import { MrbauExtensionTasksComponent } from './mrbau-extension-tasks/mrbau-extension-tasks.component';
import { MrbauExtensionMridComponent } from './mrbau-extension-mrid/mrbau-extension-mrid.component';
import { MrbauRuleHasOnlyFileSelection } from './mrbau-extension.rules';

export function components() {
    return [MrbauExtensionMainComponent, MrbauExtensionTasksComponent, MrbauExtensionMridComponent];
}

@NgModule({
    imports: [CoreModule, BrowserModule, FormsModule, MaterialModule, DragDropModule],
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
    ],
    declarations: components(),
    exports: components(),
})
export class MrbauExtensionModule {
    constructor(extensions: ExtensionService, mrbauService: MrbauExtensionService) {
        extensions.setComponents({
          'mrbau-extension.main.component' : MrbauExtensionMainComponent,
          'mrbau-extension.tasks.component' : MrbauExtensionTasksComponent,
          'mrbau-extension.mrid.component' : MrbauExtensionMridComponent,
        });
        extensions.setEvaluators({
           'mrbau-extension.disabled': () => !mrbauService.mrbauSmartViewerEnabled(),
           'mrbau.extension.rule.only-files-selected': MrbauRuleHasOnlyFileSelection
        });
    }
}
