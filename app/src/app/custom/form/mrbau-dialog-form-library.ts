import { FormlyFieldConfig } from '@ngx-formly/core';

export const enum MrbauDialogForms {
  NewTaskDialog,
  TestDialog,
}


export class MrbauDialogFormLibrary {
  static getDialogFormlyFieldConfig(type : MrbauDialogForms) : FormlyFieldConfig[]
  {
    return this.DIALOG_FORM_MAP.get(type);
  }

  private static readonly DIALOG_FORM_MAP = new Map<number, FormlyFieldConfig[]>([
    [
      MrbauDialogForms.TestDialog, [
        {
          key: 'text',
          type: 'input',
          templateOptions: {
            label: 'Text',
            placeholder: 'Formly is terrific!',
            required: true,
          },
        }
      ],
    ],
    [
    MrbauDialogForms.NewTaskDialog, [
      {
        fieldGroupClassName: 'flex-container',
        type: 'newWorkflowStepper',
        fieldGroup: [
          {
            templateOptions: { label: 'Art der Aufgabe' },
            fieldGroup: [
              {
                className: 'flex-4',
                key: 'type',
                type: 'select',
                templateOptions: {
                  label: 'Bitte eine Aufgabe auswählen',
                  options: [
                    {label: 'Eine Aufgabe sich selbst oder einem Kollegen zuweisen', value: '1002', group: 'Allgemeine Aufgaben'},
                    {label: 'Überprüfen und Genehmigen', value: '1003', group: 'Allgemeine Aufgaben'},
                    {label: 'Spezielle Aufgabe 1', value: '2001', group: 'Spezielle Aufgabe'},
                    {label: 'Spezielle Aufgabe 2', value: '2002', group: 'Spezielle Aufgabe'},
                    {label: 'Spezielle Aufgabe 3', value: '2003', group: 'Spezielle Aufgabe'},
                  ],
                  required: true,
                },
              }
            ],
          },
          {
            templateOptions: { label: 'Aufgaben Details' },
            fieldGroupClassName: 'flex-container',
            fieldGroup: [
              {
                className: 'flex-5',
                key: 'description',
                type: 'input',
                templateOptions: {
                  label: 'Aufgabe',
                  description: 'Bezeichnung',
                  maxLength: 100,
                  required: true,
                },
              },
              {
                className: 'flex-5',
                key: 'fullDescription',
                type: 'textarea',
                templateOptions: {
                  label: 'Beschreibung',
                  description: 'Beschreibung',
                  maxLength: 250,
                  required: false,
                },
              },
              {
                className: 'flex-1',
                key: 'dueDate',
                type: 'input',
                templateOptions: {
                  label: 'Fällig bis',
                  type: 'date',
                },
                validators: {
                  validation: ['date-future'],
                },
              },
              {
                className: 'flex-1',
                key: 'priority',
                type: 'select',
                templateOptions: {
                  label: 'Priorität',
                  placeholder: 'Placeholder',
                  description: 'Description',
                  required: true,
                  options: [
                    { value: 1, label: 'Hoch' },
                    { value: 2, label: 'Mittel', default: true },
                    { value: 3, label: 'Niedrig'  },
                  ],
                },
              },
              {
                key: 'sport',
                type: 'select',
                templateOptions: {
                  label: 'Sport',
                  options: [],
                  valueProp: 'id',
                  labelProp: 'name',
                },
              },
            ],
          }
        ]
      }
    ]
  ]]);
}
