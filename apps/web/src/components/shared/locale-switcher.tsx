'use client';

import { useStringStore } from '@/store/string-store';
import { APP_CONFIG, LOCALE_FLAGS, LOCALE_LABELS, type Locale } from '@/config/app';
import { cn } from '@/lib/utils/cn';

export function LocaleSwitcher({ className }: { className?: string }) {
  const { locale, setLocale } = useStringStore();

  const handleChange = (newLocale: Locale) => {
    setLocale(newLocale);
    localStorage.setItem('locale', newLocale);
    document.documentElement.lang = newLocale;
  };

  return (
    <div className={cn('flex gap-1', className)}>
      {APP_CONFIG.supportedLocales.map((loc) => (
        <button
          key={loc}
          type="button"
          onClick={() => handleChange(loc)}
          className={cn(
            'flex h-8 items-center gap-1 rounded-md px-2 text-xs font-medium transition-colors',
            'touch-manipulation',
            locale === loc
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:bg-accent hover:text-foreground',
          )}
          title={LOCALE_LABELS[loc]}
          aria-label={LOCALE_LABELS[loc]}
          aria-pressed={locale === loc}
        >
          <span aria-hidden="true">{LOCALE_FLAGS[loc]}</span>
          <span className="hidden sm:inline">{loc.toUpperCase()}</span>
        </button>
      ))}
    </div>
  );
}
