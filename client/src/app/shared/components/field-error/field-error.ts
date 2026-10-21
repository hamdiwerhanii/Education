import { Component, input } from '@angular/core';
import { AbstractControl } from '@angular/forms';

type Messages = Record<string, string | ((value: unknown) => string)>;

const DEFAULT_MESSAGES: Messages = {
  required: 'This field is required',
  email: 'Enter a valid email address',
  minlength: (e) => `Use at least ${(e as { requiredLength: number }).requiredLength} characters`,
  maxlength: (e) => `Use at most ${(e as { requiredLength: number }).requiredLength} characters`,
  min: (e) => `Must be at least ${(e as { min: number }).min}`,
  max: (e) => `Must be at most ${(e as { max: number }).max}`,
  pattern: 'Invalid format',
  server: (e) => String(e),
};

@Component({
  selector: 'app-field-error',
  template: `
    @if (message(); as text) {
      <p class="field-error" [id]="id()">{{ text }}</p>
    }
  `,
})
export class FieldError {
  readonly control = input.required<AbstractControl | null>();
  readonly id = input.required<string>();
  readonly messages = input<Messages>({});
  readonly show = input(false);

  protected message(): string {
    const control = this.control();
    if (!control?.errors || !(this.show() || control.touched)) return '';

    const all = { ...DEFAULT_MESSAGES, ...this.messages() };
    const [key, value] = Object.entries(control.errors)[0];
    const message = all[key];
    if (!message) return 'Invalid value';
    return typeof message === 'function' ? message(value) : message;
  }
}
