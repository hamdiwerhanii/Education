import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PageBanner } from '../../../../shared/components/page-banner/page-banner';

@Component({
  selector: 'app-not-found-page',
  imports: [RouterLink, PageBanner],
  template: `
    <app-page-banner title="Page not found" />
    <section class="site-section text-center">
      <div class="container">
        <p class="not-found__code" aria-hidden="true">404</p>
        <h2 class="not-found__title">This page doesn't exist</h2>
        <p>The link may be broken, or the page may have been removed.</p>
        <a routerLink="/" class="btn mt-20">Back to home</a>
      </div>
    </section>
  `,
  styles: `
    .not-found__code {
      font-size: 96px;
      font-weight: 800;
      line-height: 1;
      background: linear-gradient(to bottom, #c054ff, #5274ff);
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
    }
    .not-found__title {
      margin: 16px 0 10px;
      font-size: 32px;
    }
  `,
})
export class NotFoundPage {}
