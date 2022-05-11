import { MRBauTask } from '../mrbau-task-declarations';
import { FormlyFieldConfig } from '@ngx-formly/core';


export const enum MrbauTaskForms {
  FORM_CONFIG_EMPTY,
  FORM_CONFIG_TEST,
  FORM_CONFIG_TEST2,
  FORM_CONFIG_TEST3
}

export class MrbauTaskFormLibrary {

  static getFormEnumByTask(task : MRBauTask) : MrbauTaskForms
  {
    if (task == null)
    {
      return MrbauTaskForms.FORM_CONFIG_EMPTY;
    }
    return MrbauTaskForms.FORM_CONFIG_TEST;
  }

  static getForm(task : MRBauTask) : FormlyFieldConfig[]
  {
    const taskForm = this.getFormEnumByTask(task);
    return this.getFormlyFieldConfig(taskForm);
  }

  static getFormlyFieldConfig(type : MrbauTaskForms) : FormlyFieldConfig[]
  {
    return this.TASK_FORM_MAP.get(type);
  }

  private static readonly TASK_FORM_MAP = new Map<number, FormlyFieldConfig[]>([
    [MrbauTaskForms.FORM_CONFIG_EMPTY, [] ],
    [MrbauTaskForms.FORM_CONFIG_TEST, [
      {
        fieldGroupClassName: 'flex-container',
        fieldGroup: [
          {
            className: 'flex-1',
            type: 'input',
            key: 'firstName',
            templateOptions: {
              label: 'First Name',
            },
          },
          {
            className: 'flex-1',
            type: 'input',
            key: 'lastName',
            templateOptions: {
              label: 'Last Name',
            },
            expressionProperties: {
              'templateOptions.disabled': '!model.firstName',
            },
          },
        ],
      },
    ] ],
    [MrbauTaskForms.FORM_CONFIG_TEST2, [
      {
        fieldGroupClassName: 'flex-container',
        fieldGroup: [
          {
            className: 'flex-1',
            type: 'input',
            key: 'firstName',
            templateOptions: {
              label: 'First Name',
            },
          }
        ],
      },
    ] ],
    [MrbauTaskForms.FORM_CONFIG_TEST3, [
      {
      fieldGroupClassName: 'flex-container',
      fieldGroup: [
        {
          className: 'flex-1',
          type: 'input',
          key: 'firstName',
          templateOptions: {
            label: 'First Name',
          },
        },
        {
          className: 'flex-1',
          type: 'input',
          key: 'lastName',
          templateOptions: {
            label: 'Last Name',
          },
          expressionProperties: {
            'templateOptions.disabled': '!model.firstName',
          },
        },
      ],
      },
      {
      template: '<hr /><div><strong>Address:</strong></div>',
      },
      {
      fieldGroupClassName: 'flex-container',
      fieldGroup: [
        {
          className: 'flex-2',
          type: 'input',
          key: 'street',
          templateOptions: {
            label: 'Street',
          },
        },
        {
          className: 'flex-1',
          type: 'input',
          key: 'cityName',
          templateOptions: {
            label: 'City',
          },
        },
        {
          className: 'flex-1',
          type: 'input',
          key: 'zip',
          templateOptions: {
            type: 'number',
            label: 'Zip',
            max: 99999,
            min: 0,
            required: true,
            pattern: '\\d{5}',
          },
        },
      ],
      },
      {
      template: '<hr />',
      },
      {
      type: 'input',
      key: 'otherInput',
      templateOptions: {
        label: 'Other Input',
      },
      },
      {
      type: 'checkbox',
      key: 'otherToo',
      templateOptions: {
        label: 'Other Checkbox',
      },
      },
      ] ],
  ]);
}
