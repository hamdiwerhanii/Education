import { Component, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormArray, FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { FieldError } from '../../../../shared/components/field-error/field-error';
import { PageBanner } from '../../../../shared/components/page-banner/page-banner';
import { Alert } from '../../../../shared/components/status/status';
import { ROLE_HOME, SIGN_UP_ROLES } from '../../../../shared/constants/roles';
import { SignUpRole } from '../../../../shared/models/user.model';
import { AuthStore } from '../../../../shared/services/auth.store';
import { applyServerErrors, toApiError } from '../../../../shared/utils/api-error';
import { matchesField, PHONE_PATTERN, strongPassword, strongPasswordMessage } from '../../validators/password.validators';

const ROLE_IDS = SIGN_UP_ROLES.map((r) => r.role);
const MAX_CHILDREN = 10;

@Component({
  selector: 'app-sign-up-page',
  imports: [ReactiveFormsModule, RouterLink, PageBanner, FieldError, Alert],
  templateUrl: './sign-up-page.html',
  styleUrl: './sign-up-page.css',
})
export class SignUpPage {
  private readonly auth = inject(AuthStore);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder).nonNullable;

  readonly role = input('student');

  protected readonly roles = SIGN_UP_ROLES;
  protected readonly activeRole = computed<SignUpRole>(() =>
    ROLE_IDS.includes(this.role() as SignUpRole) ? (this.role() as SignUpRole) : 'student',
  );
  protected readonly maxChildren = MAX_CHILDREN;

  protected readonly form = this.fb.group({
    firstName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
    lastName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
    email: ['', [Validators.required, Validators.email]],
    telephone: ['', [Validators.required, Validators.pattern(PHONE_PATTERN)]],
    password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(72), strongPassword]],
    confirmPassword: ['', [Validators.required, matchesField('password')]],
    address: ['', [Validators.maxLength(200)]],
    speciality: [''],
    childTelephones: this.fb.array<FormControl<string>>([]),
  });

  protected readonly messages = {
    phone: { pattern: 'Use exactly 8 digits' },
    password: { strongPassword: strongPasswordMessage },
    confirm: { mismatch: 'Passwords must match' },
  };

  protected readonly photo = signal<File | null>(null);
  protected readonly cv = signal<File | null>(null);
  protected readonly submitted = signal(false);
  protected readonly isSubmitting = signal(false);
  protected readonly formError = signal('');
  protected readonly pendingMessage = signal('');

  constructor() {
    this.form.controls.password.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.form.controls.confirmPassword.updateValueAndValidity());

    effect(() => {
      const role = this.activeRole();
      untracked(() => this.configureFor(role));
    });
  }

  protected get childTelephones(): FormArray<FormControl<string>> {
    return this.form.controls.childTelephones;
  }

  protected addChild(): void {
    if (this.childTelephones.length < MAX_CHILDREN) {
      this.childTelephones.push(this.fb.control('', [Validators.required, Validators.pattern(PHONE_PATTERN)]));
    }
  }

  protected removeChild(index: number): void {
    this.childTelephones.removeAt(index);
  }

  protected onFile(event: Event, kind: 'photo' | 'cv'): void {
    const file = (event.target as HTMLInputElement).files?.[0] ?? null;
    (kind === 'photo' ? this.photo : this.cv).set(file);
  }

  protected invalid(name: string): boolean {
    const control = this.form.get(name);
    return Boolean(control?.invalid && (control.touched || this.submitted()));
  }

  protected async submit(): Promise<void> {
    this.submitted.set(true);
    this.formError.set('');
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    this.isSubmitting.set(true);
    try {
      const response = await this.auth.signUp(this.toFormData());
      if (response.pendingApproval) {
        this.pendingMessage.set('Your teacher account was created. An admin will review it before you can log in.');
        this.form.reset();
        this.submitted.set(false);
      } else {
        await this.router.navigateByUrl(ROLE_HOME[response.user.role]);
      }
    } catch (error) {
      const apiError = toApiError(error);
      applyServerErrors(this.form, apiError.details);
      this.formError.set(apiError.message);
    } finally {
      this.isSubmitting.set(false);
    }
  }

  private configureFor(role: SignUpRole): void {
    const speciality = this.form.controls.speciality;
    speciality.setValidators(role === 'teacher' ? [Validators.required, Validators.minLength(2), Validators.maxLength(100)] : []);
    speciality.updateValueAndValidity();

    this.childTelephones.clear();
    if (role === 'parent') this.addChild();
    if (role !== 'teacher') this.cv.set(null);

    this.pendingMessage.set('');
    this.formError.set('');
  }

  private toFormData(): FormData {
    const value = this.form.getRawValue();
    const role = this.activeRole();
    const data = new FormData();

    data.set('role', role);
    for (const key of ['firstName', 'lastName', 'email', 'telephone', 'password', 'address'] as const) {
      data.set(key, value[key]);
    }
    if (role === 'teacher') data.set('speciality', value.speciality);
    if (role === 'parent') value.childTelephones.forEach((phone) => data.append('childTelephones', phone));

    const photo = this.photo();
    const cv = this.cv();
    if (photo) data.set('photo', photo);
    if (cv && role === 'teacher') data.set('cv', cv);
    return data;
  }
}
