'use client';

import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

import { useStringStore } from '@/store/string-store';
import apiClient from '@/lib/api/client';
import { API } from '@/lib/api/endpoints';
import type { StringsMap } from '@/types/strings';
import type { ApiResponse } from '@/types/api';

export function StringProvider({ children }: { children: React.ReactNode }) {
  const { locale, setStrings } = useStringStore();

  const { data } = useQuery({
    queryKey: ['strings', locale],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<StringsMap>>(
        API.strings.byLocale(locale),
      );
      return response.data;
    },
    staleTime: 1000 * 60 * 30, // 30 minutes — strings rarely change
    gcTime: 1000 * 60 * 60,
  });

  useEffect(() => {
    if (data) {
      setStrings(data);
    }
  }, [data, setStrings]);

  return <>{children}</>;
}
