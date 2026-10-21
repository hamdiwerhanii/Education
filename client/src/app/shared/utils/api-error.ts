import { HttpErrorResponse } from '@angular/common/http';
import { AbstractControl, FormGroup } from '@angular/forms';

export interface ApiError {
  status: number;
  message: string;
  details: Record<string, string[]>;
}

const NETWORK_MESSAGE = 'Could not reach the server. Check that the API is running and try again.';

export function toApiError(error: unknown): ApiError {
  if (error instanceof HttpErrorResponse) {
    if (error.status === 0) return { status: 0, message: NETWORK_MESSAGE, details: {} };
    const body = error.error?.error;
    return {
      status: error.status,
      message: body?.message ?? 'Something went wrong',
      details: body?.details ?? {},
    };
  }
  return { status: -1, message: 'Something went wrong', details: {} };
}

export function applyServerErrors(form: FormGroup, details: Record<string, string[]>): void {
  for (const [field, messages] of Object.entries(details)) {
    const control: AbstractControl | null = form.get(field);
    if (control && messages?.length) {
      control.setErrors({ ...control.errors, server: messages[0] });
      control.markAsTouched();
    }
  }
}
