import { FormlyFieldConfig } from '@ngx-formly/core';

export const enum MrbauDialogForms {
  NewTaskDialog,
}


export class MrbauDialogFormLibrary {
  static getDialogFormlyFieldConfig(type : MrbauDialogForms) : FormlyFieldConfig[]
  {
    return this.DIALOG_FORM_MAP.get(type);
  }

  private static readonly DIALOG_FORM_MAP = new Map<number, FormlyFieldConfig[]>([
  [
    MrbauDialogForms.NewTaskDialog, [
      {
        fieldGroupClassName: 'flex-container',
        type: 'stepper',
        fieldGroup: [
          {
            templateOptions: { label: 'Personal data' },
            fieldGroup: [
              {
                key: 'firstname',
                type: 'input',
                templateOptions: {
                  label: 'First name',
                  required: true,
                },
              },
              {
                key: 'age',
                type: 'input',
                templateOptions: {
                  type: 'number',
                  label: 'Age',
                  required: true,
                },
              },
            ],
          },
          {
            templateOptions: { label: 'Destination' },
            fieldGroup: [
              {
                key: 'country',
                type: 'input',
                templateOptions: {
                  label: 'Country',
                  required: true,
                },
              },
            ],
          },
          {
            templateOptions: { label: 'Day of the trip' },
            fieldGroup: [
              {
                key: 'day',
                type: 'input',
                templateOptions: {
                  type: 'date',
                  label: 'Day of the trip',
                  required: true,
                },
              },
            ],
          },
        ]
      }
    ]
  ]]);
}
