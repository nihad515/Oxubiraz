'use client';

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Users, TrendingUp, Flame, BarChart3 } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthStore } from '@/store/auth-store';
import { useString } from '@/hooks/use-string';
import { ROUTES } from '@/config/routes';
import apiClient from '@/lib/api/client';
import { API } from '@/lib/api/endpoints';
import type { ApiResponse } from '@/types/api';
import { formatWpm, formatNumber } from '@/lib/utils/format';
import { calculateXpToNextLevel } from '@/lib/utils/format';
import { LEVEL_THRESHOLDS } from '@/types/gamification';

interface ChildStats {
  id: number;
  name: string;
  username: string;
  level: number;
  xp: number;
  streak_days: number;
  best_wpm: number;
  average_wpm: number;
  sessions_today: number;
  total_sessions: number;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

export function ParentDashboard() {
  const { t } = useString();
  const { user } = useAuthStore();

  const { data: children, isLoading } = useQuery({
    queryKey: ['parent', 'children'],
    queryFn: () => apiClient.get<ApiResponse<ChildStats[]>>(API.parent?.children ?? '/parent/children'),
    select: (d) => d.data,
  });

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold">
          {t('dashboard.welcome', { name: user?.first_name ?? '' }, `Welcome, ${user?.first_name}!`)}
        </h1>
        <p className="text-muted-foreground">{t('dashboard.parent_subtitle', {}, "Track your children's learning progress")}</p>
      </motion.div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-48 w-full" />)}
        </div>
      ) : !children?.length ? (
        <motion.div variants={itemVariants}>
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <Users size={40} className="mx-auto mb-3 opacity-20" />
              <p className="font-medium">{t('parent.no_children', {}, 'No children linked yet.')}</p>
              <p className="text-sm mt-1">
                {t('parent.link_child_hint', {}, "Ask your child's teacher to link their account.")}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {children.map((child) => {
            const xpInfo = calculateXpToNextLevel(child.xp, LEVEL_THRESHOLDS);
            return (
              <motion.div key={child.id} variants={itemVariants}>
                <Card className="border-2 border-primary/10">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{child.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">@{child.username}</p>
                      </div>
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary shadow">
                        <span className="text-lg font-black text-primary-foreground">{child.level}</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* XP Progress */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{formatNumber(child.xp)} XP</span>
                        <span>{xpInfo.xpInLevel} / {xpInfo.xpNeeded} XP</span>
                      </div>
                      <Progress value={xpInfo.progress} className="h-2" indicatorClassName="bg-gradient-to-r from-brand-400 to-brand-600" />
                    </div>

                    {/* Streak */}
                    {child.streak_days > 0 && (
                      <div className="flex items-center gap-2 rounded-lg bg-orange-50 p-2 dark:bg-orange-950/30">
                        <Flame size={16} className="text-orange-500" />
                        <span className="text-sm font-medium text-orange-700 dark:text-orange-300">
                          {t('gamification.streak', { days: child.streak_days }, `${child.streak_days} day streak!`)}
                        </span>
                      </div>
                    )}

                    {/* Stats */}
                    <div className="grid grid-cols-4 gap-2 text-center">
                      {[
                        { label: t('analytics.best_wpm', {}, 'Best WPM'), value: formatWpm(child.best_wpm), color: 'text-blue-500' },
                        { label: t('analytics.avg_wpm', {}, 'Avg WPM'), value: formatWpm(child.average_wpm), color: 'text-purple-500' },
                        { label: t('analytics.today', {}, 'Today'), value: child.sessions_today, color: 'text-green-500' },
                        { label: t('analytics.sessions', {}, 'Total'), value: child.total_sessions, color: 'text-orange-500' },
                      ].map(({ label, value, color }) => (
                        <div key={label} className="rounded-lg bg-muted/30 p-2">
                          <div className={`text-lg font-black ${color}`}>{value}</div>
                          <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
                        </div>
                      ))}
                    </div>

                    <Button asChild variant="outline" size="sm" className="w-full">
                      <Link href={`${ROUTES.parent.children}/${child.id}`}>
                        <BarChart3 size={14} />
                        {t('parent.view_progress', {}, 'View Full Progress')}
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
