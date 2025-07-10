import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { CourseService } from 'src/app/services/course.service';
import { UserService } from 'src/app/services/user.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-course-info',
  templateUrl: './course-info.component.html',
  styleUrls: ['./course-info.component.css']
})
export class CourseInfoComponent implements OnInit {
  courseId: any
  course: any
  currentUser: any
  constructor(private courseService: CourseService, private activatedRoute: ActivatedRoute, private userService: UserService) { }

  ngOnInit(): void {
    this.courseId = this.activatedRoute.snapshot.paramMap.get("id");
    this.courseService.getCourseById(this.courseId).subscribe((data) => {
      console.log("Here data from BE", data)
      if (data.course) {
        this.course = data.course;
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Match Not Found',
          text: 'No match data was returned from the server.',
        });
      }
    }
    )

    const storedUser = sessionStorage.getItem("token");
    if (storedUser) {
      let decodedToken: any = jwtDecode(storedUser)
      this.userService.getUserById(decodedToken._id).subscribe((res) => {
        this.currentUser = res.user;
      });
    }
  }

  sendRequest(courseId: any) {
    console.log("Sending request from user:", this.currentUser._id);
    this.userService.sendJoinRequest(this.currentUser._id, courseId).subscribe(res => {
      console.log("Response from backend:", res);
      if (res.status === "REQUEST_ADDED") {
        this.userService.getUserById(this.currentUser._id).subscribe((res) => {
          this.currentUser = res.user;
          Swal.fire({
            icon: 'success',
            title: 'Request Sent!',
            text: 'Your request to join this course is now pending.',
          });
        });
      }
    });
  }

  alreadyRequested(courseId: string): boolean {
    return this.currentUser?.requestedCourseIds?.includes(courseId);
  }
}