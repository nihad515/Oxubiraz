'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, BellOff, Check, CheckCheck, Trash2, Trophy, Zap, Flame, Info } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useString } from '@/hooks/use-string';
import { PushToggle } from '@/components/notifications/push-permission-prompt';
import apiClient from '@/lib/api/client';
import { API } from '@/lib/api/endpoints';
import { cn } from '@/lib/utils/cn';

interface Notification {
  id: string;
  type: string;
  data: Record<string, any>;
  read_at: string | null;
  created_at: string;
}

const TYPE_ICONS: Record<string, React.ReactNode> = {
  achievement_earned: <Trophy size={16} className="text-yellow-500" />,
  level_up: <Zap size={16} className="text-purple-500" />,
  streak_milestone: <Flame size={16} className="text-orange-500" />,
};

const TYPE_COLORS: Record<string, string> = {
  achievement_earned: 'border-l-yellow-400',
  level_up: 'border-l-purple-400',
  streak_milestone: 'border-l-orange-400',
};

function notificationTitle(n: Notification): string {
  const { type, data } = n;
  if (type === 'achievement_earned') return `🏆 ${data.name ?? 'Achievement earned'}`;
  if (type === 'level_up') return `⚡ Level ${data.new_level ?? ''}`;
  if (type === 'streak_milestone') return `🔥 ${data.days ?? ''} day streak!`;
  return data.title ?? type;
}

function notificationBody(n: Notification): string {
  const { type, data } = n;
  if (type === 'achievement_earned') return data.description ?? `+${data.xp_reward ?? 0} XP`;
  if (type === 'level_up') return `Total XP: ${data.xp ?? 0}`;
  if (type === 'streak_milestone') return `+${data.xp_bonus ?? 0} bonus XP`;
  return data.body ?? '';
}

export default function NotificationsPage() {
  const { t } = useString();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['notifications', page],
    queryFn: () => apiClient.get(`${API.notifications.list}?page=${page}&per_page=20`),
    select: (d: any) => d,
  });

  const notifications: Notification[] = data?.data ?? [];
  const meta = data?.meta ?? {};
  const unreadCount = meta.unread_count ?? 0;

  const markReadMutation = useMutation({
    mutationFn: (id: string) => apiClient.post(API.notifications.markRead(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => apiClient.post(API.notifications.markAllRead),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
      toast.success(t('notifications.all_read', {}, 'All notifications marked as read'));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(API.notifications.delete(id)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const deleteAllMutation = useMutation({
    mutationFn: () => apiClient.delete(API.notifications.list),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success(t('notifications.all_deleted', {}, 'All notifications deleted'));
    },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Bell size={24} />
            {t('nav.notifications', {}, 'Notifications')}
            {unreadCount > 0 && (
              <Badge className="text-xs">{unreadCount}</Badge>
            )}
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {t('notifications.desc', {}, 'Your activity and achievement updates')}
          </p>
        </div>

        <div className="flex gap-2 flex-wrap">
          <PushToggle />
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => markAllReadMutation.mutate()}
              disabled={markAllReadMutation.isPending}
            >
              <CheckCheck size={14} className="mr-1.5" />
              {t('notifications.mark_all_read', {}, 'Mark all read')}
            </Button>
          )}
          {notifications.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                  <Trash2 size={14} className="mr-1.5" />
                  {t('common.clear_all', {}, 'Clear all')}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t('notifications.clear_all_title', {}, 'Clear all notifications?')}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {t('notifications.clear_all_desc', {}, 'This will permanently delete all your notifications.')}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t('common.cancel', {}, 'Cancel')}</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={() => deleteAllMutation.mutate()}
                  >
                    {t('common.delete', {}, 'Delete')}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <Card>
          <CardContent className="py-20 text-center">
            <BellOff size={40} className="mx-auto mb-3 text-muted-foreground/30" />
            <p className="font-medium text-muted-foreground">{t('notifications.empty', {}, 'No notifications yet')}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {t('notifications.empty_desc', {}, 'Achievements and milestones will appear here.')}
            </p>
          </CardContent>
        </Card>
      ) : (
        <AnimatePresence mode="popLayout">
          <div className="space-y-2">
            {notifications.map((n, i) => (
              <motion.div
                key={n.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: i * 0.03 }}
              >
                <Card
                  className={cn(
                    'border-l-4 transition-colors',
                    TYPE_COLORS[n.data?.type ?? n.type] ?? 'border-l-muted',
                    !n.read_at && 'bg-primary/5',
                  )}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 shrink-0">
                        {TYPE_ICONS[n.data?.type ?? n.type] ?? <Info size={16} className="text-muted-foreground" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 flex-wrap">
                          <p className={cn('text-sm font-semibold', !n.read_at && 'text-foreground')}>
                            {notificationTitle(n)}
                          </p>
                          <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
                            {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                          </span>
                        </div>
                        {notificationBody(n) && (
                          <p className="text-sm text-muted-foreground mt-0.5">{notificationBody(n)}</p>
                        )}
                      </div>
                      <div className="flex gap-1 shrink-0">
                        {!n.read_at && (
                          <button
                            className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                            onClick={() => markReadMutation.mutate(n.id)}
                            title={t('notifications.mark_read', {}, 'Mark as read')}
                          >
                            <Check size={14} />
                          </button>
                        )}
                        <button
                          className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-destructive"
                          onClick={() => deleteMutation.mutate(n.id)}
                          title={t('common.delete', {}, 'Delete')}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      )}

      {/* Pagination */}
      {meta.last_page > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage(p => p - 1)}
          >
            {t('common.prev', {}, 'Previous')}
          </Button>
          <span className="text-sm text-muted-foreground">
            {page} / {meta.last_page}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= meta.last_page}
            onClick={() => setPage(p => p + 1)}
          >
            {t('common.next', {}, 'Next')}
          </Button>
        </div>
      )}
    </div>
  );
}
