'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Users, Search, BarChart3 } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useString } from '@/hooks/use-string';
import apiClient from '@/lib/api/client';
import { API } from '@/lib/api/endpoints';
import { formatWpm, calculateXpToNextLevel } from '@/lib/utils/format';
import { LEVEL_THRESHOLDS } from '@/types/gamification';
import type { PaginatedResponse } from '@/types/api';
import type { User } from '@/types/auth';

export default function TeacherStudentsPage() {
  const { t } = useString();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['teacher', 'students', page, search],
    queryFn: () => {
      const params = new URLSearchParams({
        page: String(page),
        per_page: '20',
        'filter[role]': 'student',
      });
      if (search) params.set('filter[search]', search);
      return apiClient.get<PaginatedResponse<User[]>>(`${API.users.list}?${params}`);
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users size={24} />
            {t('nav.students', {}, 'My Students')}
          </h1>
          <p className="text-muted-foreground">{t('teacher.students_desc', {}, 'Monitor your students\' progress')}</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t('common.search', {}, 'Search students...')}
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        {isLoading ? (
          Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-40 w-full" />)
        ) : !data?.data?.length ? (
          <div className="col-span-2">
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <Users size={40} className="mx-auto mb-3 opacity-20" />
                <p>{t('teacher.no_students', {}, 'No students found.')}</p>
              </CardContent>
            </Card>
          </div>
        ) : (
          data.data.map((student: User) => {
            const xpInfo = calculateXpToNextLevel(student.xp ?? 0, LEVEL_THRESHOLDS);
            return (
              <Card key={student.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold">{student.first_name} {student.last_name}</div>
                      <div className="text-xs text-muted-foreground">@{student.username}</div>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-sm font-black text-primary-foreground">
                      {student.level}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{t('gamification.level', {}, 'Level')} {student.level}</span>
                      <span>{xpInfo.xpInLevel} / {xpInfo.xpNeeded} XP</span>
                    </div>
                    <Progress value={xpInfo.progress} className="h-1.5" indicatorClassName="bg-gradient-to-r from-brand-400 to-brand-600" />
                  </div>

                  <div className="flex gap-2">
                    <Badge variant={student.is_active ? 'success' : 'destructive'} className="text-xs">
                      {student.is_active ? t('common.active') : t('common.inactive')}
                    </Badge>
                    {(student.streak_days ?? 0) > 0 && (
                      <Badge variant="warning" className="text-xs">🔥 {student.streak_days}d</Badge>
                    )}
                  </div>

                  <Button asChild variant="ghost" size="sm" className="w-full">
                    <a href={`/teacher/students/${student.id}`}>
                      <BarChart3 size={14} />
                      {t('teacher.view_progress', {}, 'View Progress')}
                    </a>
                  </Button>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {data?.meta && data.meta.last_page > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            {t('common.total', {}, 'Total')}: {data.meta.total}
          </span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
              {t('common.prev', {}, 'Prev')}
            </Button>
            <span className="flex items-center px-2 text-sm">{page} / {data.meta.last_page}</span>
            <Button variant="outline" size="sm" disabled={page >= data.meta.last_page} onClick={() => setPage(p => p + 1)}>
              {t('common.next', {}, 'Next')}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
