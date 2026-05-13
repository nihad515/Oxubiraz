'use client';

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Zap, Trophy, Star, BarChart3, Flame, Target, TrendingUp, Clock } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthStore } from '@/store/auth-store';
import { useString } from '@/hooks/use-string';
import apiClient from '@/lib/api/client';
import { API } from '@/lib/api/endpoints';
import { ROUTES } from '@/config/routes';
import { formatWpm, formatNumber } from '@/lib/utils/format';
import { calculateXpToNextLevel } from '@/lib/utils/format';
import { LEVEL_THRESHOLDS } from '@/types/gamification';
import type { StudentStats } from '@/types/analytics';
import type { ApiResponse } from '@/types/api';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

export function StudentDashboard() {
  const { t } = useString();
  const { user } = useAuthStore();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['analytics', 'me'],
    queryFn: () => apiClient.get<ApiResponse<StudentStats>>(API.analytics.myStats),
    select: (d) => d.data,
  });

  const xpInfo = calculateXpToNextLevel(user?.xp ?? 0, LEVEL_THRESHOLDS);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Welcome header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {t('dashboard.welcome', { name: user?.first_name ?? '' }, `Welcome, ${user?.first_name}!`)}
          </h1>
          <p className="text-muted-foreground">
            {t('dashboard.student_subtitle', {}, 'Keep reading and improving!')}
          </p>
        </div>
        <Button asChild variant="game" size="lg" className="hidden sm:flex">
          <Link href={ROUTES.student.play}>
            <Zap size={18} />
            {t('nav.play')}
          </Link>
        </Button>
      </motion.div>

      {/* Level & XP card */}
      <motion.div variants={itemVariants}>
        <Card className="border-2 border-primary/20 bg-gradient-to-br from-brand-50 to-background dark:from-brand-950/30">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-lg">
                <span className="text-2xl font-black text-primary-foreground">
                  {user?.level ?? 0}
                </span>
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">
                      {t('gamification.level', {}, 'Level')} {user?.level ?? 0}
                    </span>
                    <div className="text-lg font-bold">
                      {formatNumber(user?.xp ?? 0)} XP
                    </div>
                  </div>
                  <Badge variant="secondary">
                    {xpInfo.xpInLevel} / {xpInfo.xpNeeded} XP
                  </Badge>
                </div>
                <Progress
                  value={xpInfo.progress}
                  className="h-2.5"
                  indicatorClassName="bg-gradient-to-r from-brand-400 to-brand-600"
                />
              </div>
            </div>

            {/* Streak */}
            {(user?.streak_days ?? 0) > 0 && (
              <div className="mt-4 flex items-center gap-2 rounded-xl bg-orange-50 p-3 dark:bg-orange-950/30">
                <Flame size={20} className="text-orange-500" />
                <span className="font-semibold text-orange-700 dark:text-orange-300">
                  {t('gamification.streak', { days: user?.streak_days ?? 0 }, `${user?.streak_days} day streak!`)}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          {
            icon: <TrendingUp size={20} className="text-blue-500" />,
            value: isLoading ? null : formatWpm(stats?.best_wpm ?? 0),
            label: t('analytics.best_wpm', {}, 'Best WPM'),
            color: 'text-blue-500',
          },
          {
            icon: <BarChart3 size={20} className="text-purple-500" />,
            value: isLoading ? null : formatWpm(stats?.average_wpm ?? 0),
            label: t('analytics.avg_wpm', {}, 'Avg WPM'),
            color: 'text-purple-500',
          },
          {
            icon: <Target size={20} className="text-green-500" />,
            value: isLoading ? null : formatNumber(stats?.total_sessions ?? 0),
            label: t('analytics.sessions', {}, 'Sessions'),
            color: 'text-green-500',
          },
          {
            icon: <Clock size={20} className="text-yellow-500" />,
            value: isLoading ? null : `${stats?.sessions_today ?? 0}`,
            label: t('analytics.today', {}, 'Today'),
            color: 'text-yellow-500',
          },
        ].map(({ icon, value, label, color }) => (
          <Card key={label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                {icon}
                <span className="text-xs text-muted-foreground">{label}</span>
              </div>
              {isLoading || value === null ? (
                <Skeleton className="mt-2 h-7 w-20" />
              ) : (
                <div className={`mt-1 text-2xl font-black ${color}`}>{value}</div>
              )}
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Quick play CTA — mobile only */}
      <motion.div variants={itemVariants} className="sm:hidden">
        <Button asChild variant="game" size="xl" className="w-full">
          <Link href={ROUTES.student.play}>
            <Zap size={22} />
            {t('game.start')}
          </Link>
        </Button>
      </motion.div>

      {/* Recent sessions placeholder */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t('analytics.recent_sessions', {}, 'Recent Sessions')}</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (stats?.wpm_trend?.length ?? 0) === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                <Zap size={32} className="mx-auto mb-2 opacity-30" />
                <p>{t('analytics.no_sessions', {}, 'No sessions yet. Start playing!')}</p>
              </div>
            ) : (
              <div className="space-y-2">
                {stats?.wpm_trend?.slice(0, 5).map((record, i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg border p-3">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 flex items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                        {i + 1}
                      </div>
                      <div>
                        <div className="text-sm font-medium">{record.mode}</div>
                        <div className="text-xs text-muted-foreground">{record.date}</div>
                      </div>
                    </div>
                    <Badge variant="secondary">{record.wpm} WPM</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
