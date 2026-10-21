import { Component, effect, inject, input, output, signal, untracked } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FieldError } from '../../../../../shared/components/field-error/field-error';
import { Alert } from '../../../../../shared/components/status/status';
import { EnrolledStudent } from '../../../../../shared/models/course.model';
import { CoursesApi } from '../../../../../shared/services/courses.api';
import { applyServerErrors, toApiError } from '../../../../../shared/utils/api-error';

@Component({
  selector: 'app-grade-form',
  imports: [ReactiveFormsModule, FieldError, Alert],
  template: `
    <form class="grade-form form-contact" [formGroup]="form" (ngSubmit)="submit()" novalidate>
      @if (error()) {
        <app-alert>{{ error() }}</app-alert>
      }
      <div class="grade-form__fields">
        <div class="form-group grade-form__mark">
          <label class="form-label" [for]="'mark-' + student().id">Mark (0–20)</label>
          <input [id]="'mark-' + student().id" class="form-control" type="number" min="0" max="20" step="0.25" formControlName="mark" [attr.aria-describedby]="'mark-error-' + student().id" />
          <app-field-error [control]="form.controls.mark" [id]="'mark-error-' + student().id" [show]="submitted()" />
        </div>
        <div class="form-group grade-form__evaluation">
          <label class="form-label" [for]="'evaluation-' + student().id">Feedback</label>
          <input [id]="'evaluation-' + student().id" class="form-control" maxlength="500" formControlName="evaluation" placeholder="What went well, what to improve" />
        </div>
      </div>
      <div class="actions">
        <button type="submit" class="action-btn action-btn--success" [disabled]="isSaving()">{{ isSaving() ? 'Saving…' : 'Save grade' }}</button>
        <button type="button" class="action-btn action-btn--neutral" (click)="cancelled.emit()">Cancel</button>
      </div>
    </form>
  `,
  styles: `
    .grade-form {
      margin-top: 12px;
      padding: 16px;
      border-radius: 8px;
      background: #f7f6ff;
    }
    .grade-form__fields {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
    }
    .grade-form__mark {
      flex: 0 1 140px;
    }
    .grade-form__evaluation {
      flex: 1 1 260px;
    }
  `,
})
export class GradeForm {
  private readonly api = inject(CoursesApi);

  readonly courseId = input.required<string>();
  readonly student = input.required<EnrolledStudent>();
  readonly saved = output<void>();
  readonly cancelled = output<void>();

  protected readonly form = inject(FormBuilder).nonNullable.group({
    mark: [0, [Validators.required, Validators.min(0), Validators.max(20)]],
    evaluation: ['', Validators.maxLength(500)],
  });
  protected readonly submitted = signal(false);
  protected readonly isSaving = signal(false);
  protected readonly error = signal('');

  constructor() {
    effect(() => {
      const grade = this.student().grade;
      untracked(() => this.form.reset({ mark: grade?.mark ?? 0, evaluation: grade?.evaluation ?? '' }));
    });
  }

  protected submit(): void {
    this.submitted.set(true);
    if (this.form.invalid) return;

    this.isSaving.set(true);
    this.error.set('');
    this.api.grade(this.courseId(), this.student().id, this.form.getRawValue()).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.saved.emit();
      },
      error: (error) => {
        const apiError = toApiError(error);
        applyServerErrors(this.form, apiError.details);
        this.error.set(apiError.message);
        this.isSaving.set(false);
      },
    });
  }
}
