import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Alert, EmptyState, Loading } from '../../../../shared/components/status/status';
import { CourseCard } from '../../../../shared/components/course-card/course-card';
import { TeacherCard } from '../../../../shared/components/teacher-card/teacher-card';
import { CourseSummary } from '../../../../shared/models/course.model';
import { Teacher } from '../../../../shared/models/user.model';
import { AuthStore } from '../../../../shared/services/auth.store';
import { CoursesApi } from '../../../../shared/services/courses.api';
import { TeachersApi } from '../../../../shared/services/teachers.api';
import { AboutSection } from '../../../about/components/about-section/about-section';
import { HOME_FEATURES, HOME_LIMITS, SUBJECTS } from '../../constants/home.data';

@Component({
  selector: 'app-home-page',
  imports: [RouterLink, CourseCard, TeacherCard, AboutSection, Loading, Alert, EmptyState],
  templateUrl: './home-page.html',
  styleUrl: './home-page.css',
})
export class HomePage {
  private readonly coursesApi = inject(CoursesApi);
  private readonly teachersApi = inject(TeachersApi);
  protected readonly auth = inject(AuthStore);

  protected readonly features = HOME_FEATURES;
  protected readonly subjects = SUBJECTS;

  protected readonly courses = signal<CourseSummary[] | null>(null);
  protected readonly teachers = signal<Teacher[] | null>(null);
  protected readonly error = signal('');

  constructor() {
    this.load();
  }

  protected load(): void {
    this.error.set('');
    this.coursesApi.list({ limit: HOME_LIMITS.courses }).subscribe({
      next: ({ courses }) => this.courses.set(courses),
      error: () => this.error.set('Courses could not be loaded.'),
    });
    this.teachersApi.list().subscribe({
      next: ({ teachers }) => this.teachers.set(teachers.slice(0, HOME_LIMITS.teachers)),
      error: () => this.error.set('Teachers could not be loaded.'),
    });
  }
}
