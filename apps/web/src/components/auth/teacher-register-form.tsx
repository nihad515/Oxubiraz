'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/use-auth';
import { useString } from '@/hooks/use-string';
import { teacherRegisterSchema, type TeacherRegisterInput } from '@/lib/validations/auth';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api/client';
import { API } from '@/lib/api/endpoints';
import type { ApiResponse } from '@/types/api';

interface School { id: number; name: string; city: string; }

export function TeacherRegisterForm() {
  const { t } = useString();
  const { register: registerUser, isLoading } = useAuth();
  const [showPass, setShowPass] = useState(false);

  const { data: schools } = useQuery({
    queryKey: ['schools', 'list'],
    queryFn: () => apiClient.get<ApiResponse<School[]>>(API.schools.list + '?per_page=100'),
    select: (d) => d.data,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TeacherRegisterInput>({ resolver: zodResolver(teacherRegisterSchema) });

  const onSubmit = (data: TeacherRegisterInput) => {
    registerUser({ ...data, role: 'teacher' });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-sm font-medium">{t('auth.first_name', {}, 'First Name')}</label>
          <Input {...register('first_name')} error={!!errors.first_name} placeholder={t('auth.first_name')} />
          {errors.first_name && <p className="text-xs text-destructive">{errors.first_name.message}</p>}
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">{t('auth.last_name', {}, 'Last Name')}</label>
          <Input {...register('last_name')} error={!!errors.last_name} placeholder={t('auth.last_name')} />
          {errors.last_name && <p className="text-xs text-destructive">{errors.last_name.message}</p>}
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium">{t('auth.username', {}, 'Username')}</label>
        <Input {...register('username')} error={!!errors.username} placeholder="teacher_name" />
        {errors.username && <p className="text-xs text-destructive">{errors.username.message}</p>}
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium">{t('auth.email', {}, 'Email')}</label>
        <Input {...register('email')} type="email" error={!!errors.email} placeholder="teacher@school.edu" />
        {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium">{t('auth.school', {}, 'School')}</label>
        <select
          {...register('school_id', { valueAsNumber: true })}
          className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="">{t('auth.select_school', {}, 'Select school...')}</option>
          {schools?.map((s) => (
            <option key={s.id} value={s.id}>{s.name} — {s.city}</option>
          ))}
        </select>
        {errors.school_id && <p className="text-xs text-destructive">{errors.school_id.message}</p>}
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium">{t('auth.language', {}, 'Language')}</label>
        <select
          {...register('locale')}
          className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="az">🇦🇿 Azərbaycan</option>
          <option value="ru">🇷🇺 Русский</option>
          <option value="en">🇬🇧 English</option>
        </select>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium">{t('auth.password', {}, 'Password')}</label>
        <div className="relative">
          <Input
            {...register('password')}
            type={showPass ? 'text' : 'password'}
            error={!!errors.password}
            placeholder="••••••••"
            className="pr-10"
          />
          <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium">{t('auth.password_confirmation', {}, 'Confirm Password')}</label>
        <Input
          {...register('password_confirmation')}
          type="password"
          error={!!errors.password_confirmation}
          placeholder="••••••••"
        />
        {errors.password_confirmation && <p className="text-xs text-destructive">{errors.password_confirmation.message}</p>}
      </div>

      <Button type="submit" className="w-full" loading={isLoading}>
        {t('auth.register', {}, 'Register')}
      </Button>
    </form>
  );
}
