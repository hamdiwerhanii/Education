import { Component } from '@angular/core';
import { PageBanner } from '../../../../shared/components/page-banner/page-banner';
import { ABOUT_ROLES } from '../../constants/about.data';
import { AboutSection } from '../about-section/about-section';

@Component({
  selector: 'app-about-page',
  imports: [PageBanner, AboutSection],
  template: `
    <app-page-banner title="About" />
    <section class="section-padding40" aria-labelledby="roles-title">
      <div class="container">
        <div class="section-tittle text-center mb-55">
          <h2 id="roles-title">One platform, four roles</h2>
        </div>
        <ul class="row list-unstyled">
          @for (item of roles; track item.id) {
            <li class="col-lg-3 col-md-6">
              <div class="single-services mb-30">
                <div class="features-caption">
                  <h3>{{ item.title }}</h3>
                  <p>{{ item.text }}</p>
                </div>
              </div>
            </li>
          }
        </ul>
      </div>
    </section>
    <app-about-section />
  `,
})
export class AboutPage {
  protected readonly roles = ABOUT_ROLES;
}
