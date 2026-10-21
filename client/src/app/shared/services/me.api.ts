import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Child, CourseSummary, ManagedCourse, StudentCourse } from '../models/course.model';

@Injectable({ providedIn: 'root' })
export class MeApi {
  private readonly http = inject(HttpClient);

  teacherCourses(): Observable<{ courses: ManagedCourse[] }> {
    return this.http.get<{ courses: ManagedCourse[] }>('/api/me/courses');
  }

  studentCourses(): Observable<{ courses: StudentCourse[]; pending: CourseSummary[] }> {
    return this.http.get<{ courses: StudentCourse[]; pending: CourseSummary[] }>('/api/me/courses');
  }

  children(): Observable<{ children: Child[] }> {
    return this.http.get<{ children: Child[] }>('/api/me/children');
  }
}
