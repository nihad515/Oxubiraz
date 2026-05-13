import { create } from 'zustand';

import type { StringsMap } from '@/types/strings';
import type { Locale } from '@/config/app';
import { APP_CONFIG } from '@/config/app';

interface StringState {
  strings: StringsMap;
  locale: Locale;
  isLoaded: boolean;
}

interface StringActions {
  setStrings: (strings: StringsMap) => void;
  setLocale: (locale: Locale) => void;
  getString: (key: string, fallback?: string) => string;
  interpolate: (key: string, vars: Record<string, string | number>) => string;
}

type StringStore = StringState & StringActions;

export const useStringStore = create<StringStore>((set, get) => ({
  strings: {},
  locale: APP_CONFIG.defaultLocale,
  isLoaded: false,

  setStrings: (strings) => set({ strings, isLoaded: true }),

  setLocale: (locale) => set({ locale }),

  getString: (key, fallback) => {
    const { strings } = get();
    return strings[key] ?? fallback ?? key;
  },

  interpolate: (key, vars) => {
    const { getString } = get();
    let text = getString(key);
    Object.entries(vars).forEach(([varKey, value]) => {
      text = text.replace(new RegExp(`:${varKey}`, 'g'), String(value));
    });
    return text;
  },
}));
