import { Routes } from '@angular/router';
import { pageTitle, SITE } from './shared/constants/site';
import { dashboardRedirect, guestGuard, roleGuard } from './shared/guards/auth.guards';

export const routes: Routes = [
  {
    path: '',
    title: SITE.title,
    loadComponent: () => import('./modules/home/components/home-page/home-page').then((m) => m.HomePage),
  },
  {
    path: 'courses',
    title: pageTitle('Courses'),
    loadComponent: () => import('./modules/courses/components/courses-page/courses-page').then((m) => m.CoursesPage),
  },
  {
    path: 'courses/:id',
    title: pageTitle('Course'),
    loadComponent: () =>
      import('./modules/courses/components/course-detail-page/course-detail-page').then((m) => m.CourseDetailPage),
  },
  {
    path: 'teachers',
    title: pageTitle('Teachers'),
    loadComponent: () => import('./modules/teachers/components/teachers-page/teachers-page').then((m) => m.TeachersPage),
  },
  {
    path: 'teachers/:id',
    title: pageTitle('Teacher'),
    loadComponent: () =>
      import('./modules/teachers/components/teacher-profile-page/teacher-profile-page').then((m) => m.TeacherProfilePage),
  },
  {
    path: 'about',
    title: pageTitle('About'),
    loadComponent: () => import('./modules/about/components/about-page/about-page').then((m) => m.AboutPage),
  },
  {
    path: 'login',
    title: pageTitle('Log in'),
    canActivate: [guestGuard],
    loadComponent: () => import('./modules/auth/components/login-page/login-page').then((m) => m.LoginPage),
  },
  { path: 'sign-up', pathMatch: 'full', redirectTo: 'sign-up/student' },
  {
    path: 'sign-up/:role',
    title: pageTitle('Sign up'),
    canActivate: [guestGuard],
    loadComponent: () => import('./modules/auth/components/sign-up-page/sign-up-page').then((m) => m.SignUpPage),
  },
  { path: 'dashboard', pathMatch: 'full', canActivate: [dashboardRedirect], children: [] },
  {
    path: 'dashboard/admin',
    title: pageTitle('Admin dashboard'),
    canActivate: [roleGuard('admin')],
    loadComponent: () =>
      import('./modules/dashboard/admin/components/admin-dashboard-page/admin-dashboard-page').then(
        (m) => m.AdminDashboardPage,
      ),
  },
  {
    path: 'dashboard/teacher',
    title: pageTitle('Teacher dashboard'),
    canActivate: [roleGuard('teacher')],
    loadComponent: () =>
      import('./modules/dashboard/teacher/components/teacher-dashboard-page/teacher-dashboard-page').then(
        (m) => m.TeacherDashboardPage,
      ),
  },
  {
    path: 'dashboard/teacher/courses/new',
    title: pageTitle('New course'),
    canActivate: [roleGuard('teacher')],
    loadComponent: () =>
      import('./modules/dashboard/teacher/components/course-form-page/course-form-page').then((m) => m.CourseFormPage),
  },
  {
    path: 'dashboard/courses/:id/edit',
    title: pageTitle('Edit course'),
    canActivate: [roleGuard('teacher', 'admin')],
    loadComponent: () =>
      import('./modules/dashboard/teacher/components/course-form-page/course-form-page').then((m) => m.CourseFormPage),
  },
  {
    path: 'dashboard/student',
    title: pageTitle('My courses'),
    canActivate: [roleGuard('student')],
    loadComponent: () =>
      import('./modules/dashboard/student/components/student-dashboard-page/student-dashboard-page').then(
        (m) => m.StudentDashboardPage,
      ),
  },
  {
    path: 'dashboard/parent',
    title: pageTitle("My children's results"),
    canActivate: [roleGuard('parent')],
    loadComponent: () =>
      import('./modules/dashboard/parent/components/parent-dashboard-page/parent-dashboard-page').then(
        (m) => m.ParentDashboardPage,
      ),
  },
  {
    path: '**',
    title: pageTitle('Page not found'),
    loadComponent: () => import('./modules/not-found/components/not-found-page/not-found-page').then((m) => m.NotFoundPage),
  },
];
