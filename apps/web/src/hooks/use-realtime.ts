'use client';

import { useEffect, useRef } from 'react';
import Pusher from 'pusher-js';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth-store';
import { toast } from 'sonner';

let pusherInstance: Pusher | null = null;

function getPusher(): Pusher | null {
  const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
  const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;
  const host = process.env.NEXT_PUBLIC_PUSHER_HOST;
  const port = process.env.NEXT_PUBLIC_PUSHER_PORT;

  if (!key) return null;

  if (!pusherInstance) {
    pusherInstance = new Pusher(key, {
      cluster: cluster ?? 'eu',
      wsHost: host,
      wsPort: port ? Number(port) : undefined,
      forceTLS: !host, // local Soketi uses plain WS
      authEndpoint: `${process.env.NEXT_PUBLIC_API_URL}/api/v1/broadcasting/auth`,
      auth: {
        headers: {
          Authorization: `Bearer ${useAuthStore.getState().token}`,
        },
      },
    });
  }

  return pusherInstance;
}

export function useRealtimeNotifications() {
  const queryClient = useQueryClient();
  const user = useAuthStore(s => s.user);
  const channelRef = useRef<ReturnType<Pusher['subscribe']> | null>(null);

  useEffect(() => {
    if (!user?.id) return;

    const pusher = getPusher();
    if (!pusher) return;

    const channelName = `private-user.${user.id}`;
    const channel = pusher.subscribe(channelName);
    channelRef.current = channel;

    channel.bind('notification.created', (payload: {
      id: string;
      type: string;
      data: Record<string, any>;
    }) => {
      // Invalidate notification queries so the bell updates
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });

      // Show a toast for high-priority events
      const { type, data } = payload;
      if (type === 'achievement_earned') {
        toast.success(`🏆 ${data.name}`, { description: data.description ?? undefined });
      } else if (type === 'level_up') {
        toast.success(`⚡ Level ${data.new_level}!`, { description: `+${data.xp} XP total` });
      } else if (type === 'streak_milestone') {
        toast(`🔥 ${data.days} day streak!`, { description: `+${data.xp_bonus} bonus XP` });
      }
    });

    return () => {
      channel.unbind_all();
      pusher.unsubscribe(channelName);
      channelRef.current = null;
    };
  }, [user?.id, queryClient]);
}

export function useRealtimeLeaderboard(scope: string, onUpdate?: (entries: any[]) => void) {
  const user = useAuthStore(s => s.user);
  const channelRef = useRef<ReturnType<Pusher['subscribe']> | null>(null);

  useEffect(() => {
    if (!user) return;

    const pusher = getPusher();
    if (!pusher) return;

    const channelName = `leaderboard.${scope}`;
    const channel = pusher.subscribe(channelName);
    channelRef.current = channel;

    channel.bind('leaderboard.updated', (payload: { top_entries: any[] }) => {
      onUpdate?.(payload.top_entries);
    });

    return () => {
      channel.unbind_all();
      pusher.unsubscribe(channelName);
      channelRef.current = null;
    };
  }, [scope, user, onUpdate]);
}
