import { Role, SignUpRole } from '../models/user.model';

export const ROLE_HOME: Record<Role, string> = {
  admin: '/dashboard/admin',
  teacher: '/dashboard/teacher',
  student: '/dashboard/student',
  parent: '/dashboard/parent',
};

export const ROLE_LABEL: Record<Role, string> = {
  admin: 'Admin',
  teacher: 'Teacher',
  student: 'Student',
  parent: 'Parent',
};

export const SIGN_UP_ROLES: { role: SignUpRole; label: string; hint: string }[] = [
  { role: 'student', label: 'Student', hint: 'Join courses and follow your grades' },
  { role: 'teacher', label: 'Teacher', hint: 'Publish courses after admin approval' },
  { role: 'parent', label: 'Parent', hint: "Follow your children's results" },
];
