import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from '@alfresco/adf-core';

import { ExtensionService, provideExtensionConfig } from '@alfresco/adf-extensions';
import { CoreModule, TRANSLATION_PROVIDER } from '@alfresco/adf-core';

import { MrbauExtensionComponent } from './mrbau-extension.component';
import { MrbauExtensionService } from './mrbau-extension.service';

export function components() {
    return [MrbauExtensionComponent];
}

@NgModule({
    imports: [CoreModule, BrowserModule, FormsModule, MaterialModule],
    providers: [
        {
            provide: TRANSLATION_PROVIDER,
            multi: true,
            useValue: {
                name: 'adf-my-extension',
                source: 'assets/adf-my-extension',
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
          'mrbau-extension.main.component' : MrbauExtensionComponent,
        });
        extensions.setEvaluators({
           'mrbau-extension.disabled': () => !mrbauService.mrbauSmartViewerEnabled(),
        });
    }
}
