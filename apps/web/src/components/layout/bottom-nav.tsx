'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Zap, Star, BarChart3, User } from 'lucide-react';

import { usePermission } from '@/hooks/use-permission';
import { useString } from '@/hooks/use-string';
import { ROUTES } from '@/config/routes';
import { cn } from '@/lib/utils/cn';

export function BottomNav() {
  const pathname = usePathname();
  const { isStudent, isTeacher, isAdmin, isParent } = usePermission();
  const { t } = useString();

  const items = isStudent
    ? [
        { href: ROUTES.student.root, icon: Home, label: t('nav.dashboard') },
        { href: ROUTES.student.play, icon: Zap, label: t('nav.play') },
        { href: ROUTES.student.achievements, icon: Star, label: t('nav.achievements') },
        { href: ROUTES.student.history, icon: BarChart3, label: t('nav.history') },
        { href: ROUTES.profile, icon: User, label: t('nav.profile', {}, 'Profile') },
      ]
    : isTeacher
    ? [
        { href: ROUTES.teacher.root, icon: Home, label: t('nav.dashboard') },
        { href: ROUTES.teacher.students, icon: User, label: t('nav.students') },
        { href: ROUTES.teacher.analytics, icon: BarChart3, label: t('nav.analytics') },
        { href: ROUTES.profile, icon: User, label: t('nav.profile', {}, 'Profile') },
      ]
    : isParent
    ? [
        { href: ROUTES.parent.root, icon: Home, label: t('nav.dashboard') },
        { href: ROUTES.parent.children, icon: Star, label: t('nav.children') },
        { href: ROUTES.parent.progress, icon: BarChart3, label: t('nav.progress') },
        { href: ROUTES.profile, icon: User, label: t('nav.profile', {}, 'Profile') },
      ]
    : [
        { href: ROUTES.admin.root, icon: Home, label: t('nav.dashboard') },
        { href: ROUTES.admin.users, icon: User, label: t('nav.users') },
        { href: ROUTES.admin.analytics, icon: BarChart3, label: t('nav.analytics') },
        { href: ROUTES.profile, icon: User, label: t('nav.profile', {}, 'Profile') },
      ];

  return (
    <nav className="bottom-nav">
      <div className="flex items-center justify-around px-2 py-2">
        {items.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center gap-1 rounded-xl px-3 py-2 transition-colors',
                'touch-target touch-manipulation min-w-[60px]',
                active
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground',
              )}
              aria-current={active ? 'page' : undefined}
            >
              <Icon
                size={22}
                className={cn('transition-transform', active && 'scale-110')}
              />
              <span className="text-[10px] font-medium leading-none">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
