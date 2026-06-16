import { describe, expect, it, beforeEach } from 'vitest';
import { handleGetBalancesBatch, handleGetBalanceCell } from '@/hcm-mock/handlers';
import { getHcmState, resetHcmState } from '@/hcm-mock/store';

describe('rate limited batch', () => {
  beforeEach(() => resetHcmState());

  it('returns RATE_LIMITED after threshold when flag is on', async () => {
    const state = getHcmState();
    state.rateLimitBatch = true;
    state.batchCallCount = 3;

    const result = await handleGetBalancesBatch('emp-alex');
    expect(result).toHaveProperty('code', 'RATE_LIMITED');
  });

  it('cell read still works when batch is rate limited', async () => {
    const state = getHcmState();
    state.rateLimitBatch = true;
    state.batchCallCount = 10;

    const batchResult = await handleGetBalancesBatch('emp-alex');
    expect(batchResult).toHaveProperty('code', 'RATE_LIMITED');

    const cellResult = await handleGetBalanceCell('emp-alex', 'loc-austin', 'vacation');
    expect(cellResult).not.toHaveProperty('code');
    expect(cellResult).toHaveProperty('availableDays');
  });

  it('does not rate limit when flag is off', async () => {
    const state = getHcmState();
    state.rateLimitBatch = false;
    state.batchCallCount = 100;

    const result = await handleGetBalancesBatch('emp-alex');
    expect(result).toHaveProperty('items');
  });
});
