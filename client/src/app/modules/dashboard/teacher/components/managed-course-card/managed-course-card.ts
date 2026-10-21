import { Component, inject, input, output, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { Avatar } from '../../../../../shared/components/avatar/avatar';
import { Alert } from '../../../../../shared/components/status/status';
import { EnrolledStudent, ManagedCourse } from '../../../../../shared/models/course.model';
import { Person } from '../../../../../shared/models/user.model';
import { DurationPipe } from '../../../../../shared/pipes/duration.pipe';
import { CoursesApi } from '../../../../../shared/services/courses.api';
import { toApiError } from '../../../../../shared/utils/api-error';
import { GradeForm } from '../grade-form/grade-form';

@Component({
  selector: 'app-managed-course-card',
  imports: [RouterLink, Avatar, Alert, DurationPipe, GradeForm],
  templateUrl: './managed-course-card.html',
  styleUrl: './managed-course-card.css',
})
export class ManagedCourseCard {
  private readonly api = inject(CoursesApi);

  readonly course = input.required<ManagedCourse>();
  readonly changed = output<void>();
  readonly deleted = output<void>();

  protected readonly gradingId = signal<string | null>(null);
  protected readonly busyId = signal<string | null>(null);
  protected readonly error = signal('');

  protected toggleGrading(student: EnrolledStudent): void {
    this.gradingId.update((current) => (current === student.id ? null : student.id));
  }

  protected decide(student: Person, accept: boolean): void {
    const id = this.course().id;
    const request: Observable<void> = accept ? this.api.acceptRequest(id, student.id) : this.api.rejectRequest(id, student.id);
    this.busyId.set(student.id);
    this.error.set('');
    request.subscribe({
      next: () => {
        this.busyId.set(null);
        this.changed.emit();
      },
      error: (error) => {
        this.busyId.set(null);
        this.error.set(toApiError(error).message);
      },
    });
  }

  protected graded(): void {
    this.gradingId.set(null);
    this.changed.emit();
  }
}
