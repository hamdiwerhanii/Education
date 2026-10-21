import { Person } from './user.model';

export interface Grade {
  mark: number;
  evaluation: string;
  updatedAt?: string;
}

export interface CourseSummary {
  id: string;
  name: string;
  description: string;
  durationMinutes: number;
  teacher: Person;
  studentCount: number;
  createdAt: string;
}

export interface EnrolledStudent extends Person {
  grade: Grade | null;
}

export interface ManagedCourse extends CourseSummary {
  students: EnrolledStudent[];
  pendingStudents: Person[];
}

export interface StudentCourse extends CourseSummary {
  grade: Grade | null;
}

export interface CourseViewer {
  canManage: boolean;
  isEnrolled: boolean;
  isPending: boolean;
}

export interface CoursePage {
  courses: CourseSummary[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface CourseInput {
  name: string;
  description: string;
  durationMinutes: number;
}

export interface EnrolmentRequest {
  course: { id: string; name: string };
  student: Person;
}

export interface Child extends Person {
  courses: StudentCourse[];
  pending: CourseSummary[];
}
