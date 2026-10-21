import { Component, computed, DOCUMENT, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter } from 'rxjs';
import { MAIN_NAV } from '../../constants/nav';
import { ROLE_LABEL } from '../../constants/roles';
import { AuthStore } from '../../services/auth.store';

const STICKY_OFFSET_PX = 400;
const LG_BREAKPOINT_PX = 992;

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header.html',
  styleUrl: './header.css',
  host: {
    '(window:scroll)': 'onScroll()',
    '(window:resize)': 'onResize()',
    '(document:keydown.escape)': 'isMenuOpen.set(false)',
  },
})
export class Header {
  private readonly router = inject(Router);
  private readonly document = inject(DOCUMENT);
  protected readonly auth = inject(AuthStore);

  protected readonly nav = MAIN_NAV;
  protected readonly isSticky = signal(false);
  protected readonly isMenuOpen = signal(false);
  protected readonly roleLabel = computed(() => {
    const role = this.auth.role();
    return role ? ROLE_LABEL[role] : '';
  });

  private readonly navigation = toSignal(this.router.events.pipe(filter((event) => event instanceof NavigationEnd)));

  constructor() {
    effect(() => {
      this.navigation();
      this.isMenuOpen.set(false);
    });
    effect(() => {
      this.document.body.style.overflow = this.isMenuOpen() ? 'hidden' : '';
    });
  }

  protected onScroll(): void {
    this.isSticky.set(window.scrollY >= STICKY_OFFSET_PX);
  }

  protected onResize(): void {
    if (window.innerWidth >= LG_BREAKPOINT_PX) this.isMenuOpen.set(false);
  }

  protected toggleMenu(): void {
    this.isMenuOpen.update((open) => !open);
  }

  protected async logout(): Promise<void> {
    await this.auth.logout();
    await this.router.navigateByUrl('/');
  }
}
