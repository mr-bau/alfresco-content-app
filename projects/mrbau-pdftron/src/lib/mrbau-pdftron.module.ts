import { NgModule, Provider } from '@angular/core';
import { provideExtensionConfig, provideExtensions } from '@alfresco/adf-extensions';
import { PdftronComponent } from './pdftron/pdftron.component';


export function provideMrbauPdftronExtension(): Provider[]
{
  return [
    provideExtensionConfig(['mrbau-pdftron.json']),
    provideExtensions({
      components: {
        'mrbau-pdftron.pdftron.component' : PdftronComponent
      }
    }),
  ];
}

/* @deprecated use `provideMrbauPdftronExtension()` provider api instead */
@NgModule({
  imports: [],
  providers: [...provideMrbauPdftronExtension()],
  exports: []
})
export class MrbauPdftronModule {}

/*
@NgModule({
  imports: [CommonModule, RouterModule.forChild(mrbauPdftronRoutes), PdftronComponent],
  providers: [provideExtensionConfig(['mrbau-pdftron.json'])],
  exports : [ PdftronComponent ]
})
export class MrbauPdftronModule {}
*/
