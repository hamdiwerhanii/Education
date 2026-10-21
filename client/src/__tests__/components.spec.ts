import { Type } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { LoginPage } from '../app/modules/auth/components/login-page/login-page';
import { SignUpPage } from '../app/modules/auth/components/sign-up-page/sign-up-page';
import { Header } from '../app/shared/components/header/header';
import { baseProviders, demoUser, fakeAuthStore } from './test-helpers';

async function render<T>(component: Type<T>, auth = fakeAuthStore(), inputs: Record<string, unknown> = {}) {
  TestBed.configureTestingModule({ imports: [component], providers: baseProviders(auth) });
  const fixture: ComponentFixture<T> = TestBed.createComponent(component);
  for (const [name, value] of Object.entries(inputs)) fixture.componentRef.setInput(name, value);
  await fixture.whenStable();
  return { fixture, el: fixture.nativeElement as HTMLElement, auth };
}

const click = async (fixture: ComponentFixture<unknown>, element: Element | null) => {
  (element as HTMLElement).click();
  await fixture.whenStable();
};

const type = (input: Element | null, value: string) => {
  const field = input as HTMLInputElement;
  field.value = value;
  field.dispatchEvent(new Event('input'));
};

describe('Header', () => {
  it('shows sign-up and log-in links to visitors', async () => {
    const { el } = await render(Header);
    expect(el.querySelector('#navigation')?.textContent).toContain('Log in');
    expect(el.querySelector('#navigation')?.textContent).not.toContain('Dashboard');
  });

  it('shows the dashboard link and log-out button to logged-in users', async () => {
    const { el } = await render(Header, fakeAuthStore(demoUser('teacher')));
    expect(el.querySelector('#navigation a[href="/dashboard/teacher"]')).not.toBeNull();
    expect(el.querySelector('#navigation')?.textContent).toContain('(Teacher)');
  });

  it('opens and closes the mobile menu', async () => {
    const { fixture, el } = await render(Header);
    const toggle = el.querySelector('.mobile-toggle');

    await click(fixture, toggle);
    expect(toggle?.getAttribute('aria-expanded')).toBe('true');
    expect(document.body.style.overflow).toBe('hidden');

    await click(fixture, toggle);
    expect(toggle?.getAttribute('aria-expanded')).toBe('false');
  });
});

describe('LoginPage', () => {
  it('validates the form before calling the API', async () => {
    const { fixture, el, auth } = await render(LoginPage);
    await click(fixture, el.querySelector('button[type="submit"]'));

    expect(el.querySelector('#login-telephone-error')?.textContent).toContain('required');
    expect(auth.login).not.toHaveBeenCalled();
  });

  it('logs in and opens the dashboard of the user role', async () => {
    const auth = fakeAuthStore(demoUser('parent'));
    const { fixture, el } = await render(LoginPage, auth);
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);

    type(el.querySelector('#login-telephone'), '40000001');
    type(el.querySelector('#login-password'), 'Demo@1234');
    await click(fixture, el.querySelector('button[type="submit"]'));

    expect(auth.login).toHaveBeenCalledWith('40000001', 'Demo@1234');
    expect(navigate).toHaveBeenCalledWith('/dashboard/parent');
  });

  it('only follows safe return URLs', async () => {
    const auth = fakeAuthStore(demoUser('student'));
    const { fixture, el } = await render(LoginPage, auth, { returnUrl: '//evil.example.com' });
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);

    type(el.querySelector('#login-telephone'), '30000002');
    type(el.querySelector('#login-password'), 'Demo@1234');
    await click(fixture, el.querySelector('button[type="submit"]'));

    expect(navigate).toHaveBeenCalledWith('/dashboard/student');
  });
});

describe('SignUpPage', () => {
  it('asks teachers for a speciality and a CV', async () => {
    const { el } = await render(SignUpPage, fakeAuthStore(), { role: 'teacher' });
    expect(el.querySelector('#su-speciality')).not.toBeNull();
    expect(el.querySelector('#su-cv')).not.toBeNull();
    expect(el.querySelector('[formArrayName="childTelephones"]')).toBeNull();
  });

  it('asks parents for their children telephones', async () => {
    const { fixture, el } = await render(SignUpPage, fakeAuthStore(), { role: 'parent' });
    expect(el.querySelectorAll('[id^="su-child-"]').length).toBe(1);

    await click(fixture, el.querySelector('.mt-10'));
    expect(el.querySelectorAll('input[id^="su-child-"]').length).toBe(2);
  });

  it('never offers an admin account', async () => {
    const { el } = await render(SignUpPage, fakeAuthStore(), { role: 'admin' });
    expect(el.querySelector('.role-tab--active')?.textContent).toContain('Student');
    expect(el.textContent).not.toContain('Admin');
  });

  it('sends the chosen role with the form data', async () => {
    const auth = fakeAuthStore();
    const { fixture, el } = await render(SignUpPage, auth, { role: 'student' });
    vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);

    type(el.querySelector('#su-first'), 'Omar');
    type(el.querySelector('#su-last'), 'Kefi');
    type(el.querySelector('#su-email'), 'omar@example.com');
    type(el.querySelector('#su-phone'), '30000009');
    type(el.querySelector('#su-password'), 'Str0ng@Pass');
    type(el.querySelector('#su-confirm'), 'Str0ng@Pass');
    await click(fixture, el.querySelector('button[type="submit"]'));

    const [data] = auth.signUp.mock.calls[0];
    expect(data.get('role')).toBe('student');
    expect(data.get('telephone')).toBe('30000009');
    expect(data.has('confirmPassword')).toBe(false);
  });
});
