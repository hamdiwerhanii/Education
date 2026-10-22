import { Component, effect, inject, input, signal, untracked } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CourseCard } from '../../../../shared/components/course-card/course-card';
import { PageBanner } from '../../../../shared/components/page-banner/page-banner';
import { Alert, EmptyState, Loading } from '../../../../shared/components/status/status';
import { CourseSummary } from '../../../../shared/models/course.model';
import { CoursesApi } from '../../../../shared/services/courses.api';
import { toApiError } from '../../../../shared/utils/api-error';

@Component({
  selector: 'app-courses-page',
  imports: [FormsModule, PageBanner, CourseCard, Loading, Alert, EmptyState],
  templateUrl: './courses-page.html',
})
export class CoursesPage {
  private readonly api = inject(CoursesApi);
  private readonly router = inject(Router);

  readonly q = input('');

  protected readonly search = signal('');
  protected readonly courses = signal<CourseSummary[]>([]);
  protected readonly total = signal(0);
  protected readonly page = signal(1);
  protected readonly totalPages = signal(1);
  protected readonly isLoading = signal(true);
  protected readonly error = signal('');

  constructor() {
    effect(() => {
      const query = this.q();
      untracked(() => {
        this.search.set(query);
        this.fetch(1, query);
      });
    });
  }

  protected submit(): void {
    this.router.navigate([], { queryParams: { q: this.search().trim() || null } });
  }

  protected clearSearch(): void {
    this.search.set('');
    this.submit();
  }

  protected loadMore(): void {
    this.fetch(this.page() + 1, this.q());
  }

  protected retry(): void {
    this.fetch(1, this.q());
  }

  private fetch(page: number, q: string): void {
    this.isLoading.set(true);
    this.error.set('');
    this.api.list({ page, q }).subscribe({
      next: (result) => {
        this.courses.update((current) => (page === 1 ? result.courses : [...current, ...result.courses]));
        this.total.set(result.total);
        this.page.set(result.page);
        this.totalPages.set(result.totalPages);
        this.isLoading.set(false);
      },
      error: (error) => {
        this.error.set(toApiError(error).message);
        this.isLoading.set(false);
      },
    });
  }
}
