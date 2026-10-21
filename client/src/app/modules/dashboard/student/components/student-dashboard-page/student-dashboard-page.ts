import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DashboardShell } from '../../../../../shared/components/dashboard-shell/dashboard-shell';
import { Alert, Loading } from '../../../../../shared/components/status/status';
import { CourseSummary, StudentCourse } from '../../../../../shared/models/course.model';
import { MeApi } from '../../../../../shared/services/me.api';
import { toApiError } from '../../../../../shared/utils/api-error';
import { STUDENT_NAV } from '../../../dashboard.nav';
import { StudentResults } from '../../../shared/components/student-results/student-results';

@Component({
  selector: 'app-student-dashboard-page',
  imports: [RouterLink, DashboardShell, StudentResults, Loading, Alert],
  template: `
    <app-dashboard-shell title="My courses" subtitle="Your enrolments, marks and teacher feedback" [nav]="nav">
      <div class="card-panel">
        <h2 class="card-panel__title">Courses and grades</h2>
        @if (error()) {
          <app-alert retryLabel="Try again" (retry)="load()">{{ error() }}</app-alert>
        } @else if (courses(); as list) {
          <app-student-results [courses]="list" [pending]="pending()" emptyMessage="You are not enrolled in any course yet." />
          <a class="btn mt-20" routerLink="/courses">Browse courses</a>
        } @else {
          <app-loading label="Loading your courses…" />
        }
      </div>
    </app-dashboard-shell>
  `,
})
export class StudentDashboardPage {
  private readonly api = inject(MeApi);

  protected readonly nav = STUDENT_NAV;
  protected readonly courses = signal<StudentCourse[] | null>(null);
  protected readonly pending = signal<CourseSummary[]>([]);
  protected readonly error = signal('');

  constructor() {
    this.load();
  }

  protected load(): void {
    this.error.set('');
    this.api.studentCourses().subscribe({
      next: ({ courses, pending }) => {
        this.courses.set(courses);
        this.pending.set(pending);
      },
      error: (error) => this.error.set(toApiError(error).message),
    });
  }
}
