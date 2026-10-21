import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

const PASSWORD_RULES: { key: string; test: RegExp; message: string }[] = [
  { key: 'uppercase', test: /[A-Z]/, message: 'an uppercase letter' },
  { key: 'lowercase', test: /[a-z]/, message: 'a lowercase letter' },
  { key: 'number', test: /\d/, message: 'a number' },
  { key: 'special', test: /[^A-Za-z0-9]/, message: 'a special character' },
];

export const strongPassword: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const value = String(control.value ?? '');
  if (!value) return null;
  const missing = PASSWORD_RULES.filter((rule) => !rule.test.test(value)).map((rule) => rule.message);
  return missing.length ? { strongPassword: missing } : null;
};

export const strongPasswordMessage = (missing: unknown) => `Include ${(missing as string[]).join(', ')}`;

export const matchesField =
  (field: string): ValidatorFn =>
  (control: AbstractControl): ValidationErrors | null => {
    const other = control.parent?.get(field)?.value;
    return control.value && control.value !== other ? { mismatch: true } : null;
  };

export const PHONE_PATTERN = /^\d{8}$/;
