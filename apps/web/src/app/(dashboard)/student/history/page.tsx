'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart3 } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useString } from '@/hooks/use-string';
import apiClient from '@/lib/api/client';
import { API } from '@/lib/api/endpoints';
import { formatWpm, formatMs, formatRelativeTime } from '@/lib/utils/format';
import type { PaginatedResponse } from '@/types/api';

interface SessionRecord {
  id: number;
  mode: string;
  language: string;
  duration: number;
  wpm: number;
  accuracy: number;
  clicked_words: number;
  is_completed: boolean;
  xp_earned: number;
  created_at: string;
  time_elapsed_ms: number;
}

export default function HistoryPage() {
  const { t } = useString();
  const [page, setPage] = useState(1);
  const [modeFilter, setModeFilter] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['game', 'history', page, modeFilter],
    queryFn: () => {
      const params = new URLSearchParams({ page: String(page), per_page: '15' });
      if (modeFilter) params.set('mode', modeFilter);
      return apiClient.get<PaginatedResponse<SessionRecord[]>>(`${API.game.history}?${params}`);
    },
  });

  const modes = ['', 'random_words', 'text_reading', 'sentence_reading', 'memory'];

  const modeLabels: Record<string, string> = {
    random_words: t('game.mode_random', {}, 'Random Words'),
    text_reading: t('game.mode_text', {}, 'Text Reading'),
    sentence_reading: t('game.mode_sentence', {}, 'Sentences'),
    memory: t('game.mode_memory', {}, 'Memory'),
    ai: 'AI',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BarChart3 size={24} />
          {t('nav.history', {}, 'Session History')}
        </h1>
        <p className="text-muted-foreground">{t('analytics.history_desc', {}, 'Your reading sessions over time')}</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {modes.map((mode) => (
          <Button
            key={mode || 'all'}
            variant={modeFilter === mode ? 'default' : 'outline'}
            size="sm"
            onClick={() => { setModeFilter(mode); setPage(1); }}
          >
            {mode ? modeLabels[mode] : t('common.all', {}, 'All')}
          </Button>
        ))}
      </div>

      {/* Sessions list */}
      <div className="space-y-3">
        {isLoading ? (
          Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)
        ) : !data?.data?.length ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <BarChart3 size={40} className="mx-auto mb-3 opacity-20" />
              <p>{t('analytics.no_sessions', {}, 'No sessions yet. Start playing!')}</p>
            </CardContent>
          </Card>
        ) : (
          data.data.map((session: SessionRecord) => (
            <Card key={session.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                      <BarChart3 size={18} className="text-primary" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm">{modeLabels[session.mode] ?? session.mode}</span>
                        <Badge variant="secondary" className="text-xs">{session.language.toUpperCase()}</Badge>
                        {session.is_completed && <Badge variant="success" className="text-xs">{t('game.completed', {}, 'Completed')}</Badge>}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatRelativeTime(session.created_at)} · {formatMs(session.time_elapsed_ms)} · {session.clicked_words} {t('game.words', {}, 'words')}
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-lg font-black text-primary">{formatWpm(session.wpm)}</div>
                    <div className="text-xs text-muted-foreground">{session.accuracy.toFixed(1)}% · +{session.xp_earned} XP</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Pagination */}
      {data?.meta && data.meta.last_page > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            {t('common.total', {}, 'Total')}: {data.meta.total}
          </span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
              {t('common.prev', {}, 'Prev')}
            </Button>
            <span className="flex items-center px-2 text-sm">{page} / {data.meta.last_page}</span>
            <Button variant="outline" size="sm" disabled={page >= data.meta.last_page} onClick={() => setPage(p => p + 1)}>
              {t('common.next', {}, 'Next')}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
