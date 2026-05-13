export function formatWpm(wpm: number): string {
  return `${wpm} WPM`;
}

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}:${s.toString().padStart(2, '0')}` : `${s}s`;
}

export function formatMs(ms: number): string {
  return formatTime(Math.floor(ms / 1000));
}

export function formatPercent(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat().format(value);
}

export function formatDate(date: string | Date, locale = 'az'): string {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date));
}

export function formatDateTime(date: string | Date, locale = 'az'): string {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

export function formatRelativeTime(date: string | Date, locale = 'az'): string {
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  const now = new Date();
  const target = new Date(date);
  const diffMs = target.getTime() - now.getTime();
  const diffSeconds = Math.round(diffMs / 1000);
  const diffMinutes = Math.round(diffSeconds / 60);
  const diffHours = Math.round(diffMinutes / 60);
  const diffDays = Math.round(diffHours / 24);

  if (Math.abs(diffSeconds) < 60) return rtf.format(diffSeconds, 'second');
  if (Math.abs(diffMinutes) < 60) return rtf.format(diffMinutes, 'minute');
  if (Math.abs(diffHours) < 24) return rtf.format(diffHours, 'hour');
  return rtf.format(diffDays, 'day');
}

export function calculateXpToNextLevel(xp: number, thresholds: number[]): {
  level: number;
  progress: number;
  xpNeeded: number;
  xpInLevel: number;
} {
  let level = 0;
  for (let i = 0; i < thresholds.length; i++) {
    if (xp >= (thresholds[i] ?? 0)) level = i;
    else break;
  }
  const currentThreshold = thresholds[level] ?? 0;
  const nextThreshold = thresholds[level + 1] ?? currentThreshold + 1000;
  const xpInLevel = xp - currentThreshold;
  const xpNeeded = nextThreshold - currentThreshold;
  const progress = Math.min((xpInLevel / xpNeeded) * 100, 100);

  return { level, progress, xpNeeded, xpInLevel };
}
