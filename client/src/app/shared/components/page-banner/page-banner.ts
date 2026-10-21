import { Component, input } from '@angular/core';

@Component({
  selector: 'app-page-banner',
  template: `
    <section class="slider-area slider-area2">
      <div class="slider-active">
        <div class="single-slider slider-height2">
          <div class="container">
            <div class="row">
              <div class="col-xl-8 col-lg-11 col-md-12">
                <div class="hero__caption hero__caption2">
                  <h1>{{ title() }}</h1>
                  @if (subtitle()) {
                    <p class="page-banner__subtitle">{{ subtitle() }}</p>
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: `
    .page-banner__subtitle {
      color: #fff;
      font-size: 18px;
      margin-top: 10px;
    }
  `,
})
export class PageBanner {
  readonly title = input.required<string>();
  readonly subtitle = input('');
}
