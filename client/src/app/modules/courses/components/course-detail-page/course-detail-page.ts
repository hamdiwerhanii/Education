import { Component, effect, inject, input, signal, untracked } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { Avatar } from '../../../../shared/components/avatar/avatar';
import { PageBanner } from '../../../../shared/components/page-banner/page-banner';
import { Alert, Loading } from '../../../../shared/components/status/status';
import { pageTitle } from '../../../../shared/constants/site';
import { DurationPipe } from '../../../../shared/pipes/duration.pipe';
import { AuthStore } from '../../../../shared/services/auth.store';
import { CourseDetail, CoursesApi } from '../../../../shared/services/courses.api';
import { toApiError } from '../../../../shared/utils/api-error';
import { NotFoundPage } from '../../../not-found/components/not-found-page/not-found-page';

@Component({
  selector: 'app-course-detail-page',
  imports: [RouterLink, PageBanner, Avatar, Loading, Alert, DurationPipe, NotFoundPage],
  templateUrl: './course-detail-page.html',
  styleUrl: './course-detail-page.css',
})
export class CourseDetailPage {
  private readonly api = inject(CoursesApi);
  private readonly title = inject(Title);
  protected readonly auth = inject(AuthStore);

  readonly id = input.required<string>();

  protected readonly detail = signal<CourseDetail | null>(null);
  protected readonly notFound = signal(false);
  protected readonly error = signal('');
  protected readonly actionError = signal('');
  protected readonly isWorking = signal(false);

  constructor() {
    effect(() => {
      const id = this.id();
      untracked(() => this.load(id));
    });
  }

  protected load(id = this.id()): void {
    this.error.set('');
    this.api.get(id).subscribe({
      next: (detail) => {
        this.detail.set(detail);
        this.title.setTitle(pageTitle(detail.course.name));
      },
      error: (error) => {
        const apiError = toApiError(error);
        if (apiError.status === 404) this.notFound.set(true);
        else this.error.set(apiError.message);
      },
    });
  }

  protected join(): void {
    this.runAction(this.api.join(this.id()));
  }

  protected cancel(): void {
    this.runAction(this.api.cancelJoin(this.id()));
  }

  private runAction(request: ReturnType<CoursesApi['join']>): void {
    this.isWorking.set(true);
    this.actionError.set('');
    request.subscribe({
      next: () => {
        this.isWorking.set(false);
        this.load();
      },
      error: (error) => {
        this.isWorking.set(false);
        this.actionError.set(toApiError(error).message);
      },
    });
  }
}
