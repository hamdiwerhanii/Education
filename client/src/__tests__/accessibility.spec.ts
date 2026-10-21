import { Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import axe from 'axe-core';
import { LoginPage } from '../app/modules/auth/components/login-page/login-page';
import { SignUpPage } from '../app/modules/auth/components/sign-up-page/sign-up-page';
import { NotFoundPage } from '../app/modules/not-found/components/not-found-page/not-found-page';
import { Footer } from '../app/shared/components/footer/footer';
import { Header } from '../app/shared/components/header/header';
import { baseProviders, demoUser, fakeAuthStore } from './test-helpers';

const AXE_OPTIONS: axe.RunOptions = {
  runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] },
  rules: { 'color-contrast': { enabled: false }, region: { enabled: false } },
};

async function violations(component: Type<unknown>, inputs: Record<string, unknown> = {}, auth = fakeAuthStore()) {
  TestBed.configureTestingModule({ imports: [component], providers: baseProviders(auth) });
  const fixture = TestBed.createComponent(component);
  for (const [name, value] of Object.entries(inputs)) fixture.componentRef.setInput(name, value);
  await fixture.whenStable();
  const results = await axe.run(fixture.nativeElement as HTMLElement, AXE_OPTIONS);
  return results.violations.map((v) => `${v.id}: ${v.help}`);
}

describe('accessibility (axe-core)', () => {
  it('header for visitors', async () => expect(await violations(Header)).toEqual([]));
  it('header for logged-in users', async () => expect(await violations(Header, {}, fakeAuthStore(demoUser('admin')))).toEqual([]));
  it('footer', async () => expect(await violations(Footer)).toEqual([]));
  it('login page', async () => expect(await violations(LoginPage)).toEqual([]));
  it('student sign-up', async () => expect(await violations(SignUpPage, { role: 'student' })).toEqual([]));
  it('teacher sign-up', async () => expect(await violations(SignUpPage, { role: 'teacher' })).toEqual([]));
  it('parent sign-up', async () => expect(await violations(SignUpPage, { role: 'parent' })).toEqual([]));
  it('404 page', async () => expect(await violations(NotFoundPage)).toEqual([]));
});
