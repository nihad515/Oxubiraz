'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { School, Search, Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { useString } from '@/hooks/use-string';
import apiClient from '@/lib/api/client';
import { API } from '@/lib/api/endpoints';
import type { ApiResponse, PaginatedResponse } from '@/types/api';

interface School {
  id: number;
  name: string;
  city: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  is_active: boolean;
  classes_count?: number;
  students_count?: number;
}

export default function AdminSchoolsPage() {
  const { t } = useString();
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'schools', page, search],
    queryFn: () => {
      const params = new URLSearchParams({ page: String(page), per_page: '15' });
      if (search) params.set('filter[name]', search);
      return apiClient.get<PaginatedResponse<School[]>>(`${API.schools.list}?${params}`);
    },
  });

  const deleteSchool = useMutation({
    mutationFn: (id: number) => apiClient.delete(`${API.schools.list}/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'schools'] });
      toast.success(t('common.deleted', {}, 'Deleted'));
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <School size={24} />
            {t('nav.schools', {}, 'Schools')}
          </h1>
          <p className="text-muted-foreground">{t('admin.schools_desc', {}, 'Manage schools and classes')}</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t('common.search', {}, 'Search schools...')}
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}><CardContent className="p-4 space-y-2">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-1/3" />
            </CardContent></Card>
          ))
        ) : data?.data?.map((school: School) => (
          <Card key={school.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-semibold">{school.name}</div>
                  <div className="text-sm text-muted-foreground">{school.city}</div>
                </div>
                <Badge variant={school.is_active ? 'success' : 'destructive'}>
                  {school.is_active ? t('common.active') : t('common.inactive')}
                </Badge>
              </div>
              {school.email && <div className="text-xs text-muted-foreground">{school.email}</div>}
              <div className="flex gap-3 text-xs text-muted-foreground">
                <span>{school.classes_count ?? 0} {t('nav.classes', {}, 'classes')}</span>
                <span>{school.students_count ?? 0} {t('nav.students', {}, 'students')}</span>
              </div>
              <div className="flex gap-2 pt-1 border-t">
                <Button size="sm" variant="ghost" className="flex-1">
                  <Pencil size={14} />
                  {t('common.edit', {}, 'Edit')}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-destructive hover:text-destructive"
                  onClick={() => {
                    if (confirm(t('common.confirm_delete', {}, 'Are you sure?'))) {
                      deleteSchool.mutate(school.id);
                    }
                  }}
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {data?.meta && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            {t('common.total', {}, 'Total')}: {data.meta.total}
          </span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
              {t('common.prev', {}, 'Prev')}
            </Button>
            <span className="flex items-center px-2 text-sm">{page} / {data.meta.last_page}</span>
            <Button variant="outline" size="sm" disabled={page >= (data.meta.last_page ?? 1)} onClick={() => setPage(p => p + 1)}>
              {t('common.next', {}, 'Next')}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
