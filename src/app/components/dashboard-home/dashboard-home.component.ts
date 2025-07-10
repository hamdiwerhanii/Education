import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { CourseService } from 'src/app/services/course.service';

@Component({
  selector: 'app-dashboard-home',
  templateUrl: './dashboard-home.component.html',
  styleUrls: ['./dashboard-home.component.css']
})
export class DashboardHomeComponent implements OnInit {
  courses: any = []
  teacherId: any;
  selectedStudent: string | null = null;
  selectedCourseId: string | null = null;
  grade = { mark: 0, evaluation: '' };

  constructor(private router: Router, private courseServices: CourseService) { }

  ngOnInit(): void {
    const token = sessionStorage.getItem("token");
    if (token) {
      const decoded: any = jwtDecode(token);
      this.teacherId = decoded._id;
    }
    this.courseServices.getAllCourses().subscribe((data) => {
      console.log("All courses from BE", data);
      this.courses = data.tab.filter((course: any) => course.teacherId._id == this.teacherId);
    });
  }
  displayCourse(id: any) {
    this.router.navigate([`courseInfo/${id}`]);
  }
  editCourse(id: any) {
    this.router.navigate([`teacherDashboard/editCourse/${id}`]);
  }
  deletCourse(id: any) {
    this.courseServices.deleteCourse(id).subscribe((response) => {
      if (response.status == "DELETED") {
        this.courseServices.getAllCourses().subscribe((data) => {
          console.log("Here data from BE", data)
          this.courses = data.tab
        })

      }
    })
  }
  selectStudent(courseId: string, studentId: string) {
    this.selectedCourseId = courseId;
    this.selectedStudent = studentId;
    this.grade = { mark: 0, evaluation: '' };
  }

  submitGrade() {
    if (this.selectedCourseId && this.selectedStudent) {
      this.courseServices.addGrade(this.selectedCourseId, this.selectedStudent, this.grade).subscribe(res => {
        console.log('Grade added:', res);
        // Optionnel : Recharger la liste des cours
        this.ngOnInit();
        // Réinitialiser
        this.selectedStudent = null;
        this.selectedCourseId = null;
      });
    }
  }
}
