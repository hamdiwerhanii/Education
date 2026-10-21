import { Component, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NavItem } from '../../constants/nav';
import { PageBanner } from '../page-banner/page-banner';

@Component({
  selector: 'app-dashboard-shell',
  imports: [PageBanner, RouterLink, RouterLinkActive],
  template: `
    <app-page-banner [title]="title()" [subtitle]="subtitle()" />
    <div class="dashboard container">
      <aside class="dashboard__sidebar" aria-label="Dashboard">
        <p class="dashboard__brand">Dashboard</p>
        <ul>
          @for (item of nav(); track item.path) {
            <li>
              <a [routerLink]="item.path" routerLinkActive="dashboard__link--active" [routerLinkActiveOptions]="{ exact: true }">
                {{ item.label }}
              </a>
            </li>
          }
        </ul>
      </aside>
      <section class="dashboard__content">
        <ng-content />
      </section>
    </div>
  `,
  styles: `
    .dashboard {
      display: flex;
      gap: 30px;
      padding-top: 60px;
      padding-bottom: 100px;
      align-items: flex-start;
    }
    .dashboard__sidebar {
      flex: 0 0 240px;
      border-radius: 10px;
      padding: 28px 20px;
      background: linear-gradient(to top, #a376ff 1%, #ea68ff 98%, #ec7dfe 100%);
      color: #fff;
      position: sticky;
      top: 120px;
    }
    .dashboard__brand {
      color: #fff;
      font-size: 20px;
      font-weight: 700;
      margin-bottom: 16px;
    }
    .dashboard__sidebar ul {
      list-style: none;
      margin: 0;
      padding: 0;
    }
    .dashboard__sidebar a {
      display: block;
      padding: 10px 14px;
      border-radius: 6px;
      color: #fff;
      font-weight: 600;
    }
    .dashboard__sidebar a:hover,
    .dashboard__link--active {
      background: rgba(255, 255, 255, 0.2);
    }
    .dashboard__content {
      flex: 1;
      min-width: 0;
    }
    @media (max-width: 991px) {
      .dashboard {
        flex-direction: column;
        align-items: stretch;
      }
      .dashboard__sidebar {
        position: static;
        flex-basis: auto;
        width: 100%;
      }
    }
  `,
})
export class DashboardShell {
  readonly title = input.required<string>();
  readonly subtitle = input('');
  readonly nav = input<NavItem[]>([]);
}
