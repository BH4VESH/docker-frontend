import { AbstractControl, ValidatorFn } from '@angular/forms';

export function   firstCharIsLetter(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      if (control.value && control.value.length > 0 && !/^[a-zA-Z]/.test(control.value[0])) {
        return { 'firstCharIsNotLetter': true };
      }
      return null;
    };
  }