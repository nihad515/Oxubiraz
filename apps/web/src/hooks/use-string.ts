'use client';

import { useCallback } from 'react';

import { useStringStore } from '@/store/string-store';

export function useString() {
  const { getString, interpolate, locale } = useStringStore();

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>, fallback?: string): string => {
      if (vars) return interpolate(key, vars);
      return getString(key, fallback);
    },
    [getString, interpolate],
  );

  return { t, locale };
}
