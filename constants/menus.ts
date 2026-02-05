import type { MenuItem } from '@/components/menus/left-menu-panel';
import type { QuickActionItem } from '@/components/menus/quick-actions-menu';

export type UserRole = 'company' | 'teacher' | 'student';

export const teacherMenuItems: MenuItem[] = [
  { label: 'Dashboard', route: '/dashboard', icon: 'rectangle.grid.2x2.fill' },
  { label: 'Training', route: '/training', icon: 'graduationcap.fill' },
  { label: 'Coaching', route: '/coaching', icon: 'person.fill.checkmark' },
  { label: 'Curriculum', route: '/curriculum', icon: 'book.fill' },
  { label: 'Library', route: '/library', icon: 'books.vertical.fill' },
  { label: 'Simpedia', route: '/simpedia', icon: 'sparkles' },
  { label: 'Store', route: '/store', icon: 'bag.fill' },
];

export const teacherQuickActions: QuickActionItem[] = [
  { label: 'New Lesson', icon: 'plus.rectangle.on.rectangle' },
  { label: 'Add Student', icon: 'person.badge.plus' },
  { label: 'Send Message', icon: 'paperplane.fill' },
];

export const getRoleFromUser = (user?: string): UserRole => {
  const normalized = user?.toLowerCase();
  if (normalized === 'neil') return 'company';
  if (normalized === 'brian') return 'teacher';
  if (normalized === 'quinn') return 'student';
  return 'teacher';
};

export const getMenusForRole = (role: UserRole) => {
  switch (role) {
    case 'teacher':
      return { menu: teacherMenuItems, quick: teacherQuickActions };
    case 'company':
    case 'student':
    default:
      return { menu: teacherMenuItems, quick: teacherQuickActions };
  }
};
