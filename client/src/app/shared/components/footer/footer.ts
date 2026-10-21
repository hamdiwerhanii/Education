import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MAIN_NAV } from '../../constants/nav';
import { SITE } from '../../constants/site';

@Component({
  selector: 'app-footer',
  imports: [RouterLink],
  templateUrl: './footer.html',
})
export class Footer {
  protected readonly site = SITE;
  protected readonly year = new Date().getFullYear();
  protected readonly explore = MAIN_NAV;
  protected readonly account = [
    { label: 'Log in', path: '/login' },
    { label: 'Join as a student', path: '/sign-up/student' },
    { label: 'Join as a teacher', path: '/sign-up/teacher' },
    { label: 'Join as a parent', path: '/sign-up/parent' },
  ];
}
