import type { MenuItem } from '@/components/menus/left-menu-panel';
import type { QuickActionItem } from '@/components/menus/quick-actions-menu';

export type UserRole = 'company' | 'teacher' | 'student';

const sharedMenuItems: MenuItem[] = [
  { label: 'Dashboard', route: '/dashboard', icon: 'rectangle.grid.2x2.fill' },
  { label: 'Coaching', route: '/coaching', icon: 'person.fill.checkmark' },
  { label: 'Curriculum', route: '/curriculum', icon: 'book.fill' },
  { label: 'Library', route: '/library', icon: 'books.vertical.fill' },
  { label: 'Simpedia', route: '/simpedia', icon: 'sparkles' },
  { label: 'Store', route: '/store', icon: 'bag.fill' },
];

export const teacherMenuItems: MenuItem[] = [
  ...sharedMenuItems.slice(0, 1),
  { label: 'Students', route: '/students', icon: 'person.2.fill' },
  { label: 'Schedule', route: '/schedule', icon: 'calendar' },
  { label: 'Current Lesson', route: '/current-lesson', icon: 'graduationcap.fill' },
  { label: 'Library', route: '/library', icon: 'books.vertical.fill' },
  { label: 'Simpedia', route: '/simpedia', icon: 'sparkles' },
  { label: 'Communications', route: '/communications', icon: 'bubble.left.and.bubble.right.fill' },
  { label: 'Messages', route: '/messages', icon: 'envelope.fill' },
];

export const studentMenuItems: MenuItem[] = [
  ...sharedMenuItems.slice(0, 1),
  { label: 'Current Lesson', route: '/current-lesson', icon: 'graduationcap.fill' },
  { label: 'Practice Hub', route: '/practice-hub', icon: 'figure.run' },
  { label: 'Library', route: '/library', icon: 'books.vertical.fill' },
  { label: 'Simpedia', route: '/simpedia', icon: 'sparkles' },
  { label: 'Communications', route: '/communications', icon: 'bubble.left.and.bubble.right.fill' },
  { label: 'Messages', route: '/messages', icon: 'envelope.fill' },
];

export const companyMenuItems: MenuItem[] = [
  { label: 'Dashboard', route: '/dashboard', icon: 'rectangle.grid.2x2.fill' },
  { label: 'Subscriptions', route: '/subscriptions', icon: 'creditcard.fill' },
  { label: 'Accounts', route: '/accounts', icon: 'person.2.fill' },
  { label: 'Library', route: '/library', icon: 'books.vertical.fill' },
  { label: 'Simpedia', route: '/simpedia', icon: 'sparkles' },
  { label: 'Support', route: '/support', icon: 'lifepreserver.fill' },
  { label: 'Messages', route: '/messages', icon: 'envelope.fill' },
];

export const teacherQuickActions: QuickActionItem[] = [
  { label: 'New Lesson', icon: 'plus.rectangle.on.rectangle' },
  { label: 'Add Student', icon: 'person.badge.plus' },
  { label: 'Send Message', icon: 'paperplane.fill' },
];

export const companyQuickActions: QuickActionItem[] = [
  { label: 'Build Lesson', icon: 'plus.rectangle.on.rectangle' },
  { label: 'Add Teacher', icon: 'person.badge.plus' },
  { label: 'Send Message', icon: 'paperplane.fill' },
];

export const getRoleFromUser = (user?: string): UserRole => {
  const normalized = user?.toLowerCase();
  if (normalized === 'neil' || normalized === 'admin') return 'company';
  if (normalized === 'brian') return 'teacher';
  if (normalized === 'quinn') return 'student';
  return 'teacher';
};

export const getMenusForRole = (role: UserRole) => {
  switch (role) {
    case 'teacher':
      return { menu: teacherMenuItems, quick: teacherQuickActions };
    case 'student':
      return { menu: studentMenuItems, quick: teacherQuickActions };
    case 'company':
      return { menu: companyMenuItems, quick: companyQuickActions };
    default:
      return { menu: teacherMenuItems, quick: teacherQuickActions };
  }
};
