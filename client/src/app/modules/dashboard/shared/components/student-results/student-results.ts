import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { EmptyState } from '../../../../../shared/components/status/status';
import { CourseSummary, StudentCourse } from '../../../../../shared/models/course.model';

@Component({
  selector: 'app-student-results',
  imports: [RouterLink, EmptyState],
  template: `
    @if (courses().length) {
      <div class="table-scroll">
        <table class="data-table">
          <caption class="sr-only">{{ caption() }}</caption>
          <thead>
            <tr>
              <th scope="col">Course</th>
              <th scope="col">Teacher</th>
              <th scope="col">Mark</th>
              <th scope="col">Feedback</th>
            </tr>
          </thead>
          <tbody>
            @for (course of courses(); track course.id) {
              <tr>
                <td><a [routerLink]="['/courses', course.id]">{{ course.name }}</a></td>
                <td>{{ course.teacher.firstName }} {{ course.teacher.lastName }}</td>
                <td>
                  @if (course.grade; as grade) {
                    <strong class="mark">{{ grade.mark }}/20</strong>
                  } @else {
                    <span class="field-hint">Not graded yet</span>
                  }
                </td>
                <td>{{ course.grade?.evaluation || '—' }}</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    } @else {
      <app-empty-state>{{ emptyMessage() }}</app-empty-state>
    }

    @if (pending().length) {
      <h3 class="pending-title">Waiting for approval</h3>
      <ul class="pending-list">
        @for (course of pending(); track course.id) {
          <li><a [routerLink]="['/courses', course.id]">{{ course.name }}</a> <span class="badge-pill badge-pill--warning">Pending</span></li>
        }
      </ul>
    }
  `,
  styles: `
    .mark {
      color: #7364ff;
      font-size: 17px;
    }
    .pending-title {
      margin: 24px 0 10px;
      font-size: 18px;
    }
    .pending-list {
      padding-left: 18px;
    }
    .pending-list li {
      margin-bottom: 6px;
    }
  `,
})
export class StudentResults {
  readonly courses = input.required<StudentCourse[]>();
  readonly pending = input<CourseSummary[]>([]);
  readonly caption = input('Courses and grades');
  readonly emptyMessage = input('Not enrolled in any course yet.');
}
