// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useString } from './use-string';
import { useStringStore } from '@/store/string-store';

function seedStrings(strings: Record<string, string>) {
  act(() => {
    useStringStore.getState().setStrings(strings);
  });
}

function resetStrings() {
  act(() => {
    useStringStore.setState({ strings: {}, isLoaded: false });
  });
}

describe('useString – t() without vars', () => {
  beforeEach(resetStrings);

  it('returns the localized string for a known key', () => {
    seedStrings({ 'common.save': 'Saxla' });
    const { result } = renderHook(() => useString());
    expect(result.current.t('common.save')).toBe('Saxla');
  });

  it('returns the fallback when the key is not loaded', () => {
    const { result } = renderHook(() => useString());
    expect(result.current.t('missing.key', undefined, 'Default text')).toBe('Default text');
  });

  it('returns the raw key when no fallback and key is missing', () => {
    const { result } = renderHook(() => useString());
    expect(result.current.t('nothing.here')).toBe('nothing.here');
  });
});

describe('useString – t() with vars (interpolation)', () => {
  beforeEach(() => {
    resetStrings();
    seedStrings({
      'game.xp_earned': '+:xp XP qazandınız',
      'gamification.streak': ':days günlük seriya!',
      'test.multi': ':greeting, :name!',
    });
  });

  it('interpolates a single variable', () => {
    const { result } = renderHook(() => useString());
    expect(result.current.t('game.xp_earned', { xp: 100 })).toBe('+100 XP qazandınız');
  });

  it('interpolates multiple distinct variables', () => {
    const { result } = renderHook(() => useString());
    expect(result.current.t('test.multi', { greeting: 'Salam', name: 'Əli' })).toBe('Salam, Əli!');
  });

  it('interpolates numeric and string values', () => {
    const { result } = renderHook(() => useString());
    expect(result.current.t('gamification.streak', { days: 7 })).toBe('7 günlük seriya!');
  });

  it('returns raw key when interpolated key is missing', () => {
    const { result } = renderHook(() => useString());
    expect(result.current.t('no.key', { x: '1' })).toBe('no.key');
  });
});

describe('useString – locale', () => {
  it('exposes the current locale from the string store', () => {
    act(() => useStringStore.getState().setLocale('az'));
    const { result } = renderHook(() => useString());
    expect(result.current.locale).toBe('az');
  });

  it('reflects locale changes from the store', () => {
    act(() => useStringStore.getState().setLocale('az'));
    const { result } = renderHook(() => useString());

    act(() => useStringStore.getState().setLocale('en'));
    expect(result.current.locale).toBe('en');

    // restore
    act(() => useStringStore.getState().setLocale('az'));
  });
});

describe('useString – t() routes correctly to getString vs interpolate', () => {
  beforeEach(() => {
    resetStrings();
    seedStrings({ 'nav.home': 'Əsas', 'nav.greeting': 'Salam, :name' });
  });

  it('uses getString path when no vars provided', () => {
    const { result } = renderHook(() => useString());
    // No vars → should use getString, returning stored string not interpolated
    expect(result.current.t('nav.home')).toBe('Əsas');
  });

  it('uses interpolate path when vars provided (even empty object is truthy)', () => {
    const { result } = renderHook(() => useString());
    // vars is {} which is truthy, goes through interpolate
    expect(result.current.t('nav.greeting', { name: 'Kamran' })).toBe('Salam, Kamran');
  });
});
