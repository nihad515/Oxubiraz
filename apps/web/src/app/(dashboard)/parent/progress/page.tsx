'use client';

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Zap, Flame } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';
import Link from 'next/link';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useString } from '@/hooks/use-string';
import apiClient from '@/lib/api/client';
import { API } from '@/lib/api/endpoints';
import { ROUTES } from '@/config/routes';

interface Child {
  id: number;
  first_name: string;
  last_name: string;
  username: string;
  level: number;
  xp: number;
  streak_days: number;
  avatar_url: string | null;
}

interface ChildStats {
  wpm_trend: Array<{ date: string; wpm: number }>;
  total_sessions: number;
  avg_wpm: number;
  best_wpm: number;
  total_xp_earned: number;
}

const COLORS = ['#7c3aed', '#2563eb', '#16a34a', '#dc2626', '#ea580c'];

function ChildProgressCard({ child, color }: { child: Child; color: string }) {
  const { t } = useString();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['parent-child-stats', child.id],
    queryFn: () => apiClient.get(API.parent.childStats(child.id)),
    select: (d: any) => d.data as ChildStats,
  });

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback
                className="text-sm font-bold text-white"
                style={{ backgroundColor: color }}
              >
                {child.first_name[0]}{child.last_name[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-base">{child.first_name} {child.last_name}</CardTitle>
              <p className="text-xs text-muted-foreground">@{child.username}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="text-xs">
              {t('gamification.level', {}, 'Level')} {child.level}
            </Badge>
            <span className="text-xs font-medium text-yellow-600">{child.xp} XP</span>
            {child.streak_days > 0 && (
              <span className="flex items-center gap-1 text-xs text-orange-500">
                <Flame size={12} />
                {child.streak_days}
              </span>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Stats row */}
        {isLoading ? (
          <div className="grid grid-cols-3 gap-3">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-lg" />)}
          </div>
        ) : stats ? (
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="rounded-lg bg-muted/40 p-3">
              <div className="text-lg font-black" style={{ color }}>{stats.avg_wpm}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{t('analytics.avg_wpm', {}, 'Avg WPM')}</div>
            </div>
            <div className="rounded-lg bg-muted/40 p-3">
              <div className="text-lg font-black" style={{ color }}>{stats.best_wpm}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{t('analytics.best_wpm', {}, 'Best WPM')}</div>
            </div>
            <div className="rounded-lg bg-muted/40 p-3">
              <div className="text-lg font-black" style={{ color }}>{stats.total_sessions}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{t('analytics.sessions', {}, 'Sessions')}</div>
            </div>
          </div>
        ) : null}

        {/* WPM trend chart */}
        {isLoading ? (
          <Skeleton className="h-28 w-full rounded-lg" />
        ) : stats?.wpm_trend?.length ? (
          <div className="h-28">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.wpm_trend}>
                <XAxis dataKey="date" hide />
                <YAxis hide />
                <Tooltip
                  contentStyle={{ fontSize: 11, borderRadius: 8 }}
                  formatter={(v: number) => [`${v} WPM`]}
                />
                <Line
                  type="monotone"
                  dataKey="wpm"
                  stroke={color}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-28 flex items-center justify-center">
            <p className="text-xs text-muted-foreground">{t('analytics.no_sessions', {}, 'No sessions yet')}</p>
          </div>
        )}

        <div className="flex justify-end">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`${ROUTES.parent.children}/${child.id}`}>
              <TrendingUp size={14} className="mr-1.5" />
              {t('parent.view_detail', {}, 'Full detail')}
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ParentProgressPage() {
  const { t } = useString();

  const { data: children, isLoading } = useQuery({
    queryKey: ['parent-children'],
    queryFn: () => apiClient.get(API.parent.children),
    select: (d: any) => d.data as Child[],
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BarChart3 size={24} />
          {t('nav.progress', {}, 'Progress Overview')}
        </h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          {t('parent.progress_desc', {}, 'Track your children\'s reading performance side by side.')}
        </p>
      </div>

      {isLoading ? (
        <div className="grid gap-6 lg:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-72 rounded-xl" />)}
        </div>
      ) : !children?.length ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Zap size={40} className="mx-auto mb-3 text-muted-foreground/30" />
            <p className="text-muted-foreground">{t('parent.no_children', {}, 'No children linked to your account.')}</p>
            <Button className="mt-4" asChild>
              <Link href={ROUTES.parent.children}>{t('parent.add_child', {}, 'Add a child')}</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {children.map((child, i) => (
            <motion.div
              key={child.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <ChildProgressCard child={child} color={COLORS[i % COLORS.length]} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
