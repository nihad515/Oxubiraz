'use client';

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Users, BarChart3, BookOpen, Trophy, TrendingUp, Star } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthStore } from '@/store/auth-store';
import { useString } from '@/hooks/use-string';
import { ROUTES } from '@/config/routes';
import apiClient from '@/lib/api/client';
import { API } from '@/lib/api/endpoints';
import type { ApiResponse } from '@/types/api';
import { formatWpm } from '@/lib/utils/format';

interface TeacherStats {
  total_students: number;
  active_students_today: number;
  class_avg_wpm: number;
  class_best_wpm: number;
  total_sessions_today: number;
  total_sessions_week: number;
  top_students: Array<{ id: number; name: string; xp: number; level: number; wpm: number }>;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

export function TeacherDashboard() {
  const { t } = useString();
  const { user } = useAuthStore();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['analytics', 'teacher-overview'],
    queryFn: () => apiClient.get<ApiResponse<TeacherStats>>(API.analytics.overview),
    select: (d) => d.data,
  });

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {t('dashboard.welcome', { name: user?.first_name ?? '' }, `Welcome, ${user?.first_name}!`)}
          </h1>
          <p className="text-muted-foreground">{t('dashboard.teacher_subtitle', {}, "Your students' progress overview")}</p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href={ROUTES.teacher.analytics}>
            <BarChart3 size={16} />
            {t('nav.analytics', {}, 'Analytics')}
          </Link>
        </Button>
      </motion.div>

      {/* Stats grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {[
          { icon: <Users size={20} className="text-blue-500" />, value: stats?.total_students, label: t('teacher.total_students', {}, 'Total Students'), color: 'text-blue-500' },
          { icon: <Star size={20} className="text-green-500" />, value: stats?.active_students_today, label: t('teacher.active_today', {}, 'Active Today'), color: 'text-green-500' },
          { icon: <TrendingUp size={20} className="text-purple-500" />, value: stats?.class_avg_wpm ? formatWpm(stats.class_avg_wpm) : null, label: t('analytics.avg_wpm', {}, 'Avg WPM'), color: 'text-purple-500' },
          { icon: <Trophy size={20} className="text-yellow-500" />, value: stats?.class_best_wpm ? formatWpm(stats.class_best_wpm) : null, label: t('analytics.best_wpm', {}, 'Best WPM'), color: 'text-yellow-500' },
          { icon: <BarChart3 size={20} className="text-orange-500" />, value: stats?.total_sessions_today, label: t('teacher.sessions_today', {}, 'Sessions Today'), color: 'text-orange-500' },
          { icon: <BookOpen size={20} className="text-teal-500" />, value: stats?.total_sessions_week, label: t('teacher.sessions_week', {}, 'Sessions Week'), color: 'text-teal-500' },
        ].map(({ icon, value, label, color }) => (
          <Card key={label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                {icon}
                <span className="text-xs text-muted-foreground">{label}</span>
              </div>
              {isLoading ? (
                <Skeleton className="mt-2 h-7 w-20" />
              ) : (
                <div className={`mt-1 text-2xl font-black ${color}`}>{value ?? '—'}</div>
              )}
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Top students */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">{t('teacher.top_students', {}, 'Top Students')}</CardTitle>
              <Button asChild variant="ghost" size="sm">
                <Link href={ROUTES.teacher.students}>{t('common.view_all', {}, 'View All')}</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)
            ) : !stats?.top_students?.length ? (
              <div className="py-6 text-center text-muted-foreground">
                <Users size={32} className="mx-auto mb-2 opacity-30" />
                <p>{t('teacher.no_students', {}, 'No students yet.')}</p>
              </div>
            ) : (
              stats.top_students.map((student, i) => (
                <div key={student.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                      i === 0 ? 'bg-yellow-100 text-yellow-700' :
                      i === 1 ? 'bg-gray-100 text-gray-600' :
                      i === 2 ? 'bg-orange-100 text-orange-700' :
                      'bg-primary/10 text-primary'
                    }`}>
                      {i + 1}
                    </div>
                    <div>
                      <div className="text-sm font-medium">{student.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {t('gamification.level', {}, 'Level')} {student.level} · {student.xp} XP
                      </div>
                    </div>
                  </div>
                  <Badge variant="secondary">{formatWpm(student.wpm)} WPM</Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick links */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4 sm:hidden">
        <Button asChild variant="outline" className="h-16 flex-col gap-1">
          <Link href={ROUTES.teacher.students}>
            <Users size={20} />
            <span className="text-xs">{t('nav.students', {}, 'Students')}</span>
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-16 flex-col gap-1">
          <Link href={ROUTES.teacher.analytics}>
            <BarChart3 size={20} />
            <span className="text-xs">{t('nav.analytics', {}, 'Analytics')}</span>
          </Link>
        </Button>
      </motion.div>
    </motion.div>
  );
}
