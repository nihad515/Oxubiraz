'use client';

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Users, School, BarChart3, BookOpen, Trophy, Settings, Shield, FileText } from 'lucide-react';

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

interface AdminStats {
  total_users: number;
  active_users: number;
  total_students: number;
  total_teachers: number;
  total_schools: number;
  total_sessions_today: number;
  total_sessions_week: number;
  new_users_week: number;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

export function AdminDashboard() {
  const { t } = useString();
  const { user } = useAuthStore();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['analytics', 'admin-overview'],
    queryFn: () => apiClient.get<ApiResponse<AdminStats>>(API.analytics.overview),
    select: (d) => d.data,
  });

  const quickLinks = [
    { href: ROUTES.admin.users, icon: Users, label: t('nav.users', {}, 'Users'), color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-950/30' },
    { href: ROUTES.admin.schools, icon: School, label: t('nav.schools', {}, 'Schools'), color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-950/30' },
    { href: ROUTES.admin.strings, icon: FileText, label: t('nav.strings', {}, 'Strings'), color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-950/30' },
    { href: ROUTES.admin.roles, icon: Shield, label: t('nav.roles', {}, 'Roles'), color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-950/30' },
    { href: ROUTES.admin.analytics, icon: BarChart3, label: t('nav.analytics', {}, 'Analytics'), color: 'text-teal-500', bg: 'bg-teal-50 dark:bg-teal-950/30' },
    { href: ROUTES.admin.texts, icon: BookOpen, label: t('nav.texts', {}, 'Texts'), color: 'text-pink-500', bg: 'bg-pink-50 dark:bg-pink-950/30' },
    { href: ROUTES.admin.achievements, icon: Trophy, label: t('nav.achievements', {}, 'Achievements'), color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-950/30' },
    { href: ROUTES.admin.settings, icon: Settings, label: t('nav.settings', {}, 'Settings'), color: 'text-gray-500', bg: 'bg-gray-50 dark:bg-gray-950/30' },
  ];

  const statCards = [
    { label: t('admin.total_users', {}, 'Total Users'), value: stats?.total_users, icon: Users, color: 'text-blue-500' },
    { label: t('admin.active_users', {}, 'Active Users'), value: stats?.active_users, icon: Users, color: 'text-green-500' },
    { label: t('admin.total_students', {}, 'Students'), value: stats?.total_students, icon: Users, color: 'text-purple-500' },
    { label: t('admin.total_teachers', {}, 'Teachers'), value: stats?.total_teachers, icon: School, color: 'text-orange-500' },
    { label: t('admin.total_schools', {}, 'Schools'), value: stats?.total_schools, icon: School, color: 'text-teal-500' },
    { label: t('admin.sessions_today', {}, 'Sessions Today'), value: stats?.total_sessions_today, icon: BarChart3, color: 'text-red-500' },
    { label: t('admin.sessions_week', {}, 'Sessions This Week'), value: stats?.total_sessions_week, icon: BarChart3, color: 'text-yellow-500' },
    { label: t('admin.new_users_week', {}, 'New Users (Week)'), value: stats?.new_users_week, icon: Users, color: 'text-pink-500' },
  ];

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {t('dashboard.welcome', { name: user?.first_name ?? '' }, `Welcome, ${user?.first_name}!`)}
          </h1>
          <p className="text-muted-foreground">{t('dashboard.admin_subtitle', {}, 'Platform overview and management')}</p>
        </div>
        <Badge variant="secondary" className="text-sm px-3 py-1">
          {user?.roles?.[0] ?? 'Admin'}
        </Badge>
      </motion.div>

      {/* Stats grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Icon size={18} className={color} />
                <span className="text-xs text-muted-foreground">{label}</span>
              </div>
              {isLoading ? (
                <Skeleton className="mt-2 h-7 w-16" />
              ) : (
                <div className={`mt-1 text-2xl font-black ${color}`}>
                  {value?.toLocaleString() ?? '—'}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Quick links */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t('admin.quick_actions', {}, 'Quick Actions')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {quickLinks.map(({ href, icon: Icon, label, color, bg }) => (
                <Link
                  key={href}
                  href={href}
                  className={`flex flex-col items-center gap-2 rounded-xl p-4 ${bg} transition-all hover:scale-105 hover:shadow-sm`}
                >
                  <Icon size={24} className={color} />
                  <span className="text-xs font-medium text-center">{label}</span>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
