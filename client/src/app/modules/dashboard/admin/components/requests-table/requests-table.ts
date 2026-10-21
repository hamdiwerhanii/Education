import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { Avatar } from '../../../../../shared/components/avatar/avatar';
import { Alert, EmptyState, Loading } from '../../../../../shared/components/status/status';
import { EnrolmentRequest } from '../../../../../shared/models/course.model';
import { AdminApi } from '../../../../../shared/services/admin.api';
import { CoursesApi } from '../../../../../shared/services/courses.api';
import { toApiError } from '../../../../../shared/utils/api-error';

const requestKey = (r: EnrolmentRequest) => `${r.course.id}:${r.student.id}`;

@Component({
  selector: 'app-requests-table',
  imports: [RouterLink, Avatar, Loading, Alert, EmptyState],
  template: `
    <h2 class="card-panel__title">Enrolment requests</h2>
    @if (error()) {
      <app-alert retryLabel="Reload" (retry)="load()">{{ error() }}</app-alert>
    }
    @if (requests(); as list) {
      @if (list.length) {
        <div class="table-scroll">
          <table class="data-table">
            <thead>
              <tr>
                <th scope="col">Student</th>
                <th scope="col">Course</th>
                <th scope="col"><span class="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              @for (request of list; track key(request)) {
                <tr>
                  <td>
                    <span class="user-cell">
                      <app-avatar [person]="request.student" [size]="36" [decorative]="true" />
                      {{ request.student.firstName }} {{ request.student.lastName }}
                    </span>
                  </td>
                  <td><a [routerLink]="['/courses', request.course.id]">{{ request.course.name }}</a></td>
                  <td class="actions">
                    <button type="button" class="action-btn action-btn--success" [disabled]="busyKey() === key(request)" (click)="decide(request, true)">
                      Accept<span class="sr-only"> {{ request.student.firstName }} in {{ request.course.name }}</span>
                    </button>
                    <button type="button" class="action-btn action-btn--danger" [disabled]="busyKey() === key(request)" (click)="decide(request, false)">
                      Reject<span class="sr-only"> {{ request.student.firstName }} in {{ request.course.name }}</span>
                    </button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      } @else {
        <app-empty-state>No pending requests.</app-empty-state>
      }
    } @else if (!error()) {
      <app-loading label="Loading requests…" />
    }
  `,
})
export class RequestsTable {
  private readonly adminApi = inject(AdminApi);
  private readonly coursesApi = inject(CoursesApi);

  protected readonly key = requestKey;
  protected readonly requests = signal<EnrolmentRequest[] | null>(null);
  protected readonly error = signal('');
  protected readonly busyKey = signal<string | null>(null);

  constructor() {
    this.load();
  }

  protected load(): void {
    this.error.set('');
    this.adminApi.requests().subscribe({
      next: ({ requests }) => this.requests.set(requests),
      error: (error) => this.error.set(toApiError(error).message),
    });
  }

  protected decide(request: EnrolmentRequest, accept: boolean): void {
    const action: Observable<void> = accept
      ? this.coursesApi.acceptRequest(request.course.id, request.student.id)
      : this.coursesApi.rejectRequest(request.course.id, request.student.id);

    this.busyKey.set(requestKey(request));
    action.subscribe({
      next: () => {
        this.busyKey.set(null);
        this.requests.update((list) => list?.filter((r) => requestKey(r) !== requestKey(request)) ?? null);
      },
      error: (error) => {
        this.busyKey.set(null);
        this.error.set(toApiError(error).message);
      },
    });
  }
}
