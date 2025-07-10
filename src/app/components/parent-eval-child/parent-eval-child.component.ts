import { Component, OnInit } from '@angular/core';
import { jwtDecode } from 'jwt-decode';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-parent-eval-child',
  templateUrl: './parent-eval-child.component.html',
  styleUrls: ['./parent-eval-child.component.css']
})
export class ParentEvalChildComponent implements OnInit {
  childPhone: number | null = null;
  courses: any[] = [];
  error: string = '';
  parentId: string = '';
  childTelephones: number[] = [];

  constructor(private userService: UserService) { }

  ngOnInit(): void {
    const token = sessionStorage.getItem("token");
    if (token) {
      const decoded: any = jwtDecode(token);
      this.parentId = decoded._id;
      this.childTelephones = decoded.childTelephones || [];
      console.log(this.childTelephones)
      console.log(decoded)
    }
  }

  searchChildCourses() {
    if (!this.childPhone) return;

    if (!this.childTelephones.includes(Number(this.childPhone))) {
      this.error = "You can only view courses of your own children.";
      this.courses = [];
      return;
    }

    this.userService.getChildCourses(this.childPhone).subscribe(res => {
      if (res.status === 'OK') {
        this.courses = res.courses;
        this.error = '';
      } else {
        this.error = 'Child not found.';
        this.courses = [];
      }
    })
  }

}
