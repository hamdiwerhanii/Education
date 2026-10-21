import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CourseSummary } from '../models/course.model';
import { Teacher } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class TeachersApi {
  private readonly http = inject(HttpClient);

  list(q = ''): Observable<{ teachers: Teacher[] }> {
    const params = q ? new HttpParams().set('q', q) : undefined;
    return this.http.get<{ teachers: Teacher[] }>('/api/teachers', { params });
  }

  get(id: string): Observable<{ teacher: Teacher; courses: CourseSummary[] }> {
    return this.http.get<{ teacher: Teacher; courses: CourseSummary[] }>(`/api/teachers/${id}`);
  }
}
