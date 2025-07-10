import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CourseService {
  coursesUrl: string = "http://localhost:4000/api/courses"
  constructor(private httpClient: HttpClient) { }

  // get all Courses
  getAllCourses() {
    return this.httpClient.get<{ tab: any, nbr: number, status: string }>(this.coursesUrl);
  }

  // get course by id
  getCourseById(id: number) {
    return this.httpClient.get<{ course: any, status: string }>(`${this.coursesUrl}/${id}`);
  }

  // add course
  addCourse(course: any) {
    return this.httpClient.post<{ status: string }>(this.coursesUrl, course);
  }

  // update course
  updateCourse(course: any) {
    return this.httpClient.put<{ msg: string }>(this.coursesUrl, course);
  }

  // delete course
  deleteCourse(id: number) {
    return this.httpClient.delete<{ status: string }>(`${this.coursesUrl}/${id}`);
  }

  addGrade(courseId: string, studentId: string, grade: any) {
    return this.httpClient.put(`${this.coursesUrl}/${courseId}/add-grade`, {
      studentId,
      mark: grade.mark,
      evaluation: grade.evaluation
    });
  }
}
