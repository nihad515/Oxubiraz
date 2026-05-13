'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart3, TrendingUp, Users, Download } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useString } from '@/hooks/use-string';
import apiClient from '@/lib/api/client';
import { API } from '@/lib/api/endpoints';
import { WpmTrendChart } from '@/components/analytics/wpm-trend-chart';
import { LanguageBreakdownChart } from '@/components/analytics/language-breakdown-chart';
import { ModeBreakdownChart } from '@/components/analytics/mode-breakdown-chart';
import { formatWpm } from '@/lib/utils/format';

type Period = 'week' | 'month' | 'year';

export default function TeacherAnalyticsPage() {
  const { t } = useString();
  const [period, setPeriod] = useState<Period>('month');

  const { data: overview, isLoading } = useQuery({
    queryKey: ['analytics', 'teacher-overview'],
    queryFn: () => apiClient.get(API.analytics.overview),
    select: (d: any) => d.data,
  });

  const { data: daily } = useQuery({
    queryKey: ['analytics', 'daily', period],
    queryFn: () => apiClient.get(`${API.analytics.daily}?period=${period}`),
    select: (d: any) => d.data,
  });

  const { data: byLanguage } = useQuery({
    queryKey: ['analytics', 'by-language'],
    queryFn: () => apiClient.get(API.analytics.byLanguage),
    select: (d: any) => d.data,
  });

  const { data: byMode } = useQuery({
    queryKey: ['analytics', 'by-mode'],
    queryFn: () => apiClient.get(API.analytics.byMode),
    select: (d: any) => d.data,
  });

  const { data: topStudents } = useQuery({
    queryKey: ['analytics', 'top-students'],
    queryFn: () => apiClient.get(API.analytics.topStudents),
    select: (d: any) => d.data,
  });

  const periods: Period[] = ['week', 'month', 'year'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 size={24} />
            {t('nav.analytics', {}, 'Class Analytics')}
          </h1>
          <p className="text-muted-foreground">{t('teacher.analytics_desc', {}, "Your class's performance overview")}</p>
        </div>
        <div className="flex gap-2">
          {periods.map(p => (
            <Button key={p} variant={period === p ? 'default' : 'outline'} size="sm" onClick={() => setPeriod(p)}>
              {t(`common.this_${p}`, {}, p)}
            </Button>
          ))}
        </div>
      </div>

      {/* Overview stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: t('teacher.total_students', {}, 'Students'), value: overview?.total_students, color: 'text-blue-500' },
          { label: t('teacher.active_today', {}, 'Active Today'), value: overview?.active_students_today, color: 'text-green-500' },
          { label: t('analytics.avg_wpm', {}, 'Avg WPM'), value: overview?.class_avg_wpm ? formatWpm(overview.class_avg_wpm) : '—', color: 'text-purple-500' },
          { label: t('analytics.sessions', {}, 'Sessions (Week)'), value: overview?.total_sessions_week, color: 'text-orange-500' },
        ].map(({ label, value, color }) => (
          <Card key={label}>
            <CardContent className="p-4">
              <div className="text-xs text-muted-foreground">{label}</div>
              {isLoading ? <Skeleton className="mt-2 h-8 w-20" /> : (
                <div className={`mt-1 text-3xl font-black ${color}`}>{value ?? '—'}</div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2">
            <TrendingUp size={16} />{t('analytics.wpm_trend', {}, 'WPM Trend')}
          </CardTitle></CardHeader>
          <CardContent><WpmTrendChart data={daily} /></CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2">
            <BarChart3 size={16} />{t('analytics.daily_activity', {}, 'Daily Activity')}
          </CardTitle></CardHeader>
          <CardContent><WpmTrendChart data={daily} dataKey="sessions" color="#8b5cf6" /></CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">{t('analytics.by_language', {}, 'By Language')}</CardTitle></CardHeader>
          <CardContent><LanguageBreakdownChart data={byLanguage} /></CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">{t('analytics.by_mode', {}, 'By Game Mode')}</CardTitle></CardHeader>
          <CardContent><ModeBreakdownChart data={byMode} /></CardContent>
        </Card>
      </div>

      {/* Top students */}
      {topStudents?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Users size={16} />{t('teacher.top_students', {}, 'Top Students')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {topStudents.slice(0, 10).map((s: any, i: number) => (
                <div key={s.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">{i + 1}</div>
                    <div>
                      <div className="text-sm font-medium">{s.name}</div>
                      <div className="text-xs text-muted-foreground">Level {s.level} · {s.xp} XP</div>
                    </div>
                  </div>
                  <div className="text-sm font-bold text-primary">{formatWpm(s.best_wpm)}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
