'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { GraduationCap, Users, ChevronRight, Search } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useString } from '@/hooks/use-string';
import { useAuthStore } from '@/store/auth-store';
import apiClient from '@/lib/api/client';
import { API } from '@/lib/api/endpoints';

interface SchoolClass {
  id: number;
  name: string;
  grade: number;
  school_id: number;
  students_count?: number;
}

interface Student {
  id: number;
  first_name: string;
  last_name: string;
  username: string;
  level: number;
  xp: number;
  streak_days: number;
  avatar_url: string | null;
}

function ClassStudents({ classId }: { classId: number }) {
  const { t } = useString();
  const [search, setSearch] = useState('');

  const { data: students, isLoading } = useQuery({
    queryKey: ['class-students', classId],
    queryFn: () => apiClient.get(API.classes.students(classId)),
    select: (d: any) => d.data as Student[],
  });

  const filtered = (students ?? []).filter(s =>
    `${s.first_name} ${s.last_name} ${s.username}`.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="mt-4 space-y-3 border-t pt-4">
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-9 h-8 text-sm"
          placeholder={t('common.search', {}, 'Search students...')}
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12" />)}
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4 text-center">
          {t('teacher.no_students', {}, 'No students found.')}
        </p>
      ) : (
        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {filtered.map(student => (
            <div key={student.id} className="flex items-center gap-3 rounded-lg border p-2.5">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs bg-primary/10 text-primary">
                  {student.first_name[0]}{student.last_name[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{student.first_name} {student.last_name}</p>
                <p className="text-xs text-muted-foreground">@{student.username}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Badge variant="outline" className="text-xs">Lv {student.level}</Badge>
                <span className="text-xs text-muted-foreground">{student.xp} XP</span>
                {student.streak_days > 0 && (
                  <span className="text-xs text-orange-500">🔥{student.streak_days}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function TeacherClassesPage() {
  const { t } = useString();
  const user = useAuthStore(s => s.user);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const { data: classes, isLoading } = useQuery({
    queryKey: ['teacher-classes', user?.school_id],
    queryFn: () => apiClient.get(
      user?.school_id
        ? `/classes/by-school?school_id=${user.school_id}`
        : '/classes/by-school',
    ),
    select: (d: any) => d.data as SchoolClass[],
    enabled: !!user,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <GraduationCap size={24} />
          {t('nav.classes', {}, 'Classes')}
        </h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          {t('teacher.classes_desc', {}, 'View students in your school by class.')}
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
        </div>
      ) : !classes?.length ? (
        <Card>
          <CardContent className="py-16 text-center">
            <GraduationCap size={40} className="mx-auto mb-3 text-muted-foreground/30" />
            <p className="text-muted-foreground">{t('teacher.no_classes', {}, 'No classes found.')}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {classes.map((cls, i) => (
            <motion.div
              key={cls.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <Card
                className="cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => setExpandedId(expandedId === cls.id ? null : cls.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <GraduationCap size={20} className="text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold">{cls.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {t('teacher.grade', {}, 'Grade')} {cls.grade}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {cls.students_count !== undefined && (
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <Users size={14} />
                          {cls.students_count}
                        </div>
                      )}
                      <ChevronRight
                        size={16}
                        className={`text-muted-foreground transition-transform duration-200 ${expandedId === cls.id ? 'rotate-90' : ''}`}
                      />
                    </div>
                  </div>

                  {expandedId === cls.id && <ClassStudents classId={cls.id} />}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
