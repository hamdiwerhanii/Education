import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ROLE_HOME } from '../constants/roles';
import { Role, User } from '../models/user.model';

interface UserResponse {
  user: User;
}

interface SignUpResponse extends UserResponse {
  pendingApproval: boolean;
}

@Injectable({ providedIn: 'root' })
export class AuthStore {
  private readonly http = inject(HttpClient);
  private readonly currentUser = signal<User | null>(null);

  readonly user = this.currentUser.asReadonly();
  readonly isLoggedIn = computed(() => this.currentUser() !== null);
  readonly role = computed<Role | null>(() => this.currentUser()?.role ?? null);
  readonly homePath = computed(() => {
    const role = this.role();
    return role ? ROLE_HOME[role] : '/';
  });

  async load(): Promise<void> {
    try {
      const { user } = await firstValueFrom(this.http.get<{ user: User | null }>('/api/auth/me'));
      this.currentUser.set(user);
    } catch {
      this.currentUser.set(null);
    }
  }

  async login(telephone: string, password: string): Promise<User> {
    const { user } = await firstValueFrom(this.http.post<UserResponse>('/api/auth/login', { telephone, password }));
    this.currentUser.set(user);
    return user;
  }

  async signUp(form: FormData): Promise<SignUpResponse> {
    const response = await firstValueFrom(this.http.post<SignUpResponse>('/api/auth/signup', form));
    if (!response.pendingApproval) this.currentUser.set(response.user);
    return response;
  }

  async logout(): Promise<void> {
    await firstValueFrom(this.http.post('/api/auth/logout', {})).catch(() => undefined);
    this.currentUser.set(null);
  }
}
