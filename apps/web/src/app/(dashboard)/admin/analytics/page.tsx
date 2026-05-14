'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart3, TrendingUp, Users, Globe, Download } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useString } from '@/hooks/use-string';
import { toast } from 'sonner';
import apiClient from '@/lib/api/client';
import { API } from '@/lib/api/endpoints';
import { WpmTrendChart } from '@/components/analytics/wpm-trend-chart';
import { LanguageBreakdownChart } from '@/components/analytics/language-breakdown-chart';
import { ModeBreakdownChart } from '@/components/analytics/mode-breakdown-chart';
import { DailyActivityChart } from '@/components/analytics/daily-activity-chart';
import type { ApiResponse } from '@/types/api';

type Period = 'week' | 'month' | 'year';

export default function AdminAnalyticsPage() {
  const { t } = useString();
  const [period, setPeriod] = useState<Period>('month');
  const [exporting, setExporting] = useState(false);

  const handleExport = async (format: 'xlsx' | 'csv') => {
    setExporting(true);
    try {
      const mimeType = format === 'csv'
        ? 'text/csv'
        : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      const response = await apiClient.axios.get(
        `${API.analytics.export}?format=${format}`,
        { responseType: 'blob' },
      );
      const url = URL.createObjectURL(new Blob([response.data], { type: mimeType }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics_${new Date().toISOString().slice(0, 10)}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      toast.error(t('common.error', {}, 'Export failed'));
    } finally {
      setExporting(false);
    }
  };

  const { data: overview, isLoading: loadingOverview } = useQuery({
    queryKey: ['analytics', 'admin-overview'],
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

  const periods: Period[] = ['week', 'month', 'year'];
  const periodLabels: Record<Period, string> = {
    week: t('common.this_week', {}, 'This Week'),
    month: t('common.this_month', {}, 'This Month'),
    year: t('common.this_year', {}, 'This Year'),
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 size={24} />
            {t('nav.analytics', {}, 'Platform Analytics')}
          </h1>
          <p className="text-muted-foreground">{t('admin.analytics_desc', {}, 'Platform-wide usage statistics')}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {periods.map((p) => (
            <Button
              key={p}
              variant={period === p ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPeriod(p)}
            >
              {periodLabels[p]}
            </Button>
          ))}
          <Button
            variant="outline"
            size="sm"
            loading={exporting}
            onClick={() => handleExport('xlsx')}
          >
            <Download size={14} />
            XLSX
          </Button>
          <Button
            variant="outline"
            size="sm"
            loading={exporting}
            onClick={() => handleExport('csv')}
          >
            <Download size={14} />
            CSV
          </Button>
        </div>
      </div>

      {/* Overview stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: t('admin.total_users', {}, 'Total Users'), value: overview?.total_users, color: 'text-blue-500' },
          { label: t('admin.total_students', {}, 'Students'), value: overview?.total_students, color: 'text-green-500' },
          { label: t('admin.sessions_week', {}, 'Sessions (Week)'), value: overview?.total_sessions_week, color: 'text-purple-500' },
          { label: t('admin.new_users_week', {}, 'New Users (Week)'), value: overview?.new_users_week, color: 'text-orange-500' },
        ].map(({ label, value, color }) => (
          <Card key={label}>
            <CardContent className="p-4">
              <div className="text-xs text-muted-foreground">{label}</div>
              {loadingOverview ? (
                <Skeleton className="mt-2 h-8 w-20" />
              ) : (
                <div className={`mt-1 text-3xl font-black ${color}`}>{value?.toLocaleString() ?? '—'}</div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp size={16} />
              {t('analytics.daily_activity', {}, 'Daily Activity')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DailyActivityChart data={daily} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Globe size={16} />
              {t('analytics.by_language', {}, 'Sessions by Language')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <LanguageBreakdownChart data={byLanguage} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 size={16} />
              {t('analytics.by_mode', {}, 'Sessions by Mode')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ModeBreakdownChart data={byMode} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp size={16} />
              {t('analytics.wpm_trend', {}, 'WPM Trend')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <WpmTrendChart data={daily} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
