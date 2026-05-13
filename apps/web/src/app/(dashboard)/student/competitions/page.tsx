'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Trophy, Clock, Users, Zap, Lock, CheckCircle } from 'lucide-react';
import { formatDistanceToNow, isPast, isFuture } from 'date-fns';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useString } from '@/hooks/use-string';
import apiClient from '@/lib/api/client';
import { API } from '@/lib/api/endpoints';
import { formatWpm } from '@/lib/utils/format';
import { toast } from 'sonner';

interface Competition {
  id: number;
  title: string;
  description?: string;
  mode: string;
  language: string;
  starts_at: string;
  ends_at: string;
  max_participants?: number;
  participants_count: number;
  is_joined: boolean;
  status: 'upcoming' | 'active' | 'ended';
}

interface LeaderboardEntry {
  rank: number;
  user_id: number;
  name: string;
  username: string;
  best_wpm: number;
  sessions: number;
}

function CompetitionStatusBadge({ competition }: { competition: Competition }) {
  const { t } = useString();

  if (competition.status === 'active') {
    return <Badge className="bg-green-500/10 text-green-600 border-green-500/20">{t('competitions.active', {}, 'Active')}</Badge>;
  }
  if (competition.status === 'upcoming') {
    return <Badge variant="outline" className="text-blue-600 border-blue-500/20">{t('competitions.upcoming', {}, 'Upcoming')}</Badge>;
  }
  return <Badge variant="secondary">{t('competitions.ended', {}, 'Ended')}</Badge>;
}

function CompetitionLeaderboard({ competitionId }: { competitionId: number }) {
  const { t } = useString();
  const { data: board, isLoading } = useQuery({
    queryKey: ['competition-leaderboard', competitionId],
    queryFn: () => apiClient.get(API.competitions.leaderboard(competitionId)),
    select: (d: any) => d.data,
  });

  if (isLoading) return <Skeleton className="h-32 w-full" />;
  if (!board?.length) return <p className="text-sm text-muted-foreground py-4">{t('competitions.no_scores', {}, 'No scores yet.')}</p>;

  return (
    <div className="space-y-2 mt-3">
      {board.slice(0, 5).map((entry: LeaderboardEntry) => (
        <div key={entry.user_id} className="flex items-center justify-between rounded-lg bg-muted/30 px-3 py-2">
          <div className="flex items-center gap-3">
            <span className={`text-sm font-bold w-5 text-center ${entry.rank === 1 ? 'text-yellow-500' : entry.rank === 2 ? 'text-slate-400' : entry.rank === 3 ? 'text-amber-600' : 'text-muted-foreground'}`}>
              {entry.rank}
            </span>
            <span className="text-sm font-medium">{entry.name}</span>
          </div>
          <span className="text-sm font-bold text-primary">{formatWpm(entry.best_wpm)}</span>
        </div>
      ))}
    </div>
  );
}

export default function StudentCompetitionsPage() {
  const { t } = useString();
  const queryClient = useQueryClient();
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const { data: competitions, isLoading } = useQuery({
    queryKey: ['competitions'],
    queryFn: () => apiClient.get(API.competitions.list),
    select: (d: any) => d.data,
  });

  const joinMutation = useMutation({
    mutationFn: (id: number) => apiClient.post(API.competitions.join(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['competitions'] });
      toast.success(t('competitions.joined', {}, 'Joined competition!'));
    },
    onError: () => {
      toast.error(t('competitions.join_error', {}, 'Could not join competition.'));
    },
  });

  const activeComps = competitions?.filter((c: Competition) => c.status === 'active') ?? [];
  const upcomingComps = competitions?.filter((c: Competition) => c.status === 'upcoming') ?? [];
  const endedComps = competitions?.filter((c: Competition) => c.status === 'ended') ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Trophy size={24} />
          {t('nav.competitions', {}, 'Competitions')}
        </h1>
        <p className="text-muted-foreground">{t('competitions.desc', {}, 'Compete with others and climb the rankings.')}</p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-40 w-full" />)}
        </div>
      ) : !competitions?.length ? (
        <Card>
          <CardContent className="py-16 text-center text-muted-foreground">
            <Trophy size={40} className="mx-auto mb-3 opacity-20" />
            <p>{t('competitions.none', {}, 'No competitions available right now.')}</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {[
            { label: t('competitions.active', {}, 'Active'), items: activeComps, icon: <Zap size={16} className="text-green-500" /> },
            { label: t('competitions.upcoming', {}, 'Upcoming'), items: upcomingComps, icon: <Clock size={16} className="text-blue-500" /> },
            { label: t('competitions.ended', {}, 'Ended'), items: endedComps, icon: <CheckCircle size={16} className="text-muted-foreground" /> },
          ].map(({ label, items, icon }) =>
            items.length > 0 ? (
              <div key={label} className="space-y-3">
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                  {icon}{label}
                </h2>
                {items.map((comp: Competition, i: number) => (
                  <motion.div
                    key={comp.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                  >
                    <Card className={comp.status === 'active' ? 'border-green-500/30 shadow-sm' : ''}>
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-3 flex-wrap">
                          <div className="space-y-1 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <CardTitle className="text-base">{comp.title}</CardTitle>
                              <CompetitionStatusBadge competition={comp} />
                            </div>
                            {comp.description && (
                              <CardDescription>{comp.description}</CardDescription>
                            )}
                            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mt-1">
                              <span className="flex items-center gap-1">
                                <Users size={12} />
                                {comp.participants_count}{comp.max_participants ? `/${comp.max_participants}` : ''} {t('competitions.participants', {}, 'participants')}
                              </span>
                              {comp.status === 'upcoming' && (
                                <span className="flex items-center gap-1">
                                  <Clock size={12} />
                                  {t('competitions.starts_in', {}, 'Starts')} {formatDistanceToNow(new Date(comp.starts_at), { addSuffix: true })}
                                </span>
                              )}
                              {comp.status === 'active' && (
                                <span className="flex items-center gap-1">
                                  <Clock size={12} />
                                  {t('competitions.ends_in', {}, 'Ends')} {formatDistanceToNow(new Date(comp.ends_at), { addSuffix: true })}
                                </span>
                              )}
                              {comp.status === 'ended' && (
                                <span className="flex items-center gap-1">
                                  <CheckCircle size={12} />
                                  {t('competitions.ended_ago', {}, 'Ended')} {formatDistanceToNow(new Date(comp.ends_at), { addSuffix: true })}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex gap-2 shrink-0">
                            {(comp.status === 'active' || comp.status === 'upcoming') && !comp.is_joined && (
                              <Button
                                size="sm"
                                onClick={() => joinMutation.mutate(comp.id)}
                                disabled={joinMutation.isPending || (comp.max_participants != null && comp.participants_count >= comp.max_participants)}
                              >
                                {t('competitions.join', {}, 'Join')}
                              </Button>
                            )}
                            {comp.is_joined && (
                              <Badge variant="secondary" className="flex items-center gap-1">
                                <CheckCircle size={12} />
                                {t('competitions.joined_label', {}, 'Joined')}
                              </Badge>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setExpandedId(expandedId === comp.id ? null : comp.id)}
                            >
                              {expandedId === comp.id ? t('common.hide', {}, 'Hide') : t('competitions.view_board', {}, 'Leaderboard')}
                            </Button>
                          </div>
                        </div>
                      </CardHeader>

                      {expandedId === comp.id && (
                        <CardContent className="pt-0">
                          <CompetitionLeaderboard competitionId={comp.id} />
                        </CardContent>
                      )}
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : null
          )}
        </>
      )}
    </div>
  );
}
