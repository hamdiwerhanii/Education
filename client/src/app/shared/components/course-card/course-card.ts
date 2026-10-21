import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CourseSummary } from '../../models/course.model';
import { DurationPipe } from '../../pipes/duration.pipe';

const COVER_COUNT = 6;

@Component({
  selector: 'app-course-card',
  imports: [RouterLink, DurationPipe],
  template: `
    <article class="properties properties2 mb-30">
      <div class="properties__card">
        <div class="properties__img overlay1">
          <a [routerLink]="['/courses', course().id]" tabindex="-1" aria-hidden="true">
            <img [src]="cover()" alt="" loading="lazy" width="360" height="240" />
          </a>
        </div>
        <div class="properties__caption">
          <p>{{ course().teacher.firstName }} {{ course().teacher.lastName }}</p>
          <h3><a [routerLink]="['/courses', course().id]">{{ course().name }}</a></h3>
          <p class="course-card__description">{{ course().description }}</p>
          <div class="properties__footer d-flex justify-content-between align-items-center">
            <div class="restaurant-name">
              <p><i class="far fa-clock" aria-hidden="true"></i> {{ course().durationMinutes | duration }}</p>
            </div>
            <div class="price">
              <span>{{ course().studentCount }} {{ course().studentCount === 1 ? 'student' : 'students' }}</span>
            </div>
          </div>
          <a class="border-btn border-btn2" [routerLink]="['/courses', course().id]">Find out more<span class="sr-only">: {{ course().name }}</span></a>
        </div>
      </div>
    </article>
  `,
  styles: `
    .course-card__description {
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .price span {
      font-size: 16px;
    }
  `,
})
export class CourseCard {
  readonly course = input.required<CourseSummary>();
  readonly index = input(0);

  protected readonly cover = computed(() => `assets/img/gallery/featured${(this.index() % COVER_COUNT) + 1}.png`);
}
