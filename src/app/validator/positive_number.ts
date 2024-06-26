import { AbstractControl, ValidatorFn } from '@angular/forms';

export function positiveNumberValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const value = control.value;
    if (value === null || value === undefined || value === '') {
      return null; // Allow empty value
    }
    const isPositive = /^\d*\.?\d+$/.test(value); // Allow positive decimal numbers
    return isPositive ? null : { 'positiveNumber': true };
  };
}
