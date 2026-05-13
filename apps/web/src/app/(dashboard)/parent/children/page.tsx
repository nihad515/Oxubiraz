'use client';

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Users, BarChart3, Flame, TrendingUp } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { useString } from '@/hooks/use-string';
import apiClient from '@/lib/api/client';
import { API } from '@/lib/api/endpoints';
import { formatWpm, formatNumber, calculateXpToNextLevel } from '@/lib/utils/format';
import { LEVEL_THRESHOLDS } from '@/types/gamification';

export default function ParentChildrenPage() {
  const { t } = useString();

  const { data: children, isLoading } = useQuery({
    queryKey: ['parent', 'children'],
    queryFn: () => apiClient.get(API.parent.children),
    select: (d: any) => d.data,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Users size={24} />
          {t('nav.children', {}, 'My Children')}
        </h1>
        <p className="text-muted-foreground">{t('parent.children_desc', {}, "Detailed view of your children's progress")}</p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-64 w-full" />)}
        </div>
      ) : !children?.length ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Users size={40} className="mx-auto mb-3 opacity-20" />
            <p>{t('parent.no_children', {}, 'No children linked to your account.')}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {children.map((child: any, i: number) => {
            const xpInfo = calculateXpToNextLevel(child.xp, LEVEL_THRESHOLDS);
            return (
              <motion.div
                key={child.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="border-2 border-primary/10">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary shadow-md">
                          <span className="text-xl font-black text-primary-foreground">{child.level}</span>
                        </div>
                        <div>
                          <div className="text-lg font-bold">{child.name}</div>
                          <div className="text-sm text-muted-foreground">@{child.username}</div>
                          {child.school && (
                            <div className="text-xs text-muted-foreground">{child.school}{child.class ? ` · ${child.class}` : ''}</div>
                          )}
                        </div>
                      </div>
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/parent/children/${child.id}`}>
                          <BarChart3 size={14} />
                          {t('parent.view_progress', {}, 'Full Report')}
                        </Link>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* XP Progress bar */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{t('gamification.level', {}, 'Level')} {child.level} — {formatNumber(child.xp)} XP</span>
                        <span>{xpInfo.xpInLevel} / {xpInfo.xpNeeded} XP {t('gamification.to_next', {}, 'to next')}</span>
                      </div>
                      <Progress value={xpInfo.progress} className="h-3" indicatorClassName="bg-gradient-to-r from-brand-400 to-brand-600" />
                    </div>

                    {/* Streak */}
                    {child.streak_days > 0 && (
                      <div className="flex items-center gap-2 rounded-xl bg-orange-50 p-3 dark:bg-orange-950/20">
                        <Flame size={18} className="text-orange-500" />
                        <span className="font-semibold text-orange-700 dark:text-orange-300 text-sm">
                          {t('gamification.streak', { days: child.streak_days }, `${child.streak_days} day streak!`)}
                        </span>
                      </div>
                    )}

                    {/* Stats grid */}
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                      {[
                        { icon: <TrendingUp size={16} className="text-blue-500" />, label: t('analytics.best_wpm', {}, 'Best WPM'), value: formatWpm(child.best_wpm), color: 'text-blue-500' },
                        { icon: <BarChart3 size={16} className="text-purple-500" />, label: t('analytics.avg_wpm', {}, 'Avg WPM'), value: formatWpm(child.average_wpm), color: 'text-purple-500' },
                        { icon: <Users size={16} className="text-green-500" />, label: t('analytics.today', {}, 'Today'), value: child.sessions_today, color: 'text-green-500' },
                        { icon: <BarChart3 size={16} className="text-orange-500" />, label: t('analytics.sessions', {}, 'Total'), value: child.total_sessions, color: 'text-orange-500' },
                      ].map(({ icon, label, value, color }) => (
                        <div key={label} className="rounded-xl bg-muted/30 p-3 text-center">
                          <div className="flex justify-center mb-1">{icon}</div>
                          <div className={`text-xl font-black ${color}`}>{value}</div>
                          <div className="text-xs text-muted-foreground">{label}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
