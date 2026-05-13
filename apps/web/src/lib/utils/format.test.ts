import { describe, it, expect } from 'vitest';
import {
  formatWpm,
  formatTime,
  formatMs,
  formatPercent,
  formatNumber,
  calculateXpToNextLevel,
} from './format';

const THRESHOLDS = [0, 100, 250, 500, 1000, 2000, 4000, 7000, 11000, 16000, 22000];

describe('formatWpm', () => {
  it('formats wpm with suffix', () => {
    expect(formatWpm(80)).toBe('80 WPM');
    expect(formatWpm(0)).toBe('0 WPM');
    expect(formatWpm(250)).toBe('250 WPM');
  });
});

describe('formatTime', () => {
  it('shows seconds only for < 1 minute', () => {
    expect(formatTime(45)).toBe('45s');
    expect(formatTime(0)).toBe('0s');
    expect(formatTime(59)).toBe('59s');
  });

  it('shows m:ss for >= 1 minute', () => {
    expect(formatTime(60)).toBe('1:00');
    expect(formatTime(90)).toBe('1:30');
    expect(formatTime(125)).toBe('2:05');
  });

  it('pads seconds with leading zero', () => {
    expect(formatTime(61)).toBe('1:01');
    expect(formatTime(69)).toBe('1:09');
  });
});

describe('formatMs', () => {
  it('converts milliseconds to time string', () => {
    expect(formatMs(45000)).toBe('45s');
    expect(formatMs(90000)).toBe('1:30');
    expect(formatMs(0)).toBe('0s');
  });

  it('floors fractional seconds', () => {
    expect(formatMs(59999)).toBe('59s');
    expect(formatMs(60001)).toBe('1:00');
  });
});

describe('formatPercent', () => {
  it('formats with 1 decimal by default', () => {
    expect(formatPercent(80)).toBe('80.0%');
    expect(formatPercent(100)).toBe('100.0%');
  });

  it('respects custom decimals', () => {
    expect(formatPercent(75.5, 0)).toBe('76%');
    expect(formatPercent(75.555, 2)).toBe('75.55%');
  });
});

describe('formatNumber', () => {
  it('formats numbers with locale separators', () => {
    // formatNumber uses Intl.NumberFormat; result is locale-dependent
    // Just verify it returns a string containing the digits
    expect(formatNumber(1000)).toContain('1');
    expect(formatNumber(0)).toBe('0');
  });
});

describe('calculateXpToNextLevel', () => {
  it('starts at level 0 with 0 XP', () => {
    const result = calculateXpToNextLevel(0, THRESHOLDS);
    expect(result.level).toBe(0);
    expect(result.xpInLevel).toBe(0);
    expect(result.progress).toBe(0);
  });

  it('advances to level 1 at threshold', () => {
    const result = calculateXpToNextLevel(100, THRESHOLDS);
    expect(result.level).toBe(1);
  });

  it('calculates correct progress within a level', () => {
    // Level 1: 100–249 XP, so 175 XP is halfway (75/150 = 50%)
    const result = calculateXpToNextLevel(175, THRESHOLDS);
    expect(result.level).toBe(1);
    expect(result.xpInLevel).toBe(75);
    expect(result.xpNeeded).toBe(150);
    expect(result.progress).toBeCloseTo(50, 0);
  });

  it('caps progress at 100% at max threshold', () => {
    const result = calculateXpToNextLevel(99999, THRESHOLDS);
    expect(result.progress).toBeLessThanOrEqual(100);
  });

  it('advances through multiple levels correctly', () => {
    expect(calculateXpToNextLevel(250, THRESHOLDS).level).toBe(2);
    expect(calculateXpToNextLevel(500, THRESHOLDS).level).toBe(3);
    expect(calculateXpToNextLevel(1000, THRESHOLDS).level).toBe(4);
  });
});
