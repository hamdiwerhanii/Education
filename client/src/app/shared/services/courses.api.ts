import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CourseInput, CoursePage, CourseSummary, CourseViewer, Grade, ManagedCourse } from '../models/course.model';

export interface CourseDetail {
  course: CourseSummary | ManagedCourse;
  viewer: CourseViewer;
}

@Injectable({ providedIn: 'root' })
export class CoursesApi {
  private readonly http = inject(HttpClient);
  private readonly base = '/api/courses';

  list(params: { page?: number; limit?: number; q?: string } = {}): Observable<CoursePage> {
    let query = new HttpParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== '') query = query.set(key, String(value));
    }
    return this.http.get<CoursePage>(this.base, { params: query });
  }

  get(id: string): Observable<CourseDetail> {
    return this.http.get<CourseDetail>(`${this.base}/${id}`);
  }

  create(input: CourseInput): Observable<{ course: CourseSummary }> {
    return this.http.post<{ course: CourseSummary }>(this.base, input);
  }

  update(id: string, input: Partial<CourseInput>): Observable<{ course: CourseSummary }> {
    return this.http.patch<{ course: CourseSummary }>(`${this.base}/${id}`, input);
  }

  remove(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  join(id: string): Observable<unknown> {
    return this.http.post(`${this.base}/${id}/join`, {});
  }

  cancelJoin(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}/join`);
  }

  acceptRequest(courseId: string, studentId: string): Observable<void> {
    return this.http.post<void>(`${this.base}/${courseId}/requests/${studentId}/accept`, {});
  }

  rejectRequest(courseId: string, studentId: string): Observable<void> {
    return this.http.post<void>(`${this.base}/${courseId}/requests/${studentId}/reject`, {});
  }

  grade(courseId: string, studentId: string, grade: Grade): Observable<{ grade: Grade }> {
    return this.http.put<{ grade: Grade }>(`${this.base}/${courseId}/grades/${studentId}`, grade);
  }
}
