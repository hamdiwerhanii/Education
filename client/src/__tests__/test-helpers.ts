import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { computed, signal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { ROLE_HOME } from '../app/shared/constants/roles';
import { Role, User } from '../app/shared/models/user.model';
import { AuthStore } from '../app/shared/services/auth.store';

export const demoUser = (role: Role = 'student'): User => ({
  id: 'u1',
  firstName: 'Ines',
  lastName: 'Jaziri',
  email: 'ines@example.com',
  telephone: '30000002',
  role,
  isApproved: true,
  address: '',
  speciality: '',
  photoUrl: null,
  createdAt: '2026-01-01T00:00:00.000Z',
});

export function fakeAuthStore(initial: User | null = null) {
  const user = signal<User | null>(initial);
  const role = computed(() => user()?.role ?? null);
  return {
    user,
    role,
    isLoggedIn: computed(() => user() !== null),
    homePath: computed(() => {
      const current = role();
      return current ? ROLE_HOME[current] : '/';
    }),
    load: vi.fn(async () => undefined),
    login: vi.fn(async () => initial ?? demoUser()),
    signUp: vi.fn(async (data: FormData) => ({ user: demoUser(data.get('role') as Role), pendingApproval: false })),
    logout: vi.fn(async () => user.set(null)),
  };
}

export const baseProviders = (auth = fakeAuthStore()) => [
  provideRouter([]),
  provideHttpClient(),
  provideHttpClientTesting(),
  { provide: AuthStore, useValue: auth },
];
