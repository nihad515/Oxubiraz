'use client';

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  TrendingUp, Flame, BookOpen, Clock, Trophy, Globe2, Zap, BarChart3,
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { WpmTrendChart } from '@/components/analytics/wpm-trend-chart';
import { useString } from '@/hooks/use-string';
import apiClient from '@/lib/api/client';
import { API } from '@/lib/api/endpoints';
import { ROUTES } from '@/config/routes';
import { formatWpm, formatNumber } from '@/lib/utils/format';
import type { StudentStats } from '@/types/analytics';
import type { ApiResponse } from '@/types/api';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

const MODE_LABELS: Record<string, string> = {
  random_words: 'Random Words',
  text_reading: 'Text Reading',
  sentence_reading: 'Sentences',
  memory: 'Memory',
  ai: 'AI',
};

export default function ProgressPage() {
  const { t } = useString();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['analytics', 'me'],
    queryFn: () => apiClient.get<ApiResponse<StudentStats>>(API.analytics.myStats),
    select: (d) => d.data,
  });

  const modeBreakdown = stats?.wpm_trend.reduce<Record<string, number>>((acc, r) => {
    acc[r.mode] = (acc[r.mode] ?? 0) + 1;
    return acc;
  }, {}) ?? {};

  const langBreakdown = stats?.wpm_trend.reduce<Record<string, number>>((acc, r) => {
    acc[r.language] = (acc[r.language] ?? 0) + 1;
    return acc;
  }, {}) ?? {};

  const totalTrend = stats?.wpm_trend.length ?? 0;

  const statCards = [
    {
      icon: <TrendingUp size={18} className="text-blue-500" />,
      label: t('analytics.best_wpm', {}, 'Best WPM'),
      value: formatWpm(stats?.best_wpm ?? 0),
      color: 'text-blue-600 dark:text-blue-400',
    },
    {
      icon: <BarChart3 size={18} className="text-purple-500" />,
      label: t('analytics.avg_wpm', {}, 'Avg WPM'),
      value: formatWpm(stats?.average_wpm ?? 0),
      color: 'text-purple-600 dark:text-purple-400',
    },
    {
      icon: <BookOpen size={18} className="text-green-500" />,
      label: t('analytics.total_words', {}, 'Total Words'),
      value: formatNumber(stats?.total_words_read ?? 0),
      color: 'text-green-600 dark:text-green-400',
    },
    {
      icon: <Clock size={18} className="text-yellow-500" />,
      label: t('analytics.total_time', {}, 'Total Time'),
      value: `${stats?.total_time_minutes ?? 0} min`,
      color: 'text-yellow-600 dark:text-yellow-400',
    },
    {
      icon: <Flame size={18} className="text-orange-500" />,
      label: t('analytics.streak_current', {}, 'Current Streak'),
      value: `${stats?.current_streak ?? 0}d`,
      color: 'text-orange-600 dark:text-orange-400',
    },
    {
      icon: <Trophy size={18} className="text-yellow-500" />,
      label: t('analytics.streak_longest', {}, 'Best Streak'),
      value: `${stats?.longest_streak ?? 0}d`,
      color: 'text-yellow-600 dark:text-yellow-400',
    },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <TrendingUp size={24} className="text-primary" />
            {t('student.progress_title', {}, 'My Progress')}
          </h1>
          <p className="text-muted-foreground">
            {t('student.progress_subtitle', {}, 'Track your reading improvement')}
          </p>
        </div>
        <Button asChild variant="game" size="lg" className="hidden sm:flex">
          <Link href={ROUTES.student.game}>
            <Zap size={18} />
            {t('nav.play')}
          </Link>
        </Button>
      </motion.div>

      {/* Stats grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {statCards.map(({ icon, label, value, color }) => (
          <Card key={label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-1.5 mb-1">
                {icon}
                <span className="text-xs text-muted-foreground leading-tight">{label}</span>
              </div>
              {isLoading ? (
                <Skeleton className="mt-1 h-7 w-16" />
              ) : (
                <div className={`text-xl font-black ${color}`}>{value}</div>
              )}
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* WPM trend chart */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{t('analytics.wpm_trend', {}, 'WPM Trend')}</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-60 w-full" />
            ) : (
              <WpmTrendChart data={stats?.wpm_trend} dataKey="wpm" height={240} />
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Mode + Language breakdown */}
      <motion.div variants={itemVariants} className="grid gap-4 sm:grid-cols-2">
        {/* By Mode */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{t('analytics.by_mode', {}, 'By Game Mode')}</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-8 w-full" />)}
              </div>
            ) : Object.keys(modeBreakdown).length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                {t('analytics.no_data', {}, 'No data yet')}
              </p>
            ) : (
              <div className="space-y-3">
                {Object.entries(modeBreakdown)
                  .sort(([, a], [, b]) => b - a)
                  .map(([mode, count]) => (
                    <div key={mode} className="flex items-center gap-2">
                      <span className="w-[130px] shrink-0 text-sm font-medium truncate">
                        {MODE_LABELS[mode] ?? mode}
                      </span>
                      <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary transition-all duration-300"
                          style={{ width: `${totalTrend > 0 ? (count / totalTrend) * 100 : 0}%` }}
                        />
                      </div>
                      <Badge variant="secondary" className="text-xs w-8 justify-center shrink-0">
                        {count}
                      </Badge>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* By Language */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{t('analytics.by_language', {}, 'By Language')}</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-8 w-full" />)}
              </div>
            ) : Object.keys(langBreakdown).length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                {t('analytics.no_data', {}, 'No data yet')}
              </p>
            ) : (
              <div className="space-y-3">
                {Object.entries(langBreakdown)
                  .sort(([, a], [, b]) => b - a)
                  .map(([lang, count]) => (
                    <div key={lang} className="flex items-center gap-2">
                      <Globe2 size={14} className="text-muted-foreground shrink-0" />
                      <span className="w-10 shrink-0 text-sm font-semibold uppercase">{lang}</span>
                      <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-blue-500 transition-all duration-300"
                          style={{ width: `${totalTrend > 0 ? (count / totalTrend) * 100 : 0}%` }}
                        />
                      </div>
                      <Badge variant="secondary" className="text-xs w-8 justify-center shrink-0">
                        {count}
                      </Badge>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick links */}
      <motion.div variants={itemVariants} className="grid gap-3 sm:grid-cols-3">
        {[
          { href: ROUTES.student.history, labelKey: 'nav.history', icon: <BarChart3 size={20} /> },
          { href: ROUTES.student.achievements, labelKey: 'nav.achievements', icon: <Trophy size={20} /> },
          { href: ROUTES.student.leaderboard, labelKey: 'nav.leaderboard', icon: <Globe2 size={20} /> },
        ].map(({ href, labelKey, icon }) => (
          <Link key={href} href={href}>
            <Card className="cursor-pointer transition-shadow hover:shadow-md">
              <CardContent className="flex items-center gap-3 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  {icon}
                </div>
                <span className="font-medium">{t(labelKey)}</span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </motion.div>

      {/* Mobile play CTA */}
      <motion.div variants={itemVariants} className="sm:hidden">
        <Button asChild variant="game" size="xl" className="w-full">
          <Link href={ROUTES.student.game}>
            <Zap size={22} />
            {t('game.start')}
          </Link>
        </Button>
      </motion.div>
    </motion.div>
  );
}
