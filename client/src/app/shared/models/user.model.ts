export type Role = 'admin' | 'teacher' | 'student' | 'parent';
export type SignUpRole = Exclude<Role, 'admin'>;

export interface Person {
  id: string;
  firstName: string;
  lastName: string;
  photoUrl: string | null;
}

export interface User extends Person {
  email: string;
  telephone: string;
  role: Role;
  isApproved: boolean;
  address: string;
  speciality: string;
  createdAt: string;
}

export interface Teacher extends Person {
  speciality: string;
}

export interface AdminUser extends User {
  hasCv: boolean;
  childCount: number;
}
