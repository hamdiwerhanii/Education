import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';


@Injectable({
  providedIn: 'root'
})
export class UserService {
  userUrl: string = "http://localhost:4000/api/users"
  constructor(private http: HttpClient) { }

  signUp(user: any, files: { photo?: File, cv?: File }) {
    const formData = new FormData();

    // Common fields
    formData.append('firstName', user.firstName);
    formData.append('lastName', user.lastName);
    formData.append('email', user.email);
    formData.append('password', user.password);
    formData.append('telephone', user.telephone);
    formData.append('address', user.address || '');
    formData.append('role', user.role);

    // Teacher
    if (user.role === 'teacher') {
      formData.append('speciality', user.speciality);
      if (files?.cv) formData.append('cv', files.cv);      // ✅ CV
      if (files?.photo) formData.append('img', files.photo); // ✅ Photo
    }

    // Student / Parent / Admin
    else {
      if (files?.photo) formData.append('img', files.photo);
    }

    if (user.role === 'parent') {
      formData.append('childTelephones', JSON.stringify(user.childTelephones));
    }

    return this.http.post<{
      status?: string; emailExists?: boolean;
      telephoneExists?: boolean;
    }>(this.userUrl, formData);
  }

  // Login
  loginUser(user: any) {
    return this.http.post<{ status: string; user: any }>(`${this.userUrl}/login`, user);
  }

  // Get all users
  getAllUsers() {
    return this.http.get<{ tab: any; status: string }>(this.userUrl);
  }

  // Get user by ID
  getUserById(id: string) {
    return this.http.get<{ user: any; status: string }>(`${this.userUrl}/${id}`);
  }

  // Update user
  updateUser(userId: string, data: any) {
    return this.http.put(`${this.userUrl}/${userId}`, data);
  }

  // Delete user
  deleteUser(userId: string) {
    return this.http.delete<{ status: string }>(`${this.userUrl}/${userId}`);
  }

  // Admin: validate teacher account
  validateTeacher(userId: string) {
    return this.http.put<{ status: string }>(`${this.userUrl}/validate`, { userId });
  }

  sendJoinRequest(studentId: string, courseId: string) {
    return this.http.post<{ status: string }>(`${this.userUrl}/join-request`, {
      studentId,
      courseId
    });
  }

  acceptCourseRequest(studentId: string, courseId: string) {
    return this.http.put<{ status: string }>(`${this.userUrl}/accept-course-request`,
      { studentId, courseId }
    );
  }

  getChildCourses(childPhone: number) {
    return this.http.post<{ status: string, courses: any[] }>(
      `${this.userUrl}/parents/child-courses`,
      { childPhone }
    );
  }
}
