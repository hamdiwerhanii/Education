import { HttpErrorResponse } from '@angular/common/http';
import { FormControl, FormGroup } from '@angular/forms';
import { matchesField, strongPassword, strongPasswordMessage } from '../app/modules/auth/validators/password.validators';
import { DurationPipe } from '../app/shared/pipes/duration.pipe';
import { applyServerErrors, toApiError } from '../app/shared/utils/api-error';

describe('strongPassword', () => {
  it('accepts a password with every character type', () => {
    expect(strongPassword(new FormControl('Str0ng@Pass'))).toBeNull();
  });

  it('lists exactly what is missing', () => {
    const errors = strongPassword(new FormControl('password'));
    expect(strongPasswordMessage(errors?.['strongPassword'])).toBe('Include an uppercase letter, a number, a special character');
  });

  it('flags a confirmation that does not match', () => {
    const form = new FormGroup({ password: new FormControl('a'), confirm: new FormControl('b', matchesField('password')) });
    form.controls.confirm.updateValueAndValidity();
    expect(form.controls.confirm.errors).toEqual({ mismatch: true });
  });
});

describe('DurationPipe', () => {
  const pipe = new DurationPipe();

  it('formats minutes as hours and minutes', () => {
    expect(pipe.transform(45)).toBe('45 min');
    expect(pipe.transform(120)).toBe('2 h');
    expect(pipe.transform(135)).toBe('2 h 15 min');
  });
});

describe('api errors', () => {
  it('reads the message and field details sent by the API', () => {
    const error = new HttpErrorResponse({
      status: 409,
      error: { error: { message: 'Some details are already in use', details: { email: ['Taken'] } } },
    });
    expect(toApiError(error)).toEqual({ status: 409, message: 'Some details are already in use', details: { email: ['Taken'] } });
  });

  it('explains network failures', () => {
    expect(toApiError(new HttpErrorResponse({ status: 0 })).message).toContain('Could not reach the server');
  });

  it('puts server messages on the matching form fields', () => {
    const form = new FormGroup({ email: new FormControl('a@b.c') });
    applyServerErrors(form, { email: ['This email is already in use'] });
    expect(form.controls.email.errors).toEqual({ server: 'This email is already in use' });
    expect(form.controls.email.touched).toBe(true);
  });
});
