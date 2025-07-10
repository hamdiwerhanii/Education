import { Component, OnInit } from '@angular/core';
import { jwtDecode } from 'jwt-decode';
import { CourseService } from 'src/app/services/course.service';

@Component({
  selector: 'app-student-dashboard',
  templateUrl: './student-dashboard.component.html',
  styleUrls: ['./student-dashboard.component.css']
})
export class StudentDashboardComponent implements OnInit {
  studentId: string = '';
  courses: any[] = [];
  selectedCourse: any = null;
  myGrade: any = null;

  constructor(private courseService: CourseService) { }

  ngOnInit(): void {
    const token = sessionStorage.getItem("token");
    if (token) {
      const decoded: any = jwtDecode(token);
      this.studentId = decoded._id;
    }

    this.courseService.getAllCourses().subscribe((res) => {
      // Filtrer uniquement les cours où l’étudiant est inscrit
      this.courses = res.tab.filter((course: any) =>
        course.students?.some((s: any) => s._id === this.studentId || s === this.studentId)
      );
    });
  }

  selectCourse(course: any) {
    this.selectedCourse = course;

    // Chercher la note de l'étudiant connecté
    const found = course.grades.find((g: any) => g.studentId === this.studentId || g.studentId?._id === this.studentId);
    this.myGrade = found ? found : null;
  }

}
