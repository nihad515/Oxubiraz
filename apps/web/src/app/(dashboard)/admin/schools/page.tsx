'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { School, Search, Plus, Pencil, Trash2, X, Save, Building2 } from 'lucide-react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { useString } from '@/hooks/use-string';
import apiClient from '@/lib/api/client';
import { API } from '@/lib/api/endpoints';
import type { PaginatedResponse } from '@/types/api';

interface SchoolRecord {
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

const schoolSchema = z.object({
  name: z.string().min(2).max(255),
  city: z.string().min(2).max(100),
  address: z.string().max(500).optional().nullable(),
  phone: z.string().max(20).optional().nullable(),
  email: z.string().email().max(255).optional().nullable().or(z.literal('')),
  is_active: z.boolean().optional(),
});

type SchoolInput = z.infer<typeof schoolSchema>;

export default function AdminSchoolsPage() {
  const { t } = useString();
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<SchoolRecord | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'schools', page, search],
    queryFn: () => {
      const params = new URLSearchParams({ page: String(page), per_page: '15' });
      if (search) params.set('filter[name]', search);
      return apiClient.get<PaginatedResponse<SchoolRecord[]>>(`${API.schools.list}?${params}`);
    },
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<SchoolInput>({
    resolver: zodResolver(schoolSchema),
    defaultValues: { is_active: true },
  });

  const save = useMutation({
    mutationFn: (data: SchoolInput) => editing
      ? apiClient.patch(API.schools.update(editing.id), data)
      : apiClient.post(API.schools.create, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'schools'] });
      toast.success(t('common.saved', {}, 'Saved'));
      setShowForm(false);
      setEditing(null);
      reset({ is_active: true });
    },
    onError: () => toast.error(t('common.error', {}, 'Error saving')),
  });

  const deleteSchool = useMutation({
    mutationFn: (id: number) => apiClient.delete(API.schools.delete(id)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'schools'] });
      toast.success(t('common.deleted', {}, 'Deleted'));
    },
  });

  const openCreate = () => {
    setEditing(null);
    reset({ is_active: true });
    setShowForm(true);
  };

  const openEdit = (school: SchoolRecord) => {
    setEditing(school);
    reset({
      name: school.name,
      city: school.city,
      address: school.address ?? '',
      phone: school.phone ?? '',
      email: school.email ?? '',
      is_active: school.is_active,
    });
    setShowForm(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <School size={24} />
            {t('nav.schools', {}, 'Schools')}
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {t('admin.schools_desc', {}, 'Manage schools and classes')}
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus size={16} />
          {t('common.add', {}, 'New School')}
        </Button>
      </div>

      {/* Create / Edit form */}
      {showForm && (
        <Card className="border-2 border-primary/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">
                {editing ? t('common.edit', {}, 'Edit School') : t('common.add', {}, 'New School')}
              </CardTitle>
              <Button variant="ghost" size="icon-sm" onClick={() => setShowForm(false)}>
                <X size={16} />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit((d) => save.mutate(d))} className="space-y-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">
                    {t('common.name', {}, 'School Name')} *
                  </label>
                  <Input {...register('name')} error={!!errors.name} placeholder="Bakı şəhər 1 saylı məktəb" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">
                    {t('common.city', {}, 'City')} *
                  </label>
                  <Input {...register('city')} error={!!errors.city} placeholder="Bakı" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">{t('common.address', {}, 'Address')}</label>
                  <Input {...register('address')} placeholder={t('common.optional', {}, 'Optional')} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">{t('common.phone', {}, 'Phone')}</label>
                  <Input {...register('phone')} placeholder="+994 12 345 67 89" />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-sm font-medium">{t('common.email', {}, 'Email')}</label>
                  <Input {...register('email')} type="email" error={!!errors.email} placeholder="school@edu.az" />
                </div>
              </div>

              {editing && (
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="school_active"
                    {...register('is_active')}
                    className="h-4 w-4 rounded border-input"
                  />
                  <label htmlFor="school_active" className="text-sm">
                    {t('common.active', {}, 'Active')}
                  </label>
                </div>
              )}

              <div className="flex gap-3">
                <Button type="submit" loading={save.isPending}>
                  <Save size={16} />
                  {t('common.save', {}, 'Save')}
                </Button>
                <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>
                  {t('common.cancel', {}, 'Cancel')}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Search */}
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

      {/* Schools grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4 space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-1/3" />
              </CardContent>
            </Card>
          ))
        ) : !data?.data?.length ? (
          <div className="sm:col-span-2 lg:col-span-3">
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <Building2 size={40} className="mx-auto mb-3 opacity-20" />
                <p>{t('admin.no_schools', {}, 'No schools yet.')}</p>
              </CardContent>
            </Card>
          </div>
        ) : (
          data.data.map((school: SchoolRecord) => (
            <Card key={school.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="font-semibold truncate">{school.name}</div>
                    <div className="text-sm text-muted-foreground">{school.city}</div>
                  </div>
                  <Badge variant={school.is_active ? 'success' : 'destructive'} className="shrink-0 text-xs">
                    {school.is_active ? t('common.active', {}, 'Active') : t('common.inactive', {}, 'Inactive')}
                  </Badge>
                </div>
                {school.email && (
                  <div className="text-xs text-muted-foreground truncate">{school.email}</div>
                )}
                {school.phone && (
                  <div className="text-xs text-muted-foreground">{school.phone}</div>
                )}
                <div className="flex gap-3 text-xs text-muted-foreground">
                  <span>{school.classes_count ?? 0} {t('nav.classes', {}, 'classes')}</span>
                  <span>{school.students_count ?? 0} {t('nav.students', {}, 'students')}</span>
                </div>
                <div className="flex gap-2 pt-1 border-t">
                  <Button size="sm" variant="ghost" className="flex-1" onClick={() => openEdit(school)}>
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
          ))
        )}
      </div>

      {/* Pagination */}
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
