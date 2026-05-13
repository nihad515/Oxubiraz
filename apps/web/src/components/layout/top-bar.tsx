'use client';

import { Bell, Menu, User, LogOut, Settings, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LocaleSwitcher } from '@/components/shared/locale-switcher';
import { useAuthStore } from '@/store/auth-store';
import { useUiStore } from '@/store/ui-store';
import { useAuth } from '@/hooks/use-auth';
import { useString } from '@/hooks/use-string';
import apiClient from '@/lib/api/client';
import { API } from '@/lib/api/endpoints';
import type { ApiResponse } from '@/types/api';
import { ROUTES } from '@/config/routes';

export function TopBar() {
  const { user } = useAuthStore();
  const { toggleMobileMenu } = useUiStore();
  const { logout, isLoggingOut } = useAuth();
  const { t } = useString();

  const { data: unreadCount } = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: () => apiClient.get<ApiResponse<{ count: number }>>(API.notifications.unreadCount),
    select: (d) => d.data.count,
    refetchInterval: 30000,
  });

  return (
    <header className="flex h-16 items-center justify-between border-b bg-card px-4 lg:px-6">
      {/* Mobile menu toggle */}
      <Button
        variant="ghost"
        size="icon-sm"
        className="lg:hidden"
        onClick={toggleMobileMenu}
        aria-label="Toggle menu"
      >
        <Menu size={20} />
      </Button>

      {/* Desktop: breadcrumb placeholder */}
      <div className="hidden lg:block" />

      {/* Right side actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        <LocaleSwitcher />

        {/* Notifications */}
        <Link href={ROUTES.profile} className="relative">
          <Button variant="ghost" size="icon" aria-label="Notifications">
            <Bell size={20} />
            {!!unreadCount && unreadCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Button>
        </Link>

        {/* User menu */}
        <div className="relative group">
          <button
            type="button"
            className="flex items-center gap-2 rounded-lg p-1.5 hover:bg-accent transition-colors touch-manipulation"
            aria-label="User menu"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-brand-700 text-sm font-bold">
              {user?.first_name?.[0]?.toUpperCase() ?? 'U'}
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-sm font-medium leading-none">{user?.first_name}</div>
              <div className="text-xs text-muted-foreground leading-none mt-0.5">
                {user?.roles[0]?.name ?? 'user'}
              </div>
            </div>
            <ChevronDown size={14} className="text-muted-foreground hidden sm:block" />
          </button>

          {/* Dropdown */}
          <div className="absolute right-0 top-full z-50 mt-1 hidden w-48 rounded-xl border bg-popover p-1 shadow-lg group-focus-within:block group-hover:block">
            <Link
              href={ROUTES.profile}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-accent"
            >
              <User size={16} />
              {t('nav.profile', {}, 'Profile')}
            </Link>
            <Link
              href={ROUTES.settings}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-accent"
            >
              <Settings size={16} />
              {t('nav.settings', {}, 'Settings')}
            </Link>
            <div className="my-1 border-t" />
            <button
              type="button"
              onClick={() => logout()}
              disabled={isLoggingOut}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-destructive hover:bg-destructive/10 disabled:opacity-50"
            >
              <LogOut size={16} />
              {t('auth.logout')}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
