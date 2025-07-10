import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CourseService } from 'src/app/services/course.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-users-table',
  templateUrl: './users-table.component.html',
  styleUrls: ['./users-table.component.css']
})
export class UsersTableComponent implements OnInit {
  users: any = []
  courses: any = []
  status: any
  constructor(private userService: UserService, private router: Router, private courseServices: CourseService) { }

  ngOnInit(): void {
    this.userService.getAllUsers().subscribe((response) => {
      console.log(response)
      this.users = response.tab;
    })
    this.courseServices.getAllCourses().subscribe((res) => {
      this.courses = res.tab;
    });
  }
  validateUser(id: any) {
    this.userService.validateTeacher(id).subscribe((response) => {
      console.log(response)
      if (response.status == "OK ") {
        this.userService.getAllUsers().subscribe((response) => {
          this.users = response.tab
        })
      }
    })
  }

  deleteUser(id: any) {
    this.userService.deleteUser(id).subscribe((response) => {
      console.log(response)
      if (response.status == "DELETED") {
        this.userService.getAllUsers().subscribe((response) => {
          this.users = response.tab
        })
      }
    })
  }
  displayUser(id: any) {
    this.router.navigate([`userInfo/${id}`]);
  }
  acceptStudentRequest(studentId: string, courseId: string) {
    this.userService.acceptCourseRequest(studentId, courseId).subscribe(response => {
      console.log("Accepted", response);
      if (response.status === "ACCEPTED") {
        this.userService.getAllUsers().subscribe(res => {
          this.users = res.tab;
        });
      }
    });
  }
  isStudentInCourse(studentId: string, courseId: string): boolean {
    const course = this.courses?.find((c: any) => c._id === courseId);
    return course?.students?.includes(studentId);
  }


}
