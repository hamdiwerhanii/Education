import { Component, effect, inject, input, signal, untracked } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Avatar } from '../../../../shared/components/avatar/avatar';
import { CourseCard } from '../../../../shared/components/course-card/course-card';
import { PageBanner } from '../../../../shared/components/page-banner/page-banner';
import { Alert, EmptyState, Loading } from '../../../../shared/components/status/status';
import { pageTitle } from '../../../../shared/constants/site';
import { CourseSummary } from '../../../../shared/models/course.model';
import { Teacher } from '../../../../shared/models/user.model';
import { TeachersApi } from '../../../../shared/services/teachers.api';
import { toApiError } from '../../../../shared/utils/api-error';
import { NotFoundPage } from '../../../not-found/components/not-found-page/not-found-page';

@Component({
  selector: 'app-teacher-profile-page',
  imports: [PageBanner, Avatar, CourseCard, Loading, Alert, EmptyState, NotFoundPage],
  template: `
    @if (notFound()) {
      <app-not-found-page />
    } @else {
      <app-page-banner title="Teacher" />
      <section class="courses-area section-padding40">
        <div class="container">
          @if (error()) {
            <app-alert retryLabel="Try again" (retry)="load()">{{ error() }}</app-alert>
          } @else if (teacher(); as t) {
            <div class="single-cat text-center mb-55">
              <app-avatar [person]="t" [size]="240" />
              <div class="cat-cap">
                <h2 class="profile-name">{{ t.firstName }} {{ t.lastName }}</h2>
                <p class="profile-speciality">{{ t.speciality }}</p>
              </div>
            </div>
            <div class="section-tittle text-center mb-40">
              <h2>Courses by {{ t.firstName }}</h2>
            </div>
            @if (courses().length) {
              <ul class="row list-unstyled">
                @for (course of courses(); track course.id; let i = $index) {
                  <li class="col-lg-4 col-md-6"><app-course-card [course]="course" [index]="i" /></li>
                }
              </ul>
            } @else {
              <app-empty-state>{{ t.firstName }} has not published a course yet.</app-empty-state>
            }
          } @else {
            <app-loading label="Loading teacher…" />
          }
        </div>
      </section>
    }
  `,
  styles: `
    .profile-name {
      margin-top: 24px;
      font-size: 34px;
    }
    .profile-speciality {
      font-size: 20px;
      font-weight: 700;
      color: #7364ff;
    }
  `,
})
export class TeacherProfilePage {
  private readonly api = inject(TeachersApi);
  private readonly title = inject(Title);

  readonly id = input.required<string>();

  protected readonly teacher = signal<Teacher | null>(null);
  protected readonly courses = signal<CourseSummary[]>([]);
  protected readonly notFound = signal(false);
  protected readonly error = signal('');

  constructor() {
    effect(() => {
      const id = this.id();
      untracked(() => this.load(id));
    });
  }

  protected load(id = this.id()): void {
    this.error.set('');
    this.api.get(id).subscribe({
      next: ({ teacher, courses }) => {
        this.teacher.set(teacher);
        this.courses.set(courses);
        this.title.setTitle(pageTitle(`${teacher.firstName} ${teacher.lastName}`));
      },
      error: (error) => {
        const apiError = toApiError(error);
        if (apiError.status === 404) this.notFound.set(true);
        else this.error.set(apiError.message);
      },
    });
  }
}
