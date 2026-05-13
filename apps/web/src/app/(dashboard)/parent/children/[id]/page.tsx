'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, TrendingUp, BarChart3, Flame, Trophy, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { useString } from '@/hooks/use-string';
import apiClient from '@/lib/api/client';
import { API } from '@/lib/api/endpoints';
import { WpmTrendChart } from '@/components/analytics/wpm-trend-chart';
import { LanguageBreakdownChart } from '@/components/analytics/language-breakdown-chart';
import { ModeBreakdownChart } from '@/components/analytics/mode-breakdown-chart';
import { formatWpm, formatNumber, calculateXpToNextLevel } from '@/lib/utils/format';
import { LEVEL_THRESHOLDS } from '@/types/gamification';

export default function ChildDetailPage() {
  const { t } = useString();
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['parent', 'child-stats', id],
    queryFn: () => apiClient.get(API.parent.childStats(Number(id))),
    select: (d: any) => d.data,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-48 w-full" />
        <div className="grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-muted-foreground">{t('parent.child_not_found', {}, 'Child not found.')}</p>
        <Button variant="outline" className="mt-4" onClick={() => router.back()}>
          {t('common.go_back', {}, 'Go Back')}
        </Button>
      </div>
    );
  }

  const xpInfo = calculateXpToNextLevel(stats.xp, LEVEL_THRESHOLDS);

  const summaryStats = [
    { icon: <TrendingUp size={16} className="text-blue-500" />, label: t('analytics.best_wpm', {}, 'Best WPM'), value: formatWpm(stats.best_wpm), color: 'text-blue-500' },
    { icon: <BarChart3 size={16} className="text-purple-500" />, label: t('analytics.avg_wpm', {}, 'Avg WPM'), value: formatWpm(stats.average_wpm), color: 'text-purple-500' },
    { icon: <Clock size={16} className="text-green-500" />, label: t('analytics.today', {}, 'Today'), value: stats.sessions_today ?? 0, color: 'text-green-500' },
    { icon: <BarChart3 size={16} className="text-orange-500" />, label: t('analytics.total_sessions', {}, 'Total Sessions'), value: stats.total_sessions ?? 0, color: 'text-orange-500' },
    { icon: <Trophy size={16} className="text-yellow-500" />, label: t('gamification.achievements', {}, 'Achievements'), value: stats.achievements_count ?? 0, color: 'text-yellow-500' },
    { icon: <Flame size={16} className="text-red-500" />, label: t('gamification.streak', {}, 'Streak'), value: `${stats.streak_days ?? 0}d`, color: 'text-red-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft size={18} />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{stats.name}</h1>
          <p className="text-sm text-muted-foreground">@{stats.username}</p>
        </div>
      </div>

      {/* Profile card */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="border-2 border-primary/10">
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-md shrink-0">
                <span className="text-2xl font-black text-primary-foreground">{stats.level}</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-lg font-bold">{t('gamification.level', {}, 'Level')} {stats.level}</span>
                  <Badge variant="secondary">{formatNumber(stats.xp)} XP</Badge>
                  {stats.school && <Badge variant="outline">{stats.school}{stats.class ? ` · ${stats.class}` : ''}</Badge>}
                </div>
                <div className="mt-2 space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{xpInfo.xpInLevel} / {xpInfo.xpNeeded} XP {t('gamification.to_next', {}, 'to next level')}</span>
                    <span>{Math.round(xpInfo.progress)}%</span>
                  </div>
                  <Progress value={xpInfo.progress} className="h-2.5" indicatorClassName="bg-gradient-to-r from-brand-400 to-brand-600" />
                </div>
              </div>
            </div>

            {stats.streak_days > 0 && (
              <div className="flex items-center gap-2 rounded-xl bg-orange-50 p-3 dark:bg-orange-950/20">
                <Flame size={18} className="text-orange-500" />
                <span className="font-semibold text-orange-700 dark:text-orange-300 text-sm">
                  {t('gamification.streak', { days: stats.streak_days }, `${stats.streak_days} day streak!`)}
                </span>
              </div>
            )}

            <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
              {summaryStats.map(({ icon, label, value, color }) => (
                <div key={label} className="rounded-xl bg-muted/30 p-3 text-center">
                  <div className="flex justify-center mb-1">{icon}</div>
                  <div className={`text-xl font-black ${color}`}>{value}</div>
                  <div className="text-xs text-muted-foreground leading-tight mt-0.5">{label}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp size={16} />{t('analytics.wpm_trend', {}, 'WPM Trend')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <WpmTrendChart data={stats.wpm_trend} />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t('analytics.by_language', {}, 'By Language')}</CardTitle>
            </CardHeader>
            <CardContent>
              <LanguageBreakdownChart data={stats.by_language} />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t('analytics.by_mode', {}, 'By Game Mode')}</CardTitle>
            </CardHeader>
            <CardContent>
              <ModeBreakdownChart data={stats.by_mode} height={200} />
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent achievements */}
      {stats.recent_achievements?.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Trophy size={16} />{t('gamification.recent_achievements', {}, 'Recent Achievements')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {stats.recent_achievements.map((a: any) => (
                  <Badge key={a.id} variant="secondary" className="gap-1 py-1 px-2">
                    {a.icon && <span>{a.icon}</span>}
                    {a.name}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
