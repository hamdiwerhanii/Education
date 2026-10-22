import { Component, inject, output, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Alert, EmptyState, Loading } from '../../../../../shared/components/status/status';
import { CourseSummary } from '../../../../../shared/models/course.model';
import { DurationPipe } from '../../../../../shared/pipes/duration.pipe';
import { CoursesApi } from '../../../../../shared/services/courses.api';
import { toApiError } from '../../../../../shared/utils/api-error';

const ALL_COURSES_LIMIT = 30;

@Component({
  selector: 'app-courses-table',
  imports: [RouterLink, DurationPipe, Loading, Alert, EmptyState],
  template: `
    <h2 class="card-panel__title">Courses</h2>
    @if (error()) {
      <app-alert retryLabel="Reload" (retry)="load()">{{ error() }}</app-alert>
    }
    @if (courses(); as list) {
      @if (list.length) {
        <div class="table-scroll">
          <table class="data-table">
            <thead>
              <tr>
                <th scope="col">Course</th>
                <th scope="col">Teacher</th>
                <th scope="col">Duration</th>
                <th scope="col">Students</th>
                <th scope="col"><span class="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              @for (course of list; track course.id) {
                <tr>
                  <td><a class="text-link" [routerLink]="['/courses', course.id]">{{ course.name }}</a></td>
                  <td>{{ course.teacher.firstName }} {{ course.teacher.lastName }}</td>
                  <td>{{ course.durationMinutes | duration }}</td>
                  <td>{{ course.studentCount }}</td>
                  <td class="actions">
                    <a class="action-btn action-btn--primary" [routerLink]="['/dashboard/courses', course.id, 'edit']">
                      Edit<span class="sr-only"> {{ course.name }}</span>
                    </a>
                    <button type="button" class="action-btn action-btn--danger" [disabled]="busyId() === course.id" (click)="remove(course)">
                      Delete<span class="sr-only"> {{ course.name }}</span>
                    </button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      } @else {
        <app-empty-state>No courses yet.</app-empty-state>
      }
    } @else if (!error()) {
      <app-loading label="Loading courses…" />
    }
  `,
})
export class CoursesTable {
  private readonly api = inject(CoursesApi);

  readonly changed = output<void>();

  protected readonly courses = signal<CourseSummary[] | null>(null);
  protected readonly error = signal('');
  protected readonly busyId = signal<string | null>(null);

  constructor() {
    this.load();
  }

  protected load(): void {
    this.error.set('');
    this.api.list({ limit: ALL_COURSES_LIMIT }).subscribe({
      next: ({ courses }) => this.courses.set(courses),
      error: (error) => this.error.set(toApiError(error).message),
    });
  }

  protected remove(course: CourseSummary): void {
    if (!window.confirm(`Delete "${course.name}"? Enrolments and grades will be lost.`)) return;

    this.busyId.set(course.id);
    this.api.remove(course.id).subscribe({
      next: () => {
        this.busyId.set(null);
        this.courses.update((list) => list?.filter((c) => c.id !== course.id) ?? null);
        this.changed.emit();
      },
      error: (error) => {
        this.busyId.set(null);
        this.error.set(toApiError(error).message);
      },
    });
  }
}
