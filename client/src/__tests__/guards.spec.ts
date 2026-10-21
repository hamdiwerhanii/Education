import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { dashboardRedirect, guestGuard, roleGuard } from '../app/shared/guards/auth.guards';
import { baseProviders, demoUser, fakeAuthStore } from './test-helpers';

const route = {} as ActivatedRouteSnapshot;
const state = (url: string) => ({ url }) as RouterStateSnapshot;

function run(guard: ReturnType<typeof roleGuard>, auth: ReturnType<typeof fakeAuthStore>, url = '/dashboard/admin') {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({ providers: baseProviders(auth) });
  const result = TestBed.runInInjectionContext(() => guard(route, state(url)));
  const router = TestBed.inject(Router);
  return result instanceof UrlTree ? router.serializeUrl(result) : result;
}

describe('route guards', () => {
  it('sends visitors to the login page and remembers where they were going', () => {
    expect(run(roleGuard('admin'), fakeAuthStore())).toBe('/login?returnUrl=%2Fdashboard%2Fadmin');
  });

  it('sends users with the wrong role to their own dashboard', () => {
    expect(run(roleGuard('admin'), fakeAuthStore(demoUser('student')))).toBe('/dashboard/student');
  });

  it('lets the right role through', () => {
    expect(run(roleGuard('admin', 'teacher'), fakeAuthStore(demoUser('teacher')))).toBe(true);
  });

  it('keeps logged-in users away from the login page', () => {
    expect(run(guestGuard, fakeAuthStore(demoUser('parent')), '/login')).toBe('/dashboard/parent');
    expect(run(guestGuard, fakeAuthStore(), '/login')).toBe(true);
  });

  it('redirects /dashboard to the dashboard of the current role', () => {
    expect(run(dashboardRedirect, fakeAuthStore(demoUser('teacher')), '/dashboard')).toBe('/dashboard/teacher');
  });
});
