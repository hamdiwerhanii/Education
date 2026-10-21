import { DatePipe } from '@angular/common';
import { Component, inject, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Avatar } from '../../../../../shared/components/avatar/avatar';
import { Alert, EmptyState, Loading } from '../../../../../shared/components/status/status';
import { ROLE_LABEL } from '../../../../../shared/constants/roles';
import { AdminUser } from '../../../../../shared/models/user.model';
import { AdminApi, UserFilters } from '../../../../../shared/services/admin.api';
import { toApiError } from '../../../../../shared/utils/api-error';

@Component({
  selector: 'app-users-table',
  imports: [FormsModule, DatePipe, Avatar, Loading, Alert, EmptyState],
  templateUrl: './users-table.html',
})
export class UsersTable {
  private readonly api = inject(AdminApi);

  readonly changed = output<void>();

  protected readonly roleLabel = ROLE_LABEL;
  protected readonly filters = signal<Required<UserFilters>>({ role: '', status: '', q: '' });
  protected readonly users = signal<AdminUser[] | null>(null);
  protected readonly error = signal('');
  protected readonly busyId = signal<string | null>(null);

  constructor() {
    this.load();
  }

  protected setFilter(key: keyof UserFilters, value: string): void {
    this.filters.update((current) => ({ ...current, [key]: value }));
    this.load();
  }

  protected load(): void {
    this.error.set('');
    this.api.users(this.filters()).subscribe({
      next: ({ users }) => this.users.set(users),
      error: (error) => this.error.set(toApiError(error).message),
    });
  }

  protected cvUrl(user: AdminUser): string {
    return this.api.cvUrl(user.id);
  }

  protected approve(user: AdminUser): void {
    this.run(user.id, this.api.approve(user.id));
  }

  protected remove(user: AdminUser): void {
    const warning =
      user.role === 'teacher' ? ' Their courses will be deleted too.' : user.role === 'student' ? ' Their grades will be removed.' : '';
    if (!window.confirm(`Delete ${user.firstName} ${user.lastName}?${warning} This cannot be undone.`)) return;
    this.run(user.id, this.api.remove(user.id));
  }

  private run(id: string, request: ReturnType<AdminApi['approve']>): void {
    this.busyId.set(id);
    request.subscribe({
      next: () => {
        this.busyId.set(null);
        this.load();
        this.changed.emit();
      },
      error: (error) => {
        this.busyId.set(null);
        this.error.set(toApiError(error).message);
      },
    });
  }
}
