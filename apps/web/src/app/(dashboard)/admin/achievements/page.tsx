'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Star, Plus, Pencil, Trash2, X, Save } from 'lucide-react';
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
import type { AchievementConditionType } from '@/types/gamification';

interface AdminAchievement {
  id: number;
  name_az: string;
  name_ru: string;
  name_en: string;
  description_az: string;
  description_ru: string;
  description_en: string;
  icon: string;
  xp_reward: number;
  condition_type: AchievementConditionType;
  condition_value: number;
  is_active: boolean;
}

const CONDITION_LABELS: Record<AchievementConditionType, string> = {
  wpm_reached: 'WPM Reached',
  sessions_completed: 'Sessions Completed',
  streak_days: 'Streak Days',
  words_read: 'Words Read',
  perfect_session: 'Perfect Session',
  language_mastery: 'Language Mastery',
  first_session: 'First Session',
  level_reached: 'Level Reached',
};

const CONDITION_TYPES = Object.keys(CONDITION_LABELS) as AchievementConditionType[];

const schema = z.object({
  name_az: z.string().min(2).max(255),
  name_ru: z.string().min(2).max(255),
  name_en: z.string().min(2).max(255),
  description_az: z.string().min(2),
  description_ru: z.string().min(2),
  description_en: z.string().min(2),
  icon: z.string().min(1).max(100),
  xp_reward: z.number().int().min(0),
  condition_type: z.enum(CONDITION_TYPES as [AchievementConditionType, ...AchievementConditionType[]]),
  condition_value: z.number().int().min(1),
  is_active: z.boolean(),
});

type FormInput = z.infer<typeof schema>;
type LangTab = 'az' | 'ru' | 'en';

const DEFAULT_VALUES: Partial<FormInput> = {
  is_active: true,
  xp_reward: 100,
  condition_value: 1,
  condition_type: 'sessions_completed',
  icon: '🏆',
};

export default function AdminAchievementsPage() {
  const { t } = useString();
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<AdminAchievement | null>(null);
  const [langTab, setLangTab] = useState<LangTab>('az');

  const { data: achievements, isLoading } = useQuery({
    queryKey: ['admin', 'achievements'],
    queryFn: () => apiClient.get(API.achievements.adminList),
    select: (d: any) => d.data as AdminAchievement[],
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormInput>({
    resolver: zodResolver(schema),
    defaultValues: DEFAULT_VALUES,
  });

  const save = useMutation({
    mutationFn: (data: FormInput) => editing
      ? apiClient.patch(API.achievements.update(editing.id), data)
      : apiClient.post(API.achievements.create, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'achievements'] });
      toast.success(t('common.saved', {}, 'Saved'));
      setShowForm(false);
      setEditing(null);
      reset(DEFAULT_VALUES);
    },
    onError: () => toast.error(t('common.error', {}, 'Error saving')),
  });

  const del = useMutation({
    mutationFn: (id: number) => apiClient.delete(API.achievements.delete(id)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'achievements'] });
      toast.success(t('common.deleted', {}, 'Deleted'));
    },
  });

  const openEdit = (a: AdminAchievement) => {
    setEditing(a);
    reset({
      name_az: a.name_az,
      name_ru: a.name_ru,
      name_en: a.name_en,
      description_az: a.description_az,
      description_ru: a.description_ru,
      description_en: a.description_en,
      icon: a.icon,
      xp_reward: a.xp_reward,
      condition_type: a.condition_type,
      condition_value: a.condition_value,
      is_active: a.is_active,
    });
    setLangTab('az');
    setShowForm(true);
  };

  const openCreate = () => {
    setEditing(null);
    reset(DEFAULT_VALUES);
    setLangTab('az');
    setShowForm(true);
  };

  const LANG_TABS: LangTab[] = ['az', 'ru', 'en'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Star size={24} />
            {t('nav.achievements', {}, 'Achievements')}
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {t('admin.achievements_desc', {}, 'Create and manage achievement badges')}
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus size={16} />
          {t('common.add', {}, 'New Achievement')}
        </Button>
      </div>

      {showForm && (
        <Card className="border-2 border-primary/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">
                {editing ? t('common.edit', {}, 'Edit') : t('common.add', {}, 'New Achievement')}
              </CardTitle>
              <Button variant="ghost" size="icon-sm" onClick={() => setShowForm(false)}>
                <X size={16} />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit((d) => save.mutate(d))} className="space-y-4">
              {/* Language tabs */}
              <div className="flex gap-1 rounded-lg bg-muted p-1 w-fit">
                {LANG_TABS.map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => setLangTab(lang)}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                      langTab === lang
                        ? 'bg-background shadow-sm text-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {lang.toUpperCase()}
                  </button>
                ))}
              </div>

              {/* Multilingual fields */}
              {LANG_TABS.map((lang) => (
                <div key={lang} className={lang === langTab ? 'space-y-3' : 'hidden'}>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">
                      {t('common.name', {}, 'Name')} ({lang.toUpperCase()})
                    </label>
                    <Input
                      {...register(`name_${lang}` as keyof FormInput)}
                      error={!!(errors as any)[`name_${lang}`]}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">
                      {t('common.description', {}, 'Description')} ({lang.toUpperCase()})
                    </label>
                    <Input
                      {...register(`description_${lang}` as keyof FormInput)}
                      error={!!(errors as any)[`description_${lang}`]}
                    />
                  </div>
                </div>
              ))}

              {/* Common fields */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">
                    {t('achievements.icon', {}, 'Icon')} (emoji)
                  </label>
                  <Input {...register('icon')} placeholder="🏆" error={!!errors.icon} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">
                    {t('achievements.xp_reward', {}, 'XP Reward')}
                  </label>
                  <Input
                    {...register('xp_reward', { valueAsNumber: true })}
                    type="number"
                    min={0}
                    error={!!errors.xp_reward}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">
                    {t('achievements.condition_type', {}, 'Condition')}
                  </label>
                  <select
                    {...register('condition_type')}
                    className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    {CONDITION_TYPES.map((ct) => (
                      <option key={ct} value={ct}>{CONDITION_LABELS[ct]}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">
                    {t('achievements.condition_value', {}, 'Value')}
                  </label>
                  <Input
                    {...register('condition_value', { valueAsNumber: true })}
                    type="number"
                    min={1}
                    error={!!errors.condition_value}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  {...register('is_active')}
                  className="h-4 w-4 rounded border-input"
                />
                <label htmlFor="is_active" className="text-sm">
                  {t('common.active', {}, 'Active')}
                </label>
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

      <div className="space-y-2">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)
        ) : !achievements?.length ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <Star size={40} className="mx-auto mb-3 opacity-20" />
              <p>{t('admin.no_achievements', {}, 'No achievements yet. Create the first one!')}</p>
            </CardContent>
          </Card>
        ) : (
          achievements.map((a) => (
            <Card key={a.id}>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="text-2xl shrink-0 w-8 text-center">{a.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold truncate">{a.name_en}</span>
                      <Badge
                        variant={a.is_active ? 'success' : 'secondary'}
                        className="text-xs shrink-0"
                      >
                        {a.is_active ? t('common.active', {}, 'Active') : t('common.inactive', {}, 'Inactive')}
                      </Badge>
                      <Badge variant="outline" className="text-xs shrink-0">{a.xp_reward} XP</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {CONDITION_LABELS[a.condition_type]}: {a.condition_value}
                    </p>
                    <p className="text-xs text-muted-foreground/60 mt-0.5 italic truncate">
                      {a.description_en}
                    </p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button variant="ghost" size="icon-sm" onClick={() => openEdit(a)}>
                      <Pencil size={14} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => {
                        if (confirm(t('common.confirm_delete', {}, 'Delete this achievement?'))) {
                          del.mutate(a.id);
                        }
                      }}
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
    </div>
  );
}
