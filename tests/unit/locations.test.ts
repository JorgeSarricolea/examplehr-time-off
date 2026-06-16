import { describe, expect, it } from 'vitest';
import { getLocationMeta, formatLocationLine } from '@/shared/lib/locations';

describe('locations', () => {
  it('returns meta for known locations', () => {
    const austin = getLocationMeta('loc-austin');
    expect(austin.title).toBe('Austin HQ');
    expect(austin.subtitle).toContain('On-site');
  });

  it('formats location line', () => {
    expect(formatLocationLine('loc-remote')).toContain('Remote');
    expect(formatLocationLine('loc-remote')).toContain('Work from home');
  });
});
