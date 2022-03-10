import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { ExtensionService, provideExtensionConfig } from '@alfresco/adf-extensions';
import { CoreModule, MaterialModule, TRANSLATION_PROVIDER } from '@alfresco/adf-core';

import { AcaMrbauExtensionComponent } from './aca-mrbau-extension.component';
import { AcaMrbauExtensionService } from './aca-mrbau-extension.service';

export function components() {
  return [AcaMrbauExtensionComponent];
}

@NgModule({
  imports: [CoreModule, BrowserModule, FormsModule, MaterialModule],
  providers: [
      {
          provide: TRANSLATION_PROVIDER,
          multi: true,
          useValue: {
              name: 'aca-mrbau-extension',
              source: 'assets/aca-mrbau-extension',
          },
      },
      AcaMrbauExtensionService,
      provideExtensionConfig(['aca-mrbau-extension.json']),
  ],
  declarations: components(),
  exports: components(),
})
export class AcaMrbauExtensionModule {
  constructor(extensions: ExtensionService, myService : AcaMrbauExtensionService) {
      extensions.setComponents({
        'aca-mrbau-extension.main.component' : AcaMrbauExtensionComponent,
      });
      extensions.setEvaluators({
         'aca-mrbau-extension.disabled': () => !myService.mySmartViewerEnabled(),
      });
  }
}

