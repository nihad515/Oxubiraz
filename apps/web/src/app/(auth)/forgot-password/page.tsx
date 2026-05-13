'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useString } from '@/hooks/use-string';
import { forgotPasswordSchema, type ForgotPasswordInput } from '@/lib/validations/auth';
import { ROUTES } from '@/config/routes';
import apiClient from '@/lib/api/client';
import { API } from '@/lib/api/endpoints';
import { toast } from 'sonner';

export default function ForgotPasswordPage() {
  const { t } = useString();
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<ForgotPasswordInput>({ resolver: zodResolver(forgotPasswordSchema) });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: ForgotPasswordInput) =>
      apiClient.post(API.auth.forgotPassword, data),
    onSuccess: () => setSent(true),
    onError: () => toast.error(t('errors.generic', {}, 'Something went wrong. Please try again.')),
  });

  if (sent) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center min-h-screen p-6 text-center"
      >
        <div className="w-full max-w-sm space-y-6">
          <div className="flex justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-950">
              <CheckCircle size={40} className="text-green-600" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold">{t('auth.check_email', {}, 'Check Your Email')}</h1>
            <p className="mt-2 text-muted-foreground">
              {t('auth.reset_sent', { email: getValues('email') }, `We sent a password reset link to ${getValues('email')}`)}
            </p>
          </div>
          <p className="text-sm text-muted-foreground">
            {t('auth.reset_expiry', {}, 'The link expires in 60 minutes.')}
          </p>
          <Button asChild variant="outline" className="w-full">
            <Link href={ROUTES.login}>
              <ArrowLeft size={16} />
              {t('auth.back_to_login', {}, 'Back to Login')}
            </Link>
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm space-y-8"
      >
        {/* Header */}
        <div className="space-y-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
            <Mail size={24} className="text-primary" />
          </div>
          <h1 className="text-2xl font-bold">{t('auth.forgot_password', {}, 'Forgot Password?')}</h1>
          <p className="text-muted-foreground">
            {t('auth.forgot_password_desc', {}, "Enter your email and we'll send you a reset link.")}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit((data) => mutate(data))} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">{t('auth.email', {}, 'Email Address')}</label>
            <Input
              {...register('email')}
              type="email"
              error={!!errors.email}
              placeholder="you@example.com"
              autoComplete="email"
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full" loading={isPending}>
            {t('auth.send_reset_link', {}, 'Send Reset Link')}
          </Button>
        </form>

        <div className="text-center">
          <Link
            href={ROUTES.login}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={14} />
            {t('auth.back_to_login', {}, 'Back to Login')}
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
