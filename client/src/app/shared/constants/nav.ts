export interface NavItem {
  label: string;
  path: string;
  exact?: boolean;
}

export const MAIN_NAV: NavItem[] = [
  { label: 'Home', path: '/', exact: true },
  { label: 'Courses', path: '/courses' },
  { label: 'Teachers', path: '/teachers' },
  { label: 'About', path: '/about' },
];
