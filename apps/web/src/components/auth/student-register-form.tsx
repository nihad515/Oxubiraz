'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useString } from '@/hooks/use-string';
import { useAuth } from '@/hooks/use-auth';
import { studentRegisterSchema, type StudentRegisterInput } from '@/lib/validations/auth';
import apiClient from '@/lib/api/client';
import { API } from '@/lib/api/endpoints';
import type { ApiResponse } from '@/types/api';
import type { School, Class } from '@/types/school';

export function StudentRegisterForm() {
  const { t } = useString();
  const { register: registerUser, isRegistering } = useAuth();
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<StudentRegisterInput>({
    resolver: zodResolver(studentRegisterSchema),
    defaultValues: { role: 'student', locale: 'az' },
  });

  const schoolId = watch('school_id');

  const { data: schools } = useQuery({
    queryKey: ['schools', 'list'],
    queryFn: () => apiClient.get<ApiResponse<School[]>>(API.schools.list),
    select: (d) => d.data,
  });

  const { data: classes } = useQuery({
    queryKey: ['classes', schoolId],
    queryFn: () => apiClient.get<ApiResponse<Class[]>>(API.schools.classes(schoolId!)),
    enabled: !!schoolId,
    select: (d) => d.data,
  });

  const onSubmit = (data: StudentRegisterInput) => {
    registerUser(data as Parameters<typeof registerUser>[0]);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      {/* Name row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-sm font-medium">{t('profile.first_name', {}, 'First name')}</label>
          <Input
            placeholder="Əli"
            error={!!errors.first_name}
            {...register('first_name')}
          />
          {errors.first_name && (
            <p className="text-xs text-destructive">{t(errors.first_name.message ?? '')}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">{t('profile.last_name', {}, 'Last name')}</label>
          <Input
            placeholder="Həsənov"
            error={!!errors.last_name}
            {...register('last_name')}
          />
          {errors.last_name && (
            <p className="text-xs text-destructive">{t(errors.last_name.message ?? '')}</p>
          )}
        </div>
      </div>

      {/* Username */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium">{t('auth.username')}</label>
        <Input
          placeholder="ali_123"
          autoCapitalize="none"
          error={!!errors.username}
          {...register('username')}
        />
        {errors.username && (
          <p className="text-xs text-destructive">{t(errors.username.message ?? '')}</p>
        )}
      </div>

      {/* School */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium">{t('school.name', {}, 'School')}</label>
        <select
          className="flex h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          {...register('school_id', { valueAsNumber: true })}
        >
          <option value="">{t('school.select', {}, 'Select school')}</option>
          {schools?.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
        {errors.school_id && (
          <p className="text-xs text-destructive">{t('validation.required')}</p>
        )}
      </div>

      {/* Class */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium">{t('class.name', {}, 'Class')}</label>
        <select
          className="flex h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
          disabled={!schoolId}
          {...register('class_id', { valueAsNumber: true })}
        >
          <option value="">{t('class.select', {}, 'Select class')}</option>
          {classes?.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Parent username */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-muted-foreground">
          {t('auth.parent_username', {}, 'Parent username (optional)')}
        </label>
        <Input
          placeholder="parent_username"
          autoCapitalize="none"
          {...register('parent_username')}
        />
      </div>

      {/* Language */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium">{t('settings.language', {}, 'Language')}</label>
        <select
          className="flex h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          {...register('locale')}
        >
          <option value="az">🇦🇿 Azərbaycan</option>
          <option value="ru">🇷🇺 Русский</option>
          <option value="en">🇬🇧 English</option>
        </select>
      </div>

      {/* Password */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium">{t('auth.password')}</label>
        <div className="relative">
          <Input
            type={showPwd ? 'text' : 'password'}
            placeholder="••••••••"
            error={!!errors.password}
            className="pr-10"
            {...register('password')}
          />
          <button
            type="button"
            onClick={() => setShowPwd((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          >
            {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {errors.password && (
          <p className="text-xs text-destructive">{t(errors.password.message ?? '')}</p>
        )}
      </div>

      {/* Confirm password */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium">
          {t('auth.confirm_password', {}, 'Confirm password')}
        </label>
        <div className="relative">
          <Input
            type={showConfirmPwd ? 'text' : 'password'}
            placeholder="••••••••"
            error={!!errors.password_confirmation}
            className="pr-10"
            {...register('password_confirmation')}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPwd((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          >
            {showConfirmPwd ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {errors.password_confirmation && (
          <p className="text-xs text-destructive">
            {t(errors.password_confirmation.message ?? '')}
          </p>
        )}
      </div>

      <Button type="submit" className="w-full" size="lg" loading={isRegistering}>
        {t('auth.register')}
      </Button>
    </form>
  );
}
