import { EnvironmentProviders, NgModule, Provider } from '@angular/core';
//import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
//import { RouterModule } from '@angular/router';
import { MRBAU_COMMON_ROUTES } from './lib.routes';
import { provideExtensionConfig, provideExtensions } from '@alfresco/adf-extensions';
import { CommonTestComponent } from './commontest/commontest.component';
import { provideRouter } from '@angular/router';

export function provideMrbauCommonExtension(): (Provider | EnvironmentProviders)[]
{
  return [
    provideExtensionConfig(['mrbau-common.json']),
    provideRouter(MRBAU_COMMON_ROUTES),
    provideExtensions({
      components: {
        'mrbau.common.component.test': CommonTestComponent,
        //'mrbau.common.component.test': MrbauPageLayoutComponent,
      },
      evaluators: {
      }
    })
  ];
}

/* @deprecated use `provideMrbauCommonExtension()` provider api instead */
@NgModule({
  imports: [],
  providers: [...provideMrbauCommonExtension()],
  exports: []
})
export class MrbauCommonModule {}

/*
@NgModule({
  imports: [CommonModule, RouterModule.forChild(mrbauCommonRoutes), ErrormsgpaneComponent, LoaderoverlayComponent, MrbauPageLayoutComponent, ShowNavbarOverlayComponent],
  providers: [
    provideExtensionConfig(['mrbau-common.json']),
    DatePipe,
    DecimalPipe,
  ],
  exports: [ ErrormsgpaneComponent, LoaderoverlayComponent, MrbauPageLayoutComponent, ShowNavbarOverlayComponent]
})
export class MrbauCommonModule {
  constructor(private extensionService: ExtensionService) {
    this.extensionService.setComponents({
      'mrbau.common.component.test': CommonTestComponent,
      //'mrbau.common.component.test': MrbauPageLayoutComponent,
    });
  }
}
*/
