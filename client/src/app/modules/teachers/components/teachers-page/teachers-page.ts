import { Component, effect, inject, input, signal, untracked } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PageBanner } from '../../../../shared/components/page-banner/page-banner';
import { Alert, EmptyState, Loading } from '../../../../shared/components/status/status';
import { TeacherCard } from '../../../../shared/components/teacher-card/teacher-card';
import { Teacher } from '../../../../shared/models/user.model';
import { TeachersApi } from '../../../../shared/services/teachers.api';
import { toApiError } from '../../../../shared/utils/api-error';

@Component({
  selector: 'app-teachers-page',
  imports: [FormsModule, PageBanner, TeacherCard, Loading, Alert, EmptyState],
  template: `
    <app-page-banner title="Teachers" />
    <section class="team-area section-padding40 fix" aria-labelledby="experts-title">
      <div class="container">
        <div class="row justify-content-center">
          <div class="col-xl-7 col-lg-8">
            <div class="section-tittle text-center mb-40">
              <h2 id="experts-title">Community experts</h2>
            </div>
          </div>
        </div>

        <form class="form-contact search-form mb-40" role="search" (ngSubmit)="submit()">
          <label for="teacher-search" class="sr-only">Search teachers by name or speciality</label>
          <input id="teacher-search" class="form-control" type="search" name="q" maxlength="100" placeholder="Search by name or speciality" [ngModel]="search()" (ngModelChange)="search.set($event)" />
          <button type="submit" class="btn">Search</button>
        </form>

        @if (error()) {
          <app-alert retryLabel="Try again" (retry)="fetch(q())">{{ error() }}</app-alert>
        } @else if (teachers(); as list) {
          @if (list.length) {
            <ul class="row list-unstyled justify-content-center">
              @for (teacher of list; track teacher.id) {
                <li class="col-lg-3 col-md-4 col-sm-6">
                  <app-teacher-card [teacher]="teacher" />
                </li>
              }
            </ul>
          } @else {
            <app-empty-state>No teachers match your search.</app-empty-state>
          }
        } @else {
          <app-loading label="Loading teachers…" />
        }
      </div>
    </section>
  `,
})
export class TeachersPage {
  private readonly api = inject(TeachersApi);
  private readonly router = inject(Router);

  readonly q = input('');

  protected readonly search = signal('');
  protected readonly teachers = signal<Teacher[] | null>(null);
  protected readonly error = signal('');

  constructor() {
    effect(() => {
      const query = this.q();
      untracked(() => {
        this.search.set(query);
        this.fetch(query);
      });
    });
  }

  protected submit(): void {
    this.router.navigate([], { queryParams: { q: this.search().trim() || null } });
  }

  protected fetch(q: string): void {
    this.teachers.set(null);
    this.error.set('');
    this.api.list(q).subscribe({
      next: ({ teachers }) => this.teachers.set(teachers),
      error: (error) => this.error.set(toApiError(error).message),
    });
  }
}
