import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthStore } from '../../../../shared/services/auth.store';

@Component({
  selector: 'app-about-section',
  imports: [RouterLink],
  template: `
    <section class="about-area2 fix pb-padding" aria-labelledby="about-title">
      <div class="support-wrapper align-items-center">
        <div class="right-content2">
          <div class="right-img">
            <img src="assets/img/gallery/about2.png" alt="" loading="lazy" />
          </div>
        </div>
        <div class="left-content2">
          <div class="section-tittle section-tittle2 mb-20">
            <div class="front-text">
              <h2 id="about-title">Take the next step toward your personal and professional goals with us.</h2>
              <p>
                Teachers publish courses, students ask to join and receive marks with feedback, and parents follow
                their children's progress, all from one dashboard.
              </p>
              @if (!auth.isLoggedIn()) {
                <a routerLink="/sign-up/student" class="btn">Join now for free</a>
              }
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
})
export class AboutSection {
  protected readonly auth = inject(AuthStore);
}
