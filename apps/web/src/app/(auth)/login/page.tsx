'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { useString } from '@/hooks/use-string';
import { loginSchema, type LoginInput } from '@/lib/validations/auth';
import { LocaleSwitcher } from '@/components/shared/locale-switcher';

export default function LoginPage() {
  const { t } = useString();
  const { login, isLoggingIn } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { remember: false },
  });

  const onSubmit = (data: LoginInput) => {
    login(data);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('auth.login')}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t('auth.login_subtitle', {}, 'Sign in to your account')}
          </p>
        </div>
        <LocaleSwitcher />
      </div>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            {/* Username / Email */}
            <div className="space-y-1.5">
              <label htmlFor="login" className="text-sm font-medium">
                {t('auth.username')} / {t('auth.email')}
              </label>
              <Input
                id="login"
                type="text"
                autoComplete="username"
                autoCapitalize="none"
                placeholder="username or email"
                error={!!errors.login}
                {...register('login')}
              />
              {errors.login && (
                <p className="text-xs text-destructive">{t(errors.login.message ?? '')}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-medium">
                  {t('auth.password')}
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-primary hover:underline"
                >
                  {t('auth.forgot_password')}
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  error={!!errors.password}
                  className="pr-10"
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-destructive">{t(errors.password.message ?? '')}</p>
              )}
            </div>

            {/* Remember me */}
            <div className="flex items-center gap-2">
              <input
                id="remember"
                type="checkbox"
                className="h-4 w-4 rounded border-input accent-primary"
                {...register('remember')}
              />
              <label htmlFor="remember" className="text-sm text-muted-foreground">
                {t('auth.remember_me')}
              </label>
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              loading={isLoggingIn}
            >
              <LogIn size={18} />
              {t('auth.login')}
            </Button>
          </form>
        </CardContent>
      </Card>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        {t('auth.no_account', {}, "Don't have an account?")}{' '}
        <Link href="/register" className="font-medium text-primary hover:underline">
          {t('auth.register')}
        </Link>
      </p>
    </motion.div>
  );
}
