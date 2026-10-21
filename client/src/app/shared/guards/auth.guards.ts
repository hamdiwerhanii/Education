import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Role } from '../models/user.model';
import { AuthStore } from '../services/auth.store';

export const roleGuard =
  (...roles: Role[]): CanActivateFn =>
  (_route, state) => {
    const auth = inject(AuthStore);
    const router = inject(Router);
    const role = auth.role();

    if (!role) return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
    if (!roles.includes(role)) return router.parseUrl(auth.homePath());
    return true;
  };

export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthStore);
  return auth.isLoggedIn() ? inject(Router).parseUrl(auth.homePath()) : true;
};

export const dashboardRedirect: CanActivateFn = (_route, state) => {
  const auth = inject(AuthStore);
  const router = inject(Router);
  return auth.isLoggedIn()
    ? router.parseUrl(auth.homePath())
    : router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};
