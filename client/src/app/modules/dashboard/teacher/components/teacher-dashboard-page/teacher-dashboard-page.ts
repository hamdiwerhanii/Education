import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DashboardShell } from '../../../../../shared/components/dashboard-shell/dashboard-shell';
import { Alert, EmptyState, Loading } from '../../../../../shared/components/status/status';
import { ManagedCourse } from '../../../../../shared/models/course.model';
import { CoursesApi } from '../../../../../shared/services/courses.api';
import { MeApi } from '../../../../../shared/services/me.api';
import { toApiError } from '../../../../../shared/utils/api-error';
import { TEACHER_NAV } from '../../../dashboard.nav';
import { ManagedCourseCard } from '../managed-course-card/managed-course-card';

@Component({
  selector: 'app-teacher-dashboard-page',
  imports: [RouterLink, DashboardShell, ManagedCourseCard, Loading, Alert, EmptyState],
  template: `
    <app-dashboard-shell title="Teacher dashboard" subtitle="Manage your courses, students and grades" [nav]="nav">
      @if (error()) {
        <app-alert retryLabel="Try again" (retry)="load()">{{ error() }}</app-alert>
      }
      @if (courses(); as list) {
        @if (list.length) {
          @for (course of list; track course.id) {
            <app-managed-course-card [course]="course" (changed)="load()" (deleted)="remove(course)" />
          }
        } @else {
          <div class="card-panel text-center">
            <app-empty-state>You have not created a course yet.</app-empty-state>
            <a class="btn" routerLink="/dashboard/teacher/courses/new">Create your first course</a>
          </div>
        }
      } @else if (!error()) {
        <app-loading label="Loading your courses…" />
      }
    </app-dashboard-shell>
  `,
})
export class TeacherDashboardPage {
  private readonly meApi = inject(MeApi);
  private readonly coursesApi = inject(CoursesApi);

  protected readonly nav = TEACHER_NAV;
  protected readonly courses = signal<ManagedCourse[] | null>(null);
  protected readonly error = signal('');

  constructor() {
    this.load();
  }

  protected load(): void {
    this.error.set('');
    this.meApi.teacherCourses().subscribe({
      next: ({ courses }) => this.courses.set(courses),
      error: (error) => this.error.set(toApiError(error).message),
    });
  }

  protected remove(course: ManagedCourse): void {
    if (!window.confirm(`Delete "${course.name}"? Enrolments and grades will be lost.`)) return;
    this.coursesApi.remove(course.id).subscribe({
      next: () => this.courses.update((list) => list?.filter((c) => c.id !== course.id) ?? null),
      error: (error) => this.error.set(toApiError(error).message),
    });
  }
}
