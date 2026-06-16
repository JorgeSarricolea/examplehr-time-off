import { afterEach, describe, expect, it } from 'vitest';
import { shouldSilentWrong } from '@/hcm-mock/chaos-controls';
import { getHcmState, resetHcmState } from '@/hcm-mock/store';

describe('shouldSilentWrong', () => {
  afterEach(() => {
    resetHcmState();
    delete process.env.NODE_ENV;
  });

  it('honors silent_wrong_next flag in production', () => {
    process.env.NODE_ENV = 'production';
    getHcmState().silentWrongNext = true;
    expect(shouldSilentWrong()).toBe(true);
    expect(getHcmState().silentWrongNext).toBe(false);
  });

  it('skips random silent wrong in production', () => {
    process.env.NODE_ENV = 'production';
    expect(shouldSilentWrong()).toBe(false);
  });
});
