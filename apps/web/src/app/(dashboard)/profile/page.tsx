'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { User, Camera, Lock, Globe, Shield, Bell } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/store/auth-store';
import { useString } from '@/hooks/use-string';
import { LocaleSwitcher } from '@/components/shared/locale-switcher';
import { PushToggle } from '@/components/notifications/push-permission-prompt';
import apiClient from '@/lib/api/client';
import { API } from '@/lib/api/endpoints';

const profileSchema = z.object({
  first_name: z.string().min(2).max(50),
  last_name: z.string().min(2).max(50),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().min(7).max(20).optional().or(z.literal('')),
});

const passwordSchema = z.object({
  current_password: z.string().min(8),
  password: z.string().min(8),
  password_confirmation: z.string(),
}).refine(d => d.password === d.password_confirmation, {
  message: 'Passwords do not match',
  path: ['password_confirmation'],
});

type ProfileInput = z.infer<typeof profileSchema>;
type PasswordInput = z.infer<typeof passwordSchema>;

export default function ProfilePage() {
  const { t } = useString();
  const { user, setUser } = useAuthStore();
  const qc = useQueryClient();

  const {
    register: registerProfile,
    handleSubmit: handleProfile,
    formState: { errors: profileErrors },
  } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: user?.first_name ?? '',
      last_name: user?.last_name ?? '',
      email: user?.email ?? '',
    },
  });

  const {
    register: registerPwd,
    handleSubmit: handlePwd,
    reset: resetPwd,
    formState: { errors: pwdErrors },
  } = useForm<PasswordInput>({ resolver: zodResolver(passwordSchema) });

  const updateProfile = useMutation({
    mutationFn: (data: ProfileInput) => apiClient.patch(API.users.me, data),
    onSuccess: (res) => {
      setUser(res.data);
      toast.success(t('common.saved', {}, 'Profile updated'));
    },
  });

  const updatePassword = useMutation({
    mutationFn: (data: PasswordInput) => apiClient.post(API.users.updatePassword, data),
    onSuccess: () => {
      toast.success(t('auth.password_updated', {}, 'Password updated'));
      resetPwd();
    },
    onError: () => toast.error(t('errors.invalid_password', {}, 'Current password is incorrect')),
  });

  const uploadAvatar = useMutation({
    mutationFn: (file: File) => {
      const form = new FormData();
      form.append('avatar', file);
      return apiClient.upload(API.users.avatar, form);
    },
    onSuccess: (res) => {
      if (user) setUser({ ...user, avatar_url: res.data.avatar_url });
      toast.success(t('common.uploaded', {}, 'Avatar updated'));
    },
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-2xl"
    >
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <User size={24} />
          {t('nav.profile', {}, 'Profile')}
        </h1>
        <p className="text-muted-foreground">{t('profile.desc', {}, 'Manage your account settings')}</p>
      </div>

      {/* Avatar */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary text-2xl font-black text-primary-foreground">
                {user?.first_name?.[0]}{user?.last_name?.[0]}
              </div>
              <label className="absolute bottom-0 right-0 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-background shadow-md border hover:bg-muted transition-colors">
                <Camera size={14} />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) uploadAvatar.mutate(file);
                  }}
                />
              </label>
            </div>
            <div>
              <div className="text-lg font-bold">{user?.first_name} {user?.last_name}</div>
              <div className="text-sm text-muted-foreground">@{user?.username}</div>
              <div className="mt-1 flex gap-2">
                {user?.roles?.map((role) => (
                  <Badge key={role} variant="secondary" className="text-xs">{role}</Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile info */}
      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><User size={16} />{t('profile.personal_info', {}, 'Personal Information')}</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleProfile((data) => updateProfile.mutate(data))} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">{t('auth.first_name', {}, 'First Name')}</label>
                <Input {...registerProfile('first_name')} error={!!profileErrors.first_name} />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">{t('auth.last_name', {}, 'Last Name')}</label>
                <Input {...registerProfile('last_name')} error={!!profileErrors.last_name} />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">{t('auth.email', {}, 'Email')}</label>
              <Input {...registerProfile('email')} type="email" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">{t('auth.phone', {}, 'Phone')}</label>
              <Input {...registerProfile('phone')} placeholder="+994 50 xxx xx xx" />
            </div>
            <Button type="submit" loading={updateProfile.isPending}>
              {t('common.save', {}, 'Save Changes')}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Language */}
      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Globe size={16} />{t('common.language', {}, 'Language')}</CardTitle></CardHeader>
        <CardContent>
          <LocaleSwitcher />
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Bell size={16} />{t('nav.notifications', {}, 'Notifications')}</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            {t('notifications.push_settings_desc', {}, 'Manage push notifications for achievements and milestones.')}
          </p>
          <PushToggle />
        </CardContent>
      </Card>

      {/* Password */}
      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Lock size={16} />{t('auth.change_password', {}, 'Change Password')}</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handlePwd((data) => updatePassword.mutate(data))} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">{t('auth.current_password', {}, 'Current Password')}</label>
              <Input {...registerPwd('current_password')} type="password" error={!!pwdErrors.current_password} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">{t('auth.new_password', {}, 'New Password')}</label>
              <Input {...registerPwd('password')} type="password" error={!!pwdErrors.password} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">{t('auth.password_confirmation', {}, 'Confirm Password')}</label>
              <Input {...registerPwd('password_confirmation')} type="password" error={!!pwdErrors.password_confirmation} />
              {pwdErrors.password_confirmation && (
                <p className="text-xs text-destructive">{pwdErrors.password_confirmation.message}</p>
              )}
            </div>
            <Button type="submit" variant="outline" loading={updatePassword.isPending}>
              {t('auth.change_password', {}, 'Change Password')}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Gamification stats */}
      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Shield size={16} />{t('gamification.stats', {}, 'My Stats')}</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="rounded-xl bg-muted/30 p-4">
              <div className="text-2xl font-black text-primary">{user?.level ?? 1}</div>
              <div className="text-xs text-muted-foreground mt-1">{t('gamification.level', {}, 'Level')}</div>
            </div>
            <div className="rounded-xl bg-muted/30 p-4">
              <div className="text-2xl font-black text-yellow-500">{user?.xp ?? 0}</div>
              <div className="text-xs text-muted-foreground mt-1">XP</div>
            </div>
            <div className="rounded-xl bg-muted/30 p-4">
              <div className="text-2xl font-black text-orange-500">{user?.streak_days ?? 0}</div>
              <div className="text-xs text-muted-foreground mt-1">{t('gamification.streak_days', {}, 'Streak')}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
