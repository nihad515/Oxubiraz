'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import apiClient from '@/lib/api/client';
import { API } from '@/lib/api/endpoints';
import { useAuthStore } from '@/store/auth-store';
import { useString } from './use-string';
import type { LoginCredentials, RegisterPayload, AuthTokenResponse } from '@/types/auth';
import type { ApiResponse } from '@/types/api';
import { ROLE_HOME_ROUTES } from '@/config/routes';

export function useAuth() {
  const { setUser, setToken, logout: storeLogout, user, isAuthenticated, isLoading } = useAuthStore();
  const { t } = useString();
  const router = useRouter();
  const queryClient = useQueryClient();

  const loginMutation = useMutation({
    mutationFn: (credentials: LoginCredentials) =>
      apiClient.post<ApiResponse<AuthTokenResponse>>(API.auth.login, credentials),
    onSuccess: (data) => {
      const { access_token, user: userData } = data.data;
      setToken(access_token);
      setUser(userData);

      // Set cookie for middleware
      document.cookie = `oxubiraz_token=${access_token}; path=/; SameSite=Lax`;

      const homeRoute = ROLE_HOME_ROUTES[userData.roles[0]?.name ?? 'student'] ?? '/dashboard';
      router.push(homeRoute);
      toast.success(t('auth.login_success'));
    },
    onError: () => {
      toast.error(t('auth.login_failed'));
    },
  });

  const registerMutation = useMutation({
    mutationFn: (payload: RegisterPayload) =>
      apiClient.post<ApiResponse<AuthTokenResponse>>(API.auth.register, payload),
    onSuccess: (data) => {
      const { access_token, user: userData } = data.data;
      setToken(access_token);
      setUser(userData);
      document.cookie = `oxubiraz_token=${access_token}; path=/; SameSite=Lax`;
      router.push('/verify-email');
      toast.success(t('auth.register_success'));
    },
    onError: () => {
      toast.error(t('auth.register_failed'));
    },
  });

  const logoutMutation = useMutation({
    mutationFn: () => apiClient.post(API.auth.logout),
    onSettled: () => {
      storeLogout();
      queryClient.clear();
      document.cookie = 'oxubiraz_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      router.push('/login');
      toast.success(t('auth.logout_success'));
    },
  });

  return {
    user,
    isAuthenticated,
    isLoading,
    login: loginMutation.mutate,
    loginAsync: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    register: registerMutation.mutate,
    isRegistering: registerMutation.isPending,
    logout: logoutMutation.mutate,
    isLoggingOut: logoutMutation.isPending,
  };
}
