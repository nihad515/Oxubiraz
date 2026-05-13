'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BookOpen, Search, Plus, Pencil, Trash2, X, Save } from 'lucide-react';
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
import type { PaginatedResponse } from '@/types/api';

interface ReadingText {
  id: number;
  title: string;
  content: string;
  language: string;
  difficulty: string;
  age_group: string;
  word_count: number;
  is_active: boolean;
  tags?: string[];
}

const textSchema = z.object({
  title: z.string().min(2).max(255),
  content: z.string().min(10),
  language: z.enum(['az', 'ru', 'en']),
  difficulty: z.enum(['beginner', 'elementary', 'intermediate', 'advanced', 'expert']),
  age_group: z.enum(['5-7', '8-10', '11-13', '14-16', '16+']),
  is_active: z.boolean().optional(),
});

type TextInput = z.infer<typeof textSchema>;

export default function AdminTextsPage() {
  const { t } = useString();
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editingText, setEditingText] = useState<ReadingText | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'texts', page, search],
    queryFn: () => {
      const params = new URLSearchParams({ page: String(page), per_page: '15' });
      if (search) params.set('filter[title]', search);
      return apiClient.get<PaginatedResponse<ReadingText[]>>(`${API.texts.list}?${params}`);
    },
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<TextInput>({
    resolver: zodResolver(textSchema),
    defaultValues: { language: 'az', difficulty: 'beginner', age_group: '8-10', is_active: true },
  });

  const save = useMutation({
    mutationFn: (data: TextInput) => editingText
      ? apiClient.patch(`${API.texts.list}/${editingText.id}`, data)
      : apiClient.post(API.texts.list, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'texts'] });
      toast.success(t('common.saved', {}, 'Saved'));
      setShowForm(false);
      setEditingText(null);
      reset();
    },
  });

  const deleteText = useMutation({
    mutationFn: (id: number) => apiClient.delete(`${API.texts.list}/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'texts'] });
      toast.success(t('common.deleted', {}, 'Deleted'));
    },
  });

  const openEdit = (text: ReadingText) => {
    setEditingText(text);
    reset({ title: text.title, content: text.content, language: text.language as any, difficulty: text.difficulty as any, age_group: text.age_group as any, is_active: text.is_active });
    setShowForm(true);
  };

  const difficultyColors: Record<string, string> = {
    beginner: 'success', elementary: 'info', intermediate: 'warning', advanced: 'destructive', expert: 'gold',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BookOpen size={24} />
            {t('nav.texts', {}, 'Reading Texts')}
          </h1>
          <p className="text-muted-foreground">{t('admin.texts_desc', {}, 'Manage reading passages for the game')}</p>
        </div>
        <Button onClick={() => { setEditingText(null); reset(); setShowForm(true); }}>
          <Plus size={16} />
          {t('common.add', {}, 'Add Text')}
        </Button>
      </div>

      {/* Form panel */}
      {showForm && (
        <Card className="border-2 border-primary/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">
                {editingText ? t('common.edit', {}, 'Edit Text') : t('common.add', {}, 'New Text')}
              </CardTitle>
              <Button variant="ghost" size="icon-sm" onClick={() => setShowForm(false)}><X size={16} /></Button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit((d) => save.mutate(d))} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">{t('common.title', {}, 'Title')}</label>
                <Input {...register('title')} error={!!errors.title} />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">{t('common.language', {}, 'Language')}</label>
                  <select {...register('language')} className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                    <option value="az">Azərbaycan</option>
                    <option value="ru">Русский</option>
                    <option value="en">English</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">{t('common.difficulty', {}, 'Difficulty')}</label>
                  <select {...register('difficulty')} className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                    {['beginner', 'elementary', 'intermediate', 'advanced', 'expert'].map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">{t('common.age_group', {}, 'Age Group')}</label>
                  <select {...register('age_group')} className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                    {['5-7', '8-10', '11-13', '14-16', '16+'].map(a => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">{t('common.content', {}, 'Content')}</label>
                <textarea
                  {...register('content')}
                  rows={8}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-y focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder={t('admin.text_content_placeholder', {}, 'Enter the reading passage...')}
                />
                {errors.content && <p className="text-xs text-destructive">{errors.content.message}</p>}
              </div>
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
              placeholder={t('common.search', {}, 'Search texts...')}
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* Texts list */}
      <div className="space-y-3">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)
        ) : !data?.data?.length ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <BookOpen size={40} className="mx-auto mb-3 opacity-20" />
              <p>{t('admin.no_texts', {}, 'No texts yet. Add the first one!')}</p>
            </CardContent>
          </Card>
        ) : (
          data.data.map((text: ReadingText) => (
            <Card key={text.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold">{text.title}</span>
                      <Badge variant={(difficultyColors[text.difficulty] as any) ?? 'secondary'} className="text-xs">{text.difficulty}</Badge>
                      <Badge variant="secondary" className="text-xs">{text.language.toUpperCase()}</Badge>
                      <Badge variant="secondary" className="text-xs">{text.age_group}</Badge>
                      {!text.is_active && <Badge variant="destructive" className="text-xs">{t('common.inactive', {}, 'Inactive')}</Badge>}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{text.content}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{text.word_count} {t('game.words', {}, 'words')}</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button variant="ghost" size="icon-sm" onClick={() => openEdit(text)}><Pencil size={14} /></Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => confirm(t('common.confirm_delete', {}, 'Delete this text?')) && deleteText.mutate(text.id)}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {data?.meta && data.meta.last_page > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">{t('common.total', {}, 'Total')}: {data.meta.total}</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>{t('common.prev', {}, 'Prev')}</Button>
            <span className="flex items-center px-2 text-sm">{page} / {data.meta.last_page}</span>
            <Button variant="outline" size="sm" disabled={page >= data.meta.last_page} onClick={() => setPage(p => p + 1)}>{t('common.next', {}, 'Next')}</Button>
          </div>
        </div>
      )}
    </div>
  );
}
