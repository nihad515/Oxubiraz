'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Trophy, Flame, TrendingUp, X, CheckCheck } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useString } from '@/hooks/use-string';
import apiClient from '@/lib/api/client';
import { API } from '@/lib/api/endpoints';
import type { ApiResponse } from '@/types/api';
import { formatRelativeTime } from '@/lib/utils/format';

interface Notification {
  id: string;
  type: string;
  data: Record<string, any>;
  read_at: string | null;
  created_at: string;
}

const notificationIcons: Record<string, React.ReactNode> = {
  achievement_earned: <Trophy size={16} className="text-yellow-500" />,
  streak_milestone: <Flame size={16} className="text-orange-500" />,
  level_up: <TrendingUp size={16} className="text-primary" />,
};

interface Props {
  unreadCount: number;
}

export function NotificationCenter({ unreadCount }: Props) {
  const { t } = useString();
  const qc = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);

  const { data: notifications } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => apiClient.get<ApiResponse<Notification[]>>(API.notifications.list + '?per_page=20'),
    select: (d) => d.data,
    enabled: isOpen,
  });

  const markRead = useMutation({
    mutationFn: (id: string) => apiClient.post(`${API.notifications.list}/${id}/read`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications', 'unread'] }),
  });

  const markAllRead = useMutation({
    mutationFn: () => apiClient.post(API.notifications.markAllRead),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
      qc.invalidateQueries({ queryKey: ['notifications', 'unread'] });
    },
  });

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={t('nav.notifications', {}, 'Notifications')}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full z-50 mt-2 w-80 rounded-xl border bg-background shadow-xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b px-4 py-3">
                <h3 className="font-semibold text-sm">{t('nav.notifications', {}, 'Notifications')}</h3>
                <div className="flex items-center gap-1">
                  {unreadCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => markAllRead.mutate()}
                      loading={markAllRead.isPending}
                    >
                      <CheckCheck size={12} />
                      {t('notifications.mark_all_read', {}, 'Mark all read')}
                    </Button>
                  )}
                  <Button variant="ghost" size="icon-sm" onClick={() => setIsOpen(false)}>
                    <X size={14} />
                  </Button>
                </div>
              </div>

              {/* List */}
              <div className="max-h-80 overflow-y-auto">
                {!notifications?.length ? (
                  <div className="py-8 text-center text-sm text-muted-foreground">
                    <Bell size={24} className="mx-auto mb-2 opacity-20" />
                    <p>{t('notifications.empty', {}, 'No notifications yet')}</p>
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`flex gap-3 border-b px-4 py-3 last:border-0 transition-colors ${
                        !notification.read_at ? 'bg-primary/5' : ''
                      }`}
                    >
                      <div className="mt-0.5 shrink-0">
                        {notificationIcons[notification.data.type] ?? <Bell size={16} className="text-muted-foreground" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{notification.data.name ?? t(`notifications.${notification.data.type}`, {}, notification.data.type)}</p>
                        {notification.data.description && (
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{notification.data.description}</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">{formatRelativeTime(notification.created_at)}</p>
                      </div>
                      {!notification.read_at && (
                        <button
                          className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary"
                          onClick={() => markRead.mutate(notification.id)}
                          title={t('notifications.mark_read', {}, 'Mark as read')}
                        />
                      )}
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
