import { NavItem } from '../../shared/constants/nav';

export const ADMIN_NAV: NavItem[] = [{ label: 'Overview', path: '/dashboard/admin' }];

export const TEACHER_NAV: NavItem[] = [
  { label: 'My courses', path: '/dashboard/teacher' },
  { label: 'Add course', path: '/dashboard/teacher/courses/new' },
];

export const STUDENT_NAV: NavItem[] = [
  { label: 'My courses', path: '/dashboard/student' },
  { label: 'Browse courses', path: '/courses' },
];

export const PARENT_NAV: NavItem[] = [{ label: "Children's results", path: '/dashboard/parent' }];
