import { describe, it, expect, beforeEach } from 'vitest';
import { useStringStore } from './string-store';

function reset() {
  useStringStore.setState({ strings: {}, isLoaded: false });
}

describe('string store – getString', () => {
  beforeEach(reset);

  it('returns the string for a known key', () => {
    useStringStore.getState().setStrings({ 'common.save': 'Saxla' });
    expect(useStringStore.getState().getString('common.save')).toBe('Saxla');
  });

  it('returns the fallback when key is missing', () => {
    expect(useStringStore.getState().getString('missing.key', 'Default')).toBe('Default');
  });

  it('returns the raw key when key is missing and no fallback given', () => {
    expect(useStringStore.getState().getString('missing.key')).toBe('missing.key');
  });

  it('setStrings marks store as loaded', () => {
    useStringStore.getState().setStrings({ 'a.b': 'c' });
    expect(useStringStore.getState().isLoaded).toBe(true);
  });
});

describe('string store – interpolate', () => {
  beforeEach(() => {
    reset();
    useStringStore.getState().setStrings({
      'game.xp_earned': '+:xp XP qazandınız',
      'gamification.streak': ':days günlük seriya!',
    });
  });

  it('replaces a single placeholder', () => {
    const result = useStringStore.getState().interpolate('game.xp_earned', { xp: 50 });
    expect(result).toBe('+50 XP qazandınız');
  });

  it('replaces multiple placeholder occurrences', () => {
    useStringStore.getState().setStrings({ 'test.repeat': ':x plus :x' });
    const result = useStringStore.getState().interpolate('test.repeat', { x: '!' });
    expect(result).toBe('! plus !');
  });

  it('replaces multiple distinct placeholders', () => {
    useStringStore.getState().setStrings({ 'test.multi': ':a and :b' });
    const result = useStringStore.getState().interpolate('test.multi', { a: 'hello', b: 'world' });
    expect(result).toBe('hello and world');
  });

  it('returns key when string is missing', () => {
    const result = useStringStore.getState().interpolate('no.key', { x: '1' });
    expect(result).toBe('no.key');
  });
});

describe('string store – locale', () => {
  it('defaults to az locale', () => {
    expect(useStringStore.getState().locale).toBe('az');
  });

  it('can change locale', () => {
    useStringStore.getState().setLocale('en');
    expect(useStringStore.getState().locale).toBe('en');
    useStringStore.getState().setLocale('az');
  });
});
