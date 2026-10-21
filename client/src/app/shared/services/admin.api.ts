import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { EnrolmentRequest } from '../models/course.model';
import { AdminUser, SignUpRole } from '../models/user.model';

export interface AdminStats {
  teachers: number;
  students: number;
  parents: number;
  pendingTeachers: number;
  courses: number;
}

export interface UserFilters {
  role?: SignUpRole | '';
  status?: 'pending' | 'approved' | '';
  q?: string;
}

@Injectable({ providedIn: 'root' })
export class AdminApi {
  private readonly http = inject(HttpClient);
  private readonly base = '/api/admin';

  stats(): Observable<{ stats: AdminStats }> {
    return this.http.get<{ stats: AdminStats }>(`${this.base}/stats`);
  }

  users(filters: UserFilters = {}): Observable<{ users: AdminUser[] }> {
    let params = new HttpParams();
    for (const [key, value] of Object.entries(filters)) {
      if (value) params = params.set(key, value);
    }
    return this.http.get<{ users: AdminUser[] }>(`${this.base}/users`, { params });
  }

  approve(userId: string): Observable<unknown> {
    return this.http.post(`${this.base}/users/${userId}/approve`, {});
  }

  remove(userId: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/users/${userId}`);
  }

  cvUrl(userId: string): string {
    return `${this.base}/users/${userId}/cv`;
  }

  requests(): Observable<{ requests: EnrolmentRequest[] }> {
    return this.http.get<{ requests: EnrolmentRequest[] }>(`${this.base}/requests`);
  }
}
