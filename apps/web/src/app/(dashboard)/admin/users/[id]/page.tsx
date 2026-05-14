'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, TrendingUp, BarChart3, Flame, FileDown, Loader2, ToggleLeft, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { useString } from '@/hooks/use-string';
import { useStringStore } from '@/store/string-store';
import apiClient from '@/lib/api/client';
import { API } from '@/lib/api/endpoints';
import { WpmTrendChart } from '@/components/analytics/wpm-trend-chart';
import { LanguageBreakdownChart } from '@/components/analytics/language-breakdown-chart';
import { ModeBreakdownChart } from '@/components/analytics/mode-breakdown-chart';
import { formatWpm, formatNumber, calculateXpToNextLevel } from '@/lib/utils/format';
import { LEVEL_THRESHOLDS } from '@/types/gamification';
import type { User } from '@/types/auth';

const ROLE_COLORS: Record<string, string> = {
  super_admin: 'gold',
  admin: 'warning',
  teacher: 'info',
  student: 'success',
  parent: 'secondary',
};

export default function AdminUserDetailPage() {
  const { t } = useString();
  const { locale } = useStringStore();
  const router = useRouter();
  const qc = useQueryClient();
  const { id } = useParams<{ id: string }>();
  const [downloading, setDownloading] = useState(false);

  const { data: user, isLoading: loadingUser } = useQuery({
    queryKey: ['admin', 'user', id],
    queryFn: () => apiClient.get<{ data: User }>(API.users.show(Number(id))),
    select: (d: any) => d.data as User,
  });

  const isStudent = user?.roles?.includes('student') ?? false;

  const { data: analytics, isLoading: loadingAnalytics } = useQuery({
    queryKey: ['admin', 'user-analytics', id],
    queryFn: () => apiClient.get(API.analytics.student(Number(id))),
    select: (d: any) => d.data,
    enabled: isStudent,
  });

  const toggleActive = useMutation({
    mutationFn: () => apiClient.post(`${API.users.list}/${id}/toggle-active`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'user', id] });
      qc.invalidateQueries({ queryKey: ['admin', 'users'] });
      toast.success(t('common.updated', {}, 'Updated'));
    },
  });

  const downloadPdf = async () => {
    if (downloading || !isStudent) return;
    setDownloading(true);
    try {
      const response = await apiClient.axios.get(
        API.analytics.studentReport(Number(id)),
        { params: { lang: locale }, responseType: 'blob' },
      );
      const url = URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `student-progress-${user?.username ?? id}-${new Date().toISOString().slice(0, 10)}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  };

  if (loadingUser) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-40 w-full" />
        <div className="grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-64" /><Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-muted-foreground">{t('admin.user_not_found', {}, 'User not found.')}</p>
        <Button variant="outline" className="mt-4" onClick={() => router.back()}>
          {t('common.go_back', {}, 'Go Back')}
        </Button>
      </div>
    );
  }

  const xpInfo = calculateXpToNextLevel(user.xp ?? 0, LEVEL_THRESHOLDS);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft size={18} />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{user.first_name} {user.last_name}</h1>
            <p className="text-sm text-muted-foreground">@{user.username} · {user.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {isStudent && (
            <Button
              variant="outline"
              size="sm"
              onClick={downloadPdf}
              disabled={downloading}
            >
              {downloading ? <Loader2 size={15} className="animate-spin" /> : <FileDown size={15} />}
              {downloading ? t('report.downloading', {}, 'Downloading...') : t('report.download_pdf', {}, 'Download PDF')}
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => toggleActive.mutate()}
            disabled={toggleActive.isPending}
          >
            <ToggleLeft size={15} />
            {user.is_active ? t('admin.deactivate', {}, 'Deactivate') : t('admin.activate', {}, 'Activate')}
          </Button>
        </div>
      </div>

      {/* Profile card */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="border-2 border-primary/10">
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-start gap-4 flex-wrap">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-md shrink-0">
                <span className="text-2xl font-black text-primary-foreground">{user.level}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  {user.roles?.map((role) => (
                    <Badge key={role} variant={(ROLE_COLORS[role] as any) ?? 'secondary'}>
                      {role}
                    </Badge>
                  ))}
                  <Badge variant={user.is_active ? 'success' : 'destructive'}>
                    {user.is_active ? t('common.active', {}, 'Active') : t('common.inactive', {}, 'Inactive')}
                  </Badge>
                  {(user.streak_days ?? 0) > 0 && (
                    <Badge variant="warning">
                      <Flame size={12} className="mr-1" />
                      {user.streak_days}d
                    </Badge>
                  )}
                </div>
                <div className="mt-2 space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{t('gamification.level', {}, 'Level')} {user.level} · {formatNumber(user.xp ?? 0)} XP</span>
                    <span>{Math.round(xpInfo.progress)}%</span>
                  </div>
                  <Progress value={xpInfo.progress} className="h-2" indicatorClassName="bg-gradient-to-r from-brand-400 to-brand-600" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
              {[
                { label: t('auth.username', {}, 'Username'), value: `@${user.username}` },
                { label: t('auth.email', {}, 'Email'), value: user.email },
                { label: t('auth.school', {}, 'School'), value: (user as any).school?.name ?? '—' },
                { label: t('common.joined', {}, 'Joined'), value: user.created_at ? new Date(user.created_at).toLocaleDateString() : '—' },
              ].map(({ label, value }) => (
                <div key={label} className="rounded-lg bg-muted/30 p-3">
                  <div className="text-xs text-muted-foreground">{label}</div>
                  <div className="mt-0.5 font-medium truncate">{value}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Analytics — students only */}
      {isStudent && (
        <>
          {loadingAnalytics ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <Skeleton className="h-64" /><Skeleton className="h-64" />
            </div>
          ) : analytics ? (
            <>
              {/* Summary stats */}
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  {[
                    { label: t('analytics.best_wpm', {}, 'Best WPM'), value: formatWpm(analytics.best_wpm), color: 'text-blue-500' },
                    { label: t('analytics.avg_wpm', {}, 'Avg WPM'), value: formatWpm(analytics.average_wpm), color: 'text-purple-500' },
                    { label: t('analytics.total_sessions', {}, 'Sessions'), value: analytics.total_sessions ?? 0, color: 'text-orange-500' },
                    { label: t('analytics.words_read', {}, 'Words Read'), value: formatNumber(analytics.total_words_read ?? 0), color: 'text-green-500' },
                  ].map(({ label, value, color }) => (
                    <Card key={label}>
                      <CardContent className="p-4">
                        <div className="text-xs text-muted-foreground">{label}</div>
                        <div className={`mt-1 text-2xl font-black ${color}`}>{value}</div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </motion.div>

              {/* Charts */}
              <div className="grid gap-6 lg:grid-cols-2">
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <TrendingUp size={16} />{t('analytics.wpm_trend', {}, 'WPM Trend')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent><WpmTrendChart data={analytics.wpm_trend} /></CardContent>
                  </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                  <Card>
                    <CardHeader><CardTitle className="text-base">{t('analytics.by_language', {}, 'By Language')}</CardTitle></CardHeader>
                    <CardContent><LanguageBreakdownChart data={analytics.by_language} /></CardContent>
                  </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="lg:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <BarChart3 size={16} />{t('analytics.by_mode', {}, 'By Game Mode')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent><ModeBreakdownChart data={analytics.by_mode} height={200} /></CardContent>
                  </Card>
                </motion.div>
              </div>
            </>
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                {t('analytics.no_data', {}, 'No session data available yet.')}
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Non-student placeholder */}
      {!isStudent && (
        <Card>
          <CardContent className="py-10 text-center">
            <Shield size={36} className="mx-auto mb-3 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">
              {t('admin.no_game_analytics', {}, 'Game analytics are only available for students.')}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
