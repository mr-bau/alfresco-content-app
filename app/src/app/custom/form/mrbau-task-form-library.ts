import { MRBauTask, MRBauTaskStatusNamesReduced,  } from '../mrbau-task-declarations';
import { FormlyFieldConfig } from '@ngx-formly/core';


export const enum MrbauTaskForms {
  FORM_CONFIG_EMPTY,
  FORM_CONFIG_TEST,
  FORM_CONFIG_TEST2,
  FORM_CONFIG_TEST3
}

export class MrbauTaskFormLibrary {

  static getForm(task : MRBauTask) : FormlyFieldConfig[]
  {
    if (task)
    {
      switch (task.category)
      {
        default:
          return this.formTest;
      }
    }
    return [];
  }

  private static formTest : FormlyFieldConfig[] = [
    {
      fieldGroupClassName: 'flex-container',
      fieldGroup: [
        {
          className: 'flex-1',
          type: 'select',
          key: 'status',
          templateOptions: {
            label: 'Status',
            options: MRBauTaskStatusNamesReduced
          },
        }

      ],
    },
    {
      fieldGroupClassName: 'flex-container',
      fieldGroup: [
        {
          className: 'flex-1',
          key: 'comment',
          type: 'textarea',
          templateOptions: {
            label: 'Neuer Kommentar',
            description: 'Kommentar',
            lines: 10
          }
        }
      ],
    }
  ];

}

