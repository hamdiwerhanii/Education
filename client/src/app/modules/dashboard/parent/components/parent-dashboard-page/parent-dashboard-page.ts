import { Component, inject, signal } from '@angular/core';
import { Avatar } from '../../../../../shared/components/avatar/avatar';
import { DashboardShell } from '../../../../../shared/components/dashboard-shell/dashboard-shell';
import { Alert, EmptyState, Loading } from '../../../../../shared/components/status/status';
import { Child } from '../../../../../shared/models/course.model';
import { MeApi } from '../../../../../shared/services/me.api';
import { toApiError } from '../../../../../shared/utils/api-error';
import { PARENT_NAV } from '../../../dashboard.nav';
import { StudentResults } from '../../../shared/components/student-results/student-results';

@Component({
  selector: 'app-parent-dashboard-page',
  imports: [DashboardShell, Avatar, StudentResults, Loading, Alert, EmptyState],
  template: `
    <app-dashboard-shell title="My children's results" subtitle="Courses, marks and teacher feedback" [nav]="nav">
      @if (error()) {
        <app-alert retryLabel="Try again" (retry)="load()">{{ error() }}</app-alert>
      } @else if (children(); as list) {
        @for (child of list; track child.id) {
          <section class="card-panel" [attr.aria-labelledby]="'child-' + child.id">
            <h2 class="card-panel__title child-title" [id]="'child-' + child.id">
              <app-avatar [person]="child" [size]="48" [decorative]="true" />
              {{ child.firstName }} {{ child.lastName }}
            </h2>
            <app-student-results [courses]="child.courses" [pending]="child.pending" [caption]="child.firstName + ' courses and grades'" [emptyMessage]="child.firstName + ' is not enrolled in any course yet.'" />
          </section>
        } @empty {
          <div class="card-panel">
            <app-empty-state>No children are linked to your account.</app-empty-state>
          </div>
        }
      } @else {
        <app-loading label="Loading results…" />
      }
    </app-dashboard-shell>
  `,
  styles: `
    .child-title {
      display: flex;
      align-items: center;
      gap: 14px;
    }
  `,
})
export class ParentDashboardPage {
  private readonly api = inject(MeApi);

  protected readonly nav = PARENT_NAV;
  protected readonly children = signal<Child[] | null>(null);
  protected readonly error = signal('');

  constructor() {
    this.load();
  }

  protected load(): void {
    this.error.set('');
    this.api.children().subscribe({
      next: ({ children }) => this.children.set(children),
      error: (error) => this.error.set(toApiError(error).message),
    });
  }
}
