import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MAIN_NAV } from '../../constants/nav';
import { SITE } from '../../constants/site';
import { AuthStore } from '../../services/auth.store';

@Component({
  selector: 'app-footer',
  imports: [RouterLink],
  templateUrl: './footer.html',
  styles: `
    .footer-link-button {
      padding: 0;
      border: 0;
      background: none;
      color: #fff;
      font: inherit;
      cursor: pointer;
    }
  `,
})
export class Footer {
  private readonly router = inject(Router);
  protected readonly auth = inject(AuthStore);
  protected readonly site = SITE;
  protected readonly year = new Date().getFullYear();
  protected readonly explore = MAIN_NAV;
  protected readonly guestLinks = [
    { label: 'Log in', path: '/login' },
    { label: 'Join as a student', path: '/sign-up/student' },
    { label: 'Join as a teacher', path: '/sign-up/teacher' },
    { label: 'Join as a parent', path: '/sign-up/parent' },
  ];

  protected async logout(): Promise<void> {
    await this.auth.logout();
    await this.router.navigateByUrl('/');
  }
}
