'use client';

import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

import { useAuthStore } from '@/store/auth-store';
import apiClient from '@/lib/api/client';
import { API } from '@/lib/api/endpoints';
import type { ApiResponse } from '@/types/api';
import type { User } from '@/types/auth';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { token, setUser, setLoading, logout } = useAuthStore();

  useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<User>>(API.auth.me);
      setUser(response.data);
      return response.data;
    },
    enabled: !!token,
    retry: false,
    staleTime: 1000 * 60 * 5,
    meta: {
      onError: () => {
        logout();
        setLoading(false);
      },
    },
  });

  useEffect(() => {
    if (!token) {
      setLoading(false);
    }
  }, [token, setLoading]);

  return <>{children}</>;
}
