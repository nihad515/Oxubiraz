'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Users, School, Shield, Languages, FileText, BookOpen,
  BarChart3, Trophy, Bell, Settings, Zap, Home, Star, List,
  GraduationCap, Heart, ChevronLeft, ChevronRight,
} from 'lucide-react';

import { usePermission } from '@/hooks/use-permission';
import { useString } from '@/hooks/use-string';
import { useUiStore } from '@/store/ui-store';
import { ROUTES } from '@/config/routes';
import { PERMISSIONS } from '@/types/permissions';
import { cn } from '@/lib/utils/cn';
import { Badge } from '@/components/ui/badge';

interface NavItem {
  href: string;
  icon: React.ReactNode;
  labelKey: string;
  permission?: string;
  badge?: string;
  exact?: boolean;
}

function useNavItems(): NavItem[] {
  const { isAdmin, isTeacher, isStudent, isParent } = usePermission();

  if (isAdmin) {
    return [
      { href: ROUTES.admin.root, icon: <LayoutDashboard size={20} />, labelKey: 'nav.dashboard', exact: true },
      { href: ROUTES.admin.users, icon: <Users size={20} />, labelKey: 'nav.users', permission: PERMISSIONS.VIEW_USERS },
      { href: ROUTES.admin.schools, icon: <School size={20} />, labelKey: 'nav.schools', permission: PERMISSIONS.VIEW_SCHOOLS },
      { href: ROUTES.admin.roles, icon: <Shield size={20} />, labelKey: 'nav.roles', permission: PERMISSIONS.MANAGE_ROLES },
      { href: ROUTES.admin.strings, icon: <Languages size={20} />, labelKey: 'nav.strings', permission: PERMISSIONS.MANAGE_STRINGS },
      { href: ROUTES.admin.texts, icon: <FileText size={20} />, labelKey: 'nav.texts', permission: PERMISSIONS.MANAGE_TEXTS },
      { href: ROUTES.admin.words, icon: <BookOpen size={20} />, labelKey: 'nav.words', permission: PERMISSIONS.MANAGE_WORDS },
      { href: ROUTES.admin.competitions, icon: <Trophy size={20} />, labelKey: 'nav.competitions', permission: PERMISSIONS.MANAGE_COMPETITIONS },
      { href: ROUTES.admin.analytics, icon: <BarChart3 size={20} />, labelKey: 'nav.analytics', permission: PERMISSIONS.VIEW_STATISTICS },
      { href: ROUTES.admin.notifications, icon: <Bell size={20} />, labelKey: 'nav.notifications' },
      { href: ROUTES.admin.settings, icon: <Settings size={20} />, labelKey: 'nav.settings', permission: PERMISSIONS.MANAGE_SETTINGS },
    ];
  }

  if (isTeacher) {
    return [
      { href: ROUTES.teacher.root, icon: <LayoutDashboard size={20} />, labelKey: 'nav.dashboard', exact: true },
      { href: ROUTES.teacher.students, icon: <GraduationCap size={20} />, labelKey: 'nav.students' },
      { href: ROUTES.teacher.competitions, icon: <Trophy size={20} />, labelKey: 'nav.competitions' },
      { href: ROUTES.teacher.analytics, icon: <BarChart3 size={20} />, labelKey: 'nav.analytics' },
      { href: ROUTES.teacher.notifications, icon: <Bell size={20} />, labelKey: 'nav.notifications' },
    ];
  }

  if (isStudent) {
    return [
      { href: ROUTES.student.root, icon: <Home size={20} />, labelKey: 'nav.dashboard', exact: true },
      { href: ROUTES.student.play, icon: <Zap size={20} />, labelKey: 'nav.play' },
      { href: ROUTES.student.achievements, icon: <Star size={20} />, labelKey: 'nav.achievements' },
      { href: ROUTES.student.leaderboard, icon: <List size={20} />, labelKey: 'nav.leaderboard' },
      { href: ROUTES.student.history, icon: <BarChart3 size={20} />, labelKey: 'nav.history' },
    ];
  }

  if (isParent) {
    return [
      { href: ROUTES.parent.root, icon: <Home size={20} />, labelKey: 'nav.dashboard', exact: true },
      { href: ROUTES.parent.children, icon: <Heart size={20} />, labelKey: 'nav.children' },
      { href: ROUTES.parent.progress, icon: <BarChart3 size={20} />, labelKey: 'nav.progress' },
      { href: ROUTES.parent.notifications, icon: <Bell size={20} />, labelKey: 'nav.notifications' },
    ];
  }

  return [];
}

export function Sidebar() {
  const { t } = useString();
  const pathname = usePathname();
  const { sidebarCollapsed, setSidebarCollapsed } = useUiStore();
  const { can } = usePermission();
  const navItems = useNavItems();

  const isActive = (item: NavItem) => {
    if (item.exact) return pathname === item.href;
    return pathname.startsWith(item.href);
  };

  const visibleItems = navItems.filter(
    (item) => !item.permission || can(item.permission),
  );

  return (
    <aside
      className={cn(
        'flex h-full flex-col border-r bg-card transition-all duration-300',
        sidebarCollapsed ? 'w-[60px]' : 'w-[240px]',
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center border-b px-4">
        {!sidebarCollapsed && (
          <Link href="/dashboard" className="flex items-center gap-2 font-black text-brand-600">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-brand-600 text-white text-sm font-black">
              O
            </div>
            <span className="gradient-text text-lg">Oxubiraz</span>
          </Link>
        )}
        {sidebarCollapsed && (
          <Link href="/dashboard" className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white text-sm font-black">
            O
          </Link>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-2">
          {visibleItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150',
                  'touch-manipulation min-h-[44px]',
                  isActive(item)
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                )}
                title={sidebarCollapsed ? t(item.labelKey) : undefined}
              >
                <span className="flex-shrink-0">{item.icon}</span>
                {!sidebarCollapsed && (
                  <>
                    <span className="flex-1 truncate">{t(item.labelKey)}</span>
                    {item.badge && (
                      <Badge variant="secondary" className="ml-auto text-xs">
                        {item.badge}
                      </Badge>
                    )}
                  </>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Collapse toggle */}
      <div className="border-t p-2">
        <button
          type="button"
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="flex w-full items-center justify-center rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-foreground"
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {sidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>
    </aside>
  );
}
