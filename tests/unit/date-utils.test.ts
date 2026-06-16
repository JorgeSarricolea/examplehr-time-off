import { describe, expect, it } from 'vitest';
import {
  countBusinessDays,
  isWeekendIso,
  maxEndDateForStart,
  minStartDateForEnd,
  nextOrSameBusinessDayIso,
  clampEndDate,
} from '@/shared/lib/date-utils';

describe('countBusinessDays', () => {
  it('counts a single weekday', () => {
    expect(countBusinessDays('2026-06-16', '2026-06-16')).toBe(1);
  });

  it('counts inclusive weekday range', () => {
    expect(countBusinessDays('2026-06-16', '2026-06-18')).toBe(3);
  });

  it('excludes weekends in range', () => {
    // Fri 19 Jun → Mon 22 Jun 2026 = 2 business days
    expect(countBusinessDays('2026-06-19', '2026-06-22')).toBe(2);
  });

  it('returns 0 for weekend-only range', () => {
    expect(countBusinessDays('2026-06-20', '2026-06-21')).toBe(0);
  });

  it('returns null when end is before start', () => {
    expect(countBusinessDays('2026-06-18', '2026-06-16')).toBeNull();
  });
});

describe('weekend helpers', () => {
  it('detects weekend ISO dates', () => {
    expect(isWeekendIso('2026-06-20')).toBe(true);
    expect(isWeekendIso('2026-06-16')).toBe(false);
  });

  it('snaps to next business day from Saturday', () => {
    expect(nextOrSameBusinessDayIso('2026-06-20')).toBe('2026-06-22');
  });
});

describe('business-day bounds for balance', () => {
  it('max end spans available business days from start', () => {
    expect(maxEndDateForStart('2026-06-16', 15)).toBe('2026-07-06');
    expect(countBusinessDays('2026-06-16', '2026-07-06')).toBe(15);
  });

  it('min start for fixed end', () => {
    expect(minStartDateForEnd('2026-07-11', 15)).toBe('2026-06-22');
    expect(countBusinessDays('2026-06-22', '2026-07-11')).toBe(15);
  });

  it('clamps end when range exceeds business-day balance', () => {
    expect(clampEndDate('2026-06-16', '2026-07-11', 15)).toBe('2026-07-06');
  });
});
