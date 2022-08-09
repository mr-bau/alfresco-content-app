import { FormControl, ValidationErrors } from '@angular/forms';
import { FormlyFieldConfig } from '@ngx-formly/core';

export function maxlengthValidationMessage(err, field) {
  err;
  return `Die Anzahl der Zeichen muss kleiner als ${field.templateOptions.maxLength} sein`;
}

export function dateFutureValidator(control: FormControl, field: FormlyFieldConfig, options = {}): ValidationErrors {
  control;
  field;
  let msg:string;
  let days : number = (options['days']) ? options['days'] : 0;
  let date: Date = new Date(control.value);
  date.setDate( date.getDate() - days);
  let now = new Date();
  if (date.getTime() < now.getTime())
  {
    msg = (days) ? `Der Tag muss ${options['days']} Tage in der Zukunft liegen.` : 'Der Tag muss in der Zukunft liegen.';
  }
  return (msg) ? { 'date-future': { message: msg } } : null;
}
