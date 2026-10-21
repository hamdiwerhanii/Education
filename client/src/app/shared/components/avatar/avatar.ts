import { Component, computed, input } from '@angular/core';
import { Person } from '../../models/user.model';

@Component({
  selector: 'app-avatar',
  template: `
    @if (person().photoUrl; as url) {
      <img class="avatar" [src]="url" [alt]="decorative() ? '' : fullName()" [width]="size()" [height]="size()" loading="lazy" />
    } @else {
      <span class="avatar avatar--initials" [style.width.px]="size()" [style.height.px]="size()" [style.font-size.px]="size() / 2.6" [attr.aria-label]="decorative() ? null : fullName()" [attr.role]="decorative() ? null : 'img'">
        {{ initials() }}
      </span>
    }
  `,
  styles: `
    .avatar {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      object-fit: cover;
      background: linear-gradient(to bottom, #c054ff, #5274ff);
      color: #fff;
      font-weight: 700;
    }
  `,
})
export class Avatar {
  readonly person = input.required<Person>();
  readonly size = input(40);
  readonly decorative = input(false);

  protected readonly fullName = computed(() => `${this.person().firstName} ${this.person().lastName}`);
  protected readonly initials = computed(() => `${this.person().firstName[0] ?? ''}${this.person().lastName[0] ?? ''}`);
}
