import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { handleGetBalancesBatch } from '@/hcm-mock/handlers';
import { resetHcmState } from '@/hcm-mock/store';

describe('slow HCM response', () => {
  beforeEach(() => {
    resetHcmState();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('batch completes after configured delay without timeout', async () => {
    const resultPromise = handleGetBalancesBatch('emp-alex', 800);
    await vi.advanceTimersByTimeAsync(800);
    const result = await resultPromise;

    expect(result).toHaveProperty('items');
    if ('items' in result) {
      expect(result.items.length).toBeGreaterThan(0);
    }
  });
});
