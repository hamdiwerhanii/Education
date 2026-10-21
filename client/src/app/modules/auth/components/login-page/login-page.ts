import { Component, inject, input, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { FieldError } from '../../../../shared/components/field-error/field-error';
import { PageBanner } from '../../../../shared/components/page-banner/page-banner';
import { Alert } from '../../../../shared/components/status/status';
import { ROLE_HOME } from '../../../../shared/constants/roles';
import { AuthStore } from '../../../../shared/services/auth.store';
import { applyServerErrors, toApiError } from '../../../../shared/utils/api-error';
import { PHONE_PATTERN } from '../../validators/password.validators';

const isSafeReturnUrl = (url: string) => url.startsWith('/') && !url.startsWith('//');

@Component({
  selector: 'app-login-page',
  imports: [ReactiveFormsModule, RouterLink, PageBanner, FieldError, Alert],
  templateUrl: './login-page.html',
})
export class LoginPage {
  private readonly auth = inject(AuthStore);
  private readonly router = inject(Router);

  readonly returnUrl = input('');

  protected readonly form = inject(FormBuilder).nonNullable.group({
    telephone: ['', [Validators.required, Validators.pattern(PHONE_PATTERN)]],
    password: ['', Validators.required],
  });
  protected readonly phoneMessages = { pattern: 'Use exactly 8 digits' };
  protected readonly submitted = signal(false);
  protected readonly isSubmitting = signal(false);
  protected readonly formError = signal('');

  protected async submit(): Promise<void> {
    this.submitted.set(true);
    this.formError.set('');
    if (this.form.invalid) return;

    this.isSubmitting.set(true);
    try {
      const { telephone, password } = this.form.getRawValue();
      const user = await this.auth.login(telephone, password);
      const target = isSafeReturnUrl(this.returnUrl()) ? this.returnUrl() : ROLE_HOME[user.role];
      await this.router.navigateByUrl(target);
    } catch (error) {
      const apiError = toApiError(error);
      applyServerErrors(this.form, apiError.details);
      this.formError.set(apiError.message);
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
