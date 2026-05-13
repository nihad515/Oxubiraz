'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthStore } from '@/store/auth-store';
import { useString } from '@/hooks/use-string';
import apiClient from '@/lib/api/client';
import { API } from '@/lib/api/endpoints';
import type { ApiResponse } from '@/types/api';
import type { LeaderboardEntry } from '@/types/gamification';
import { formatNumber, formatWpm } from '@/lib/utils/format';

type LeaderboardType = 'xp' | 'wpm' | 'sessions';
type LeaderboardPeriod = 'all' | 'week' | 'month';
type LeaderboardScope = 'global' | 'school' | 'class';

export default function LeaderboardPage() {
  const { t } = useString();
  const { user } = useAuthStore();
  const [type, setType] = useState<LeaderboardType>('xp');
  const [period, setPeriod] = useState<LeaderboardPeriod>('all');
  const [scope, setScope] = useState<LeaderboardScope>('global');

  const endpointMap: Record<LeaderboardScope, string> = {
    global: API.leaderboard.global,
    school: API.leaderboard.school,
    class: API.leaderboard.class,
  };

  const { data, isLoading } = useQuery({
    queryKey: ['leaderboard', scope, type, period],
    queryFn: () => {
      const params = scope === 'global' ? `?type=${type}&period=${period}` : '';
      return apiClient.get<ApiResponse<LeaderboardEntry[]>>(endpointMap[scope] + params);
    },
    select: (d) => d.data,
  });

  const rankColors = ['text-yellow-500', 'text-gray-400', 'text-orange-500'];
  const rankBg = ['bg-yellow-50 dark:bg-yellow-950/20', 'bg-gray-50 dark:bg-gray-900/20', 'bg-orange-50 dark:bg-orange-950/20'];

  const typeLabels: Record<LeaderboardType, string> = {
    xp: 'XP',
    wpm: 'WPM',
    sessions: t('analytics.sessions', {}, 'Sessions'),
  };

  const periodLabels: Record<LeaderboardPeriod, string> = {
    all: t('common.all_time', {}, 'All Time'),
    week: t('common.this_week', {}, 'This Week'),
    month: t('common.this_month', {}, 'This Month'),
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Trophy size={24} className="text-yellow-500" />
          {t('nav.leaderboard', {}, 'Leaderboard')}
        </h1>
      </div>

      {/* Scope selector */}
      <div className="flex flex-wrap gap-2">
        {(['global', 'school', 'class'] as LeaderboardScope[]).map((s) => (
          <Button
            key={s}
            variant={scope === s ? 'default' : 'outline'}
            size="sm"
            onClick={() => setScope(s)}
          >
            {t(`leaderboard.${s}`, {}, s)}
          </Button>
        ))}
      </div>

      {scope === 'global' && (
        <div className="flex flex-wrap gap-2">
          {(Object.entries(typeLabels) as [LeaderboardType, string][]).map(([k, label]) => (
            <Button key={k} variant={type === k ? 'default' : 'outline'} size="sm" onClick={() => setType(k)}>
              {label}
            </Button>
          ))}
          <div className="ml-auto flex gap-2">
            {(Object.entries(periodLabels) as [LeaderboardPeriod, string][]).map(([k, label]) => (
              <Button key={k} variant={period === k ? 'secondary' : 'ghost'} size="sm" onClick={() => setPeriod(k)}>
                {label}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Leaderboard list */}
      <div className="space-y-2">
        {isLoading ? (
          Array.from({ length: 10 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)
        ) : !data?.length ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <Trophy size={40} className="mx-auto mb-3 opacity-20" />
              <p>{t('leaderboard.empty', {}, 'No entries yet. Be the first!')}</p>
            </CardContent>
          </Card>
        ) : (
          data.map((entry: any, i) => {
            const isMe = entry.user_id === user?.id;
            const rank = entry.rank ?? i + 1;
            return (
              <motion.div
                key={entry.user_id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <Card className={`${isMe ? 'border-2 border-primary' : ''} ${rank <= 3 ? rankBg[rank - 1] : ''}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-9 w-9 items-center justify-center rounded-full font-bold text-sm ${rank <= 3 ? rankColors[rank - 1] : 'text-muted-foreground'}`}>
                        {rank <= 3 ? ['🥇', '🥈', '🥉'][rank - 1] : rank}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold truncate">{entry.name}</span>
                          {isMe && <Badge variant="secondary" className="text-xs shrink-0">{t('common.you', {}, 'You')}</Badge>}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {t('gamification.level', {}, 'Level')} {entry.level}
                        </div>
                      </div>
                      <div className="text-right">
                        {type === 'xp' && <div className="font-bold text-primary">{formatNumber(entry.xp)} XP</div>}
                        {type === 'wpm' && <div className="font-bold text-blue-500">{formatWpm(entry.best_wpm)}</div>}
                        {type === 'sessions' && <div className="font-bold text-green-500">{entry.session_count}</div>}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
