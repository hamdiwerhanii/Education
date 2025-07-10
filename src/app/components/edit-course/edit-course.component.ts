import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CourseService } from 'src/app/services/course.service';

@Component({
  selector: 'app-edit-course',
  templateUrl: './edit-course.component.html',
  styleUrls: ['./edit-course.component.css']
})
export class EditCourseComponent implements OnInit {
  editCourseForm!: FormGroup
  courseId: any
  course: any
  constructor(private route: ActivatedRoute, private router: Router, private courseService: CourseService) { }

  ngOnInit(): void {
    // this.teams = JSON.parse(localStorage.getItem("teams") || "[]");
    this.courseId = this.route.snapshot.paramMap.get('id');
    // this.team = this.teams.find((m: any) => m.id === this.teamId);
    this.courseService.getCourseById(this.courseId).subscribe((data) => {
      console.log(data)
      this.course = data.course
    }
    )
  }

  editCourse() {
    this.courseService.updateCourse(this.course).subscribe((response) => {
      if (response.msg == "Updated") {
        this.router.navigate(["/teacherDashboard/home"])
      }
      else {
        this.router.navigate(["/teacherDashboard/home"])
      }
    })
  }
}
