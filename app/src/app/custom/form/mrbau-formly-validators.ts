import { FormControl, ValidationErrors } from '@angular/forms';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { SelectFormOptions } from '../services/mrbau-conventions.service';


export const PAYMENT_DAYS_VALID_RANGE_MIN = 1;
export const PAYMENT_DAYS_VALID_RANGE_MAX = 300;

export function requiredValidationMessage(err, field) {
  err;field;
  return 'Dieses Feld ist erforderlich.';
}

export function maxlengthValidationMessage(err, field) {
  err;
  return `Die Anzahl der Zeichen muss kleiner gleich ${field.templateOptions.maxLength} sein.`;
}

export function minlengthValidationMessage(err, field) {
  err;
  return `Die Anzahl der Zeichen muss mindestens ${field.templateOptions.minLength} betragen.`;
}



export function minValidationMessage(err, field) {
  err;
  return `Der Wert muss mindestens ${field.templateOptions.min} betragen.`;
}

export function maxValidationMessage(err, field) {
  err;
  return `Der Wert muss kleiner gleich ${field.templateOptions.max} sein.`;
}

export function notAValidValueValidationMessage(err, field) {
  err;
  return `'${field.formControl.value}' ist keine gültige Angabe für dieses Feld.`;
}

export function autocompleteNotValidValidationMessage(err, field) {
  err;
  if (field.formControl.value == null)
  {
    return 'Wählen Sie einen Wert aus der Vorschlagsliste.';
  }
  const value = typeof field.formControl.value === 'string' ? field.formControl.value : field.formControl.value.label;
  return `${value} ist ungültig - wählen Sie einen Wert aus der Vorschlagsliste.`;
}

function instanceOfSelectFormOptions(value: any): value is SelectFormOptions {
  return !!value // truthy
  && typeof value !== 'string' // Not just string input in the autocomplete
  && typeof value !== 'number' // Not just a number
  && 'label' in value; // Has some qualifying property of Character type
}

export function autocompleteValueFromListValidator(control: FormControl, field: FormlyFieldConfig, options : any): ValidationErrors {
  field;
  options;
  let msg = 'error';
  if ( instanceOfSelectFormOptions(control.value) )
  {
    msg = null;
  }
  return (msg) ? {'autocomplete': true} : null;
}

export function germanDecimalValidatorAndConverter(control: FormControl, field: FormlyFieldConfig, options : any): ValidationErrors {
  control;
  field;
  options;
  if (!control.value)
    return null;

  const regExp : RegExp = (options.regExp) ? options.regExp : /[€. ]/gi;
  const fractionDigits : number =  (options.fractionDigits) ? (options.fractionDigits) : 2;

  let origValue = control.value as string;
  // convert/trim string for parseFloat
  let value = origValue.replace(regExp,'').replace(',','.');
  const valueFloat = parseFloat(value);
  // check if value is a number
  if (isNaN(value as any) || isNaN(valueFloat))
    return { 'pattern' : true };
  // convert value into
  value = valueFloat.toLocaleString('de-De', {minimumFractionDigits: fractionDigits, maximumFractionDigits: fractionDigits})
  if (value != origValue)
    control.setValue(value);
  return null;
}

export function regexValidator(control: FormControl, field: FormlyFieldConfig, options): ValidationErrors {
  field;
  return !control.value || options.test(control.value) ? null : { 'pattern' : true };
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

export const REGEX_mrba_currencyIgnoreCharacters : RegExp = /[€. ]/gi;
export const REGEX_mrba_taxRateIgnoreCharacters : RegExp = /[%. ]/gi;

export const REGEX_mrba_datePattern : RegExp = /^(0?[1-9]|[12][0-9]|3[01])\.(0?[1-9]|1[012])\.(19|20)[0-9]{2}$/;
export const REGEX_mrba_nonNegative : RegExp = /^-?\d{1,3}(\.\d{3})*,\d{1}$/;
export const REGEX_mrba_germanDecimalOneDecimalPlace : RegExp = /^-?\d{1,3}(\.\d{3})*,\d{1}$/;
export const REGEX_mrba_germanDecimalTwoDecimalPlace : RegExp = /^-?\d{1,3}(\.\d{3})*,\d{2}$/;
export const REGEX_mrba_companyCountryCodeIso_3611_1_Alpha_2 : RegExp = /^[A-Z]{2}$/;

// custom constraints
export const REGEX_nonNegativeInt : RegExp = /^[0-9]+$/;
export const REGEX_Int : RegExp = /^[-]?\d+$/;
export const REGEX_germanDecimalTwoDecimalPlaceNotNegative : RegExp = /^\d{1,3}(\.\d{3})*,\d{2}$/;
