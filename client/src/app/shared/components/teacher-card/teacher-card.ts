import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Teacher } from '../../models/user.model';
import { Avatar } from '../avatar/avatar';

@Component({
  selector: 'app-teacher-card',
  imports: [RouterLink, Avatar],
  template: `
    <article class="single-cat text-center">
      <a class="cat-icon" [routerLink]="['/teachers', teacher().id]" tabindex="-1" aria-hidden="true">
        <app-avatar [person]="teacher()" [size]="220" />
      </a>
      <div class="cat-cap">
        <h3 class="teacher-card__name">
          <a [routerLink]="['/teachers', teacher().id]">{{ teacher().firstName }} {{ teacher().lastName }}</a>
        </h3>
        <p>{{ teacher().speciality }}</p>
      </div>
    </article>
  `,
  styles: `
    .single-cat {
      margin-bottom: 40px;
    }
    .teacher-card__name {
      font-size: 24px;
      margin-top: 20px;
    }
    .teacher-card__name a {
      color: inherit;
    }
  `,
})
export class TeacherCard {
  readonly teacher = input.required<Teacher>();
}
