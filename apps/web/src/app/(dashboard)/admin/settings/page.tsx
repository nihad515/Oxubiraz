'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Settings, Save } from 'lucide-react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { useEffect } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useString } from '@/hooks/use-string';
import apiClient from '@/lib/api/client';
import { API } from '@/lib/api/endpoints';

interface AppSettings {
  max_file_size_mb: number;
  allowed_game_modes: string[];
  maintenance_mode: boolean;
  registration_open: boolean;
  default_locale: string;
  sanctum_token_expiration: number;
  sanctum_token_expiration_remember: number;
}

export default function AdminSettingsPage() {
  const { t } = useString();
  const qc = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ['admin', 'settings'],
    queryFn: () => apiClient.get(API.settings.get),
    select: (d: any) => d.data as AppSettings,
  });

  const { register, handleSubmit, reset, watch, setValue } = useForm<AppSettings>();

  useEffect(() => {
    if (settings) reset(settings);
  }, [settings, reset]);

  const save = useMutation({
    mutationFn: (data: Partial<AppSettings>) => apiClient.patch(API.settings.update, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'settings'] });
      toast.success(t('common.saved', {}, 'Settings saved'));
    },
  });

  const gameModes = ['random_words', 'text_reading', 'sentence_reading', 'memory', 'ai'];
  const allowedModes = watch('allowed_game_modes') ?? [];

  const toggleMode = (mode: string) => {
    const current = allowedModes;
    setValue(
      'allowed_game_modes',
      current.includes(mode) ? current.filter(m => m !== mode) : [...current, mode]
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Settings size={24} />
          {t('nav.settings', {}, 'Platform Settings')}
        </h1>
        <p className="text-muted-foreground">{t('admin.settings_desc', {}, 'Configure global platform behavior')}</p>
      </div>

      <form onSubmit={handleSubmit((d) => save.mutate(d))} className="space-y-6">

        {/* Platform */}
        <Card>
          <CardHeader><CardTitle className="text-base">{t('admin.platform', {}, 'Platform')}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <div className="font-medium">{t('admin.maintenance_mode', {}, 'Maintenance Mode')}</div>
                <div className="text-sm text-muted-foreground">{t('admin.maintenance_mode_desc', {}, 'Disable access for all non-admin users')}</div>
              </div>
              <input type="checkbox" {...register('maintenance_mode')} className="h-5 w-5 rounded" />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <div className="font-medium">{t('admin.registration_open', {}, 'Open Registration')}</div>
                <div className="text-sm text-muted-foreground">{t('admin.registration_open_desc', {}, 'Allow new users to register')}</div>
              </div>
              <input type="checkbox" {...register('registration_open')} className="h-5 w-5 rounded" />
            </div>
          </CardContent>
        </Card>

        {/* Game */}
        <Card>
          <CardHeader><CardTitle className="text-base">{t('admin.game_settings', {}, 'Game Settings')}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">{t('admin.allowed_game_modes', {}, 'Allowed Game Modes')}</label>
              <div className="mt-2 flex flex-wrap gap-2">
                {gameModes.map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => toggleMode(mode)}
                    className={`rounded-lg px-3 py-1.5 text-sm font-medium border transition-colors ${
                      allowedModes.includes(mode)
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-background text-muted-foreground border-border'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">{t('admin.default_locale', {}, 'Default Language')}</label>
              <select {...register('default_locale')} className="flex h-11 w-full max-w-xs rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="az">🇦🇿 Azərbaycan</option>
                <option value="ru">🇷🇺 Русский</option>
                <option value="en">🇬🇧 English</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* File uploads */}
        <Card>
          <CardHeader><CardTitle className="text-base">{t('admin.file_settings', {}, 'File Uploads')}</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">{t('admin.max_file_size', {}, 'Max File Size (MB)')}</label>
              <input
                type="number"
                {...register('max_file_size_mb', { valueAsNumber: true })}
                min={1}
                max={100}
                className="flex h-11 w-32 rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
          </CardContent>
        </Card>

        {/* Auth */}
        <Card>
          <CardHeader><CardTitle className="text-base">{t('admin.auth_settings', {}, 'Authentication')}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">{t('admin.token_expiry', {}, 'Session Token Expiry (minutes)')}</label>
              <input
                type="number"
                {...register('sanctum_token_expiration', { valueAsNumber: true })}
                min={60}
                className="flex h-11 w-40 rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">{t('admin.token_expiry_remember', {}, '"Remember Me" Token Expiry (minutes)')}</label>
              <input
                type="number"
                {...register('sanctum_token_expiration_remember', { valueAsNumber: true })}
                min={1440}
                className="flex h-11 w-40 rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
          </CardContent>
        </Card>

        <Button type="submit" loading={save.isPending}>
          <Save size={16} />
          {t('common.save', {}, 'Save Settings')}
        </Button>
      </form>
    </div>
  );
}
