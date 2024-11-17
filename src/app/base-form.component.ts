import { Component } from '@angular/core';
import { FormGroup, AbstractControl } from '@angular/forms';
@Component({
  template: ''
})
export abstract class BaseFormComponent {
  // the form model
  form!: FormGroup;
  getErrors(
    control: AbstractControl,
    displayName: string,
  ): string[] {
    var errors: string[] = [];
    Object.keys(control.errors || {}).forEach((key) => {
      switch (key) {
        case 'required':
          errors.push(`${displayName} is required.`);
          break;
        case 'pattern':
          errors.push(`${displayName} contains invalid characters.`);
          break;
        case 'isDupeField':
          errors.push(`${displayName} already exists: please choose another.`);
          break;
        default:
          errors.push(`${displayName} is invalid.`);
          break;
      }
    });
    return errors;
  }
  constructor() { }
}