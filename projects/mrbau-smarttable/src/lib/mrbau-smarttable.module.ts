import { NgModule, Provider } from '@angular/core';
import { provideExtensionConfig, provideExtensions } from '@alfresco/adf-extensions';
import { TaskSmartTableComponent } from './task-smart-table/task-smart-table.component';
import { DocSmartTableComponent } from './doc-smart-table/doc-smart-table.component';

export function provideMrbauSmarttableExtension(): Provider[]
{
  return [
    provideExtensionConfig(['mrbau-smarttable.json']),
    provideExtensions({
      components: {
        'mrbau-extension.tasksmarttable.component' : TaskSmartTableComponent,
        'mrbau-extension.docsmarttable.component' : DocSmartTableComponent,
      },
      evaluators: {
      }
    })
  ];
}

/* @deprecated use `provideMrbauSmarttableExtension()` provider api instead */
@NgModule({
  imports: [],
  providers: [...provideMrbauSmarttableExtension()],
  exports: []
})
export class MrbauSmarttableModule {}

/*
@NgModule({
  imports: [CommonModule, RouterModule.forChild(mrbauSmarttableRoutes), TaskSmartTableComponent, DocSmartTableComponent],
  providers: [provideExtensionConfig(['mrbau-smarttable.json'])],
  exports : [ TaskSmartTableComponent, DocSmartTableComponent ]
})
export class MrbauSmarttableModule {
  constructor(extensionService: ExtensionService) {
    extensionService.setComponents({
      'mrbau-extension.tasksmarttable.component' : TaskSmartTableComponent,
      'mrbau-extension.docsmarttable.component' : DocSmartTableComponent,
    });
  }

}
*/
