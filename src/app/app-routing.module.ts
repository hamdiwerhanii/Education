import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { CoursesComponent } from './components/courses/courses.component';
import { TeachersComponent } from './components/teachers/teachers.component';
import { SignUpComponent } from './components/sign-up/sign-up.component';
import { AddCourseComponent } from './components/add-course/add-course.component';
import { LoginComponent } from './components/login/login.component';
import { TeacherDashboardComponent } from './components/teacher-dashboard/teacher-dashboard.component';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';
import { DashboardHomeComponent } from './components/dashboard-home/dashboard-home.component';
import { CourseInfoComponent } from './components/course-info/course-info.component';
import { EditCourseComponent } from './components/edit-course/edit-course.component';
import { DashboardAdminHomeComponent } from './components/dashboard-admin-home/dashboard-admin-home.component';
import { UserInfoComponent } from './components/user-info/user-info.component';
import { StudentDashboardComponent } from './components/student-dashboard/student-dashboard.component';
import { ParentEvalChildComponent } from './components/parent-eval-child/parent-eval-child.component';

const routes: Routes = [
  { path: "", component: HomeComponent },
  { path: "courses", component: CoursesComponent },
  { path: "teachers", component: TeachersComponent },
  { path: "signUpAdmin", component: SignUpComponent },
  { path: "signUpTeacher", component: SignUpComponent },
  { path: "signUpStudent", component: SignUpComponent },
  { path: "signUpParent", component: SignUpComponent },
  { path: "login", component: LoginComponent },
  { path: "courseInfo/:id", component: CourseInfoComponent },
  { path: "userInfo/:id", component: UserInfoComponent },
  { path: "studentDashboard", component: StudentDashboardComponent },
  { path: "childsEvaluation", component: ParentEvalChildComponent },
  {
    path: "teacherDashboard",
    component: TeacherDashboardComponent,
    children: [
      { path: "addCourse", component: AddCourseComponent },
      { path: "home", component: DashboardHomeComponent },
      { path: "editCourse/:id", component: EditCourseComponent },
    ]
  },
  {
    path: "dashboardAdmin", component: AdminDashboardComponent, children: [
      { path: "home", component: DashboardAdminHomeComponent },
      { path: "editCourse/:id", component: EditCourseComponent },
    ]
  },
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
