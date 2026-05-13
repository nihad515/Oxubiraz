'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Trophy, Plus, Pencil, Trash2, Users, X, Save } from 'lucide-react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useString } from '@/hooks/use-string';
import apiClient from '@/lib/api/client';
import { API } from '@/lib/api/endpoints';
import { formatDateTime } from '@/lib/utils/format';
import type { PaginatedResponse } from '@/types/api';

interface Competition {
  id: number;
  name: string;
  description: string | null;
  language: string;
  status: string;
  starts_at: string;
  ends_at: string;
  max_participants: number | null;
  participants_count: number;
}

const compSchema = z.object({
  name: z.string().min(2).max(255),
  description: z.string().optional(),
  language: z.enum(['az', 'ru', 'en']),
  starts_at: z.string().min(1),
  ends_at: z.string().min(1),
  max_participants: z.number().positive().optional().nullable(),
});

type CompInput = z.infer<typeof compSchema>;

const statusColors: Record<string, string> = {
  draft: 'secondary', active: 'success', ended: 'outline', cancelled: 'destructive',
};

export default function AdminCompetitionsPage() {
  const { t } = useString();
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Competition | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'competitions', page],
    queryFn: () => apiClient.get<PaginatedResponse<Competition[]>>(`${API.competitions.list}?page=${page}&per_page=15`),
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CompInput>({
    resolver: zodResolver(compSchema),
    defaultValues: { language: 'az' },
  });

  const save = useMutation({
    mutationFn: (data: CompInput) => editing
      ? apiClient.patch(`${API.competitions.list}/${editing.id}`, data)
      : apiClient.post(API.competitions.list, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'competitions'] });
      toast.success(t('common.saved', {}, 'Saved'));
      setShowForm(false);
      setEditing(null);
      reset();
    },
  });

  const deleteComp = useMutation({
    mutationFn: (id: number) => apiClient.delete(`${API.competitions.list}/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'competitions'] });
      toast.success(t('common.deleted', {}, 'Deleted'));
    },
  });

  const openEdit = (comp: Competition) => {
    setEditing(comp);
    reset({
      name: comp.name,
      description: comp.description ?? '',
      language: comp.language as any,
      starts_at: comp.starts_at.slice(0, 16),
      ends_at: comp.ends_at.slice(0, 16),
      max_participants: comp.max_participants,
    });
    setShowForm(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Trophy size={24} />
            {t('nav.competitions', {}, 'Competitions')}
          </h1>
          <p className="text-muted-foreground">{t('admin.competitions_desc', {}, 'Create and manage reading competitions')}</p>
        </div>
        <Button onClick={() => { setEditing(null); reset(); setShowForm(true); }}>
          <Plus size={16} />
          {t('common.add', {}, 'New Competition')}
        </Button>
      </div>

      {showForm && (
        <Card className="border-2 border-primary/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">{editing ? t('common.edit') : t('common.add')} Competition</CardTitle>
              <Button variant="ghost" size="icon-sm" onClick={() => setShowForm(false)}><X size={16} /></Button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit((d) => save.mutate(d))} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">{t('common.name', {}, 'Name')}</label>
                <Input {...register('name')} error={!!errors.name} />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">{t('common.description', {}, 'Description')}</label>
                <Input {...register('description')} />
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">{t('common.language', {}, 'Language')}</label>
                  <select {...register('language')} className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                    <option value="az">AZ</option>
                    <option value="ru">RU</option>
                    <option value="en">EN</option>
                  </select>
                </div>
                <div className="space-y-1.5 col-span-1">
                  <label className="text-sm font-medium">{t('common.starts_at', {}, 'Start')}</label>
                  <Input {...register('starts_at')} type="datetime-local" error={!!errors.starts_at} />
                </div>
                <div className="space-y-1.5 col-span-1">
                  <label className="text-sm font-medium">{t('common.ends_at', {}, 'End')}</label>
                  <Input {...register('ends_at')} type="datetime-local" error={!!errors.ends_at} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">{t('competitions.max_participants', {}, 'Max Participants')}</label>
                  <Input {...register('max_participants', { valueAsNumber: true })} type="number" placeholder={t('common.unlimited', {}, 'Unlimited')} />
                </div>
              </div>
              <div className="flex gap-3">
                <Button type="submit" loading={save.isPending}><Save size={16} />{t('common.save', {}, 'Save')}</Button>
                <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>{t('common.cancel', {}, 'Cancel')}</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)
        ) : !data?.data?.length ? (
          <Card><CardContent className="py-12 text-center text-muted-foreground">
            <Trophy size={40} className="mx-auto mb-3 opacity-20" />
            <p>{t('admin.no_competitions', {}, 'No competitions yet.')}</p>
          </CardContent></Card>
        ) : (
          data.data.map((comp: Competition) => (
            <Card key={comp.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold">{comp.name}</span>
                      <Badge variant={(statusColors[comp.status] as any) ?? 'secondary'} className="text-xs">{comp.status}</Badge>
                      <Badge variant="secondary" className="text-xs">{comp.language.toUpperCase()}</Badge>
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {formatDateTime(comp.starts_at)} → {formatDateTime(comp.ends_at)}
                    </div>
                    <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                      <Users size={12} />
                      {comp.participants_count}{comp.max_participants ? ` / ${comp.max_participants}` : ''} {t('competitions.participants', {}, 'participants')}
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button variant="ghost" size="icon-sm" onClick={() => openEdit(comp)}><Pencil size={14} /></Button>
                    <Button variant="ghost" size="icon-sm" className="text-destructive hover:text-destructive"
                      onClick={() => confirm(t('common.confirm_delete', {}, 'Delete?')) && deleteComp.mutate(comp.id)}>
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
