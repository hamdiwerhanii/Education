import { Component, inject, signal } from '@angular/core';
import { DashboardShell } from '../../../../../shared/components/dashboard-shell/dashboard-shell';
import { Alert } from '../../../../../shared/components/status/status';
import { AdminApi, AdminStats } from '../../../../../shared/services/admin.api';
import { ADMIN_NAV } from '../../../dashboard.nav';
import { CoursesTable } from '../courses-table/courses-table';
import { RequestsTable } from '../requests-table/requests-table';
import { UsersTable } from '../users-table/users-table';

type Tab = 'users' | 'requests' | 'courses';

@Component({
  selector: 'app-admin-dashboard-page',
  imports: [DashboardShell, UsersTable, RequestsTable, CoursesTable, Alert],
  templateUrl: './admin-dashboard-page.html',
  styleUrl: './admin-dashboard-page.css',
})
export class AdminDashboardPage {
  private readonly api = inject(AdminApi);

  protected readonly nav = ADMIN_NAV;
  protected readonly tabs: { id: Tab; label: string }[] = [
    { id: 'users', label: 'Users' },
    { id: 'requests', label: 'Enrolment requests' },
    { id: 'courses', label: 'Courses' },
  ];
  protected readonly activeTab = signal<Tab>('users');
  protected readonly stats = signal<AdminStats | null>(null);
  protected readonly statsError = signal('');

  constructor() {
    this.loadStats();
  }

  protected loadStats(): void {
    this.api.stats().subscribe({
      next: ({ stats }) => this.stats.set(stats),
      error: () => this.statsError.set('Statistics could not be loaded.'),
    });
  }
}
