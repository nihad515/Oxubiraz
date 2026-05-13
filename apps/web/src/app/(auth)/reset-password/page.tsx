'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { useSearchParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { Eye, EyeOff, LockKeyhole } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useString } from '@/hooks/use-string';
import { resetPasswordSchema, type ResetPasswordInput } from '@/lib/validations/auth';
import { ROUTES } from '@/config/routes';
import apiClient from '@/lib/api/client';
import { API } from '@/lib/api/endpoints';
import { toast } from 'sonner';

export default function ResetPasswordPage() {
  const { t } = useString();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPass, setShowPass] = useState(false);

  const token = searchParams.get('token') ?? '';
  const email = searchParams.get('email') ?? '';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token, email },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: ResetPasswordInput) =>
      apiClient.post(API.auth.resetPassword, data),
    onSuccess: () => {
      toast.success(t('auth.password_reset_success', {}, 'Password reset successfully. Please log in.'));
      router.push(ROUTES.login);
    },
    onError: () => toast.error(t('errors.generic', {}, 'Invalid or expired reset link.')),
  });

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm space-y-8"
      >
        <div className="space-y-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
            <LockKeyhole size={24} className="text-primary" />
          </div>
          <h1 className="text-2xl font-bold">{t('auth.reset_password', {}, 'Reset Password')}</h1>
          <p className="text-muted-foreground">
            {t('auth.reset_password_desc', {}, 'Enter your new password below.')}
          </p>
        </div>

        <form onSubmit={handleSubmit((data) => mutate(data))} className="space-y-4">
          <input type="hidden" {...register('token')} />
          <input type="hidden" {...register('email')} />

          <div className="space-y-1.5">
            <label className="text-sm font-medium">{t('auth.new_password', {}, 'New Password')}</label>
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
            <label className="text-sm font-medium">{t('auth.password_confirmation', {}, 'Confirm New Password')}</label>
            <Input
              {...register('password_confirmation')}
              type="password"
              error={!!errors.password_confirmation}
              placeholder="••••••••"
            />
            {errors.password_confirmation && <p className="text-xs text-destructive">{errors.password_confirmation.message}</p>}
          </div>

          <Button type="submit" className="w-full" loading={isPending}>
            {t('auth.reset_password', {}, 'Reset Password')}
          </Button>
        </form>
      </motion.div>
    </div>
  );
}
