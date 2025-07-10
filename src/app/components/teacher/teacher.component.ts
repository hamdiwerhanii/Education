import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-teacher',
  templateUrl: './teacher.component.html',
  styleUrls: ['./teacher.component.css']
})
export class TeacherComponent implements OnInit {
  @Input() teacher: any
  constructor(private router: Router) { }

  ngOnInit(): void {
  }
  displayTeacher(id: any) {
    this.router.navigate([`userInfo/${id}`]);
  }

}
