'use client';

import { useEffect } from 'react';

import { useStringStore } from '@/store/string-store';
import { useAuthStore } from '@/store/auth-store';
import { APP_CONFIG, type Locale } from '@/config/app';

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const { setLocale } = useStringStore();
  const { user } = useAuthStore();

  useEffect(() => {
    const resolveLocale = (): Locale => {
      if (user?.locale && APP_CONFIG.supportedLocales.includes(user.locale as Locale)) {
        return user.locale as Locale;
      }
      const stored = localStorage.getItem('locale') as Locale | null;
      if (stored && APP_CONFIG.supportedLocales.includes(stored)) return stored;

      const browserLang = navigator.language.split('-')[0] as Locale;
      if (APP_CONFIG.supportedLocales.includes(browserLang)) return browserLang;

      return APP_CONFIG.defaultLocale;
    };

    const locale = resolveLocale();
    setLocale(locale);
    localStorage.setItem('locale', locale);
    document.documentElement.lang = locale;
  }, [user?.locale, setLocale]);

  return <>{children}</>;
}
