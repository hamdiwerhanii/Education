import { Component, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DashboardShell } from '../../../../../shared/components/dashboard-shell/dashboard-shell';
import { FieldError } from '../../../../../shared/components/field-error/field-error';
import { Alert, Loading } from '../../../../../shared/components/status/status';
import { AuthStore } from '../../../../../shared/services/auth.store';
import { CoursesApi } from '../../../../../shared/services/courses.api';
import { applyServerErrors, toApiError } from '../../../../../shared/utils/api-error';
import { ADMIN_NAV, TEACHER_NAV } from '../../../dashboard.nav';

@Component({
  selector: 'app-course-form-page',
  imports: [ReactiveFormsModule, DashboardShell, FieldError, Alert, Loading],
  templateUrl: './course-form-page.html',
})
export class CourseFormPage {
  private readonly api = inject(CoursesApi);
  private readonly router = inject(Router);
  private readonly auth = inject(AuthStore);

  readonly id = input<string>();

  protected readonly isEdit = computed(() => Boolean(this.id()));
  protected readonly nav = computed(() => (this.auth.role() === 'admin' ? ADMIN_NAV : TEACHER_NAV));
  protected readonly form = inject(FormBuilder).nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
    description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(2000)]],
    durationMinutes: [60, [Validators.required, Validators.min(1), Validators.max(10000)]],
  });
  protected readonly isLoading = signal(false);
  protected readonly submitted = signal(false);
  protected readonly isSaving = signal(false);
  protected readonly formError = signal('');

  constructor() {
    effect(() => {
      const id = this.id();
      if (id) untracked(() => this.load(id));
    });
  }

  protected invalid(name: 'name' | 'description' | 'durationMinutes'): boolean {
    const control = this.form.controls[name];
    return control.invalid && (control.touched || this.submitted());
  }

  protected submit(): void {
    this.submitted.set(true);
    this.formError.set('');
    if (this.form.invalid) return;

    const id = this.id();
    const request = id ? this.api.update(id, this.form.getRawValue()) : this.api.create(this.form.getRawValue());
    this.isSaving.set(true);
    request.subscribe({
      next: () => this.router.navigateByUrl(this.auth.homePath()),
      error: (error) => {
        const apiError = toApiError(error);
        applyServerErrors(this.form, apiError.details);
        this.formError.set(apiError.message);
        this.isSaving.set(false);
      },
    });
  }

  protected cancel(): void {
    this.router.navigateByUrl(this.auth.homePath());
  }

  private load(id: string): void {
    this.isLoading.set(true);
    this.api.get(id).subscribe({
      next: ({ course, viewer }) => {
        this.isLoading.set(false);
        if (!viewer.canManage) {
          this.formError.set('You can only edit your own courses.');
          this.form.disable();
          return;
        }
        this.form.reset({ name: course.name, description: course.description, durationMinutes: course.durationMinutes });
      },
      error: (error) => {
        this.isLoading.set(false);
        this.formError.set(toApiError(error).message);
      },
    });
  }
}
