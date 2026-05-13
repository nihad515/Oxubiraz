export const APP_CONFIG = {
  name: 'Oxubiraz',
  version: '1.0.0',
  description: 'Multilingual AI-powered reading speed education platform',
  url: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
  apiUrl: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000',
  defaultLocale: (process.env.NEXT_PUBLIC_DEFAULT_LOCALE ?? 'az') as Locale,
  supportedLocales: ['az', 'ru', 'en'] as const,
} as const;

export type Locale = 'az' | 'ru' | 'en';
export type SupportedLocale = (typeof APP_CONFIG.supportedLocales)[number];

export const LOCALE_LABELS: Record<Locale, string> = {
  az: 'Azərbaycan',
  ru: 'Русский',
  en: 'English',
};

export const LOCALE_FLAGS: Record<Locale, string> = {
  az: '🇦🇿',
  ru: '🇷🇺',
  en: '🇬🇧',
};
