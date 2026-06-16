import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  handleCreateTimeOffRequest,
  handleGetBalancesBatch,
  handleGetBalanceCell,
} from '@/hcm-mock/handlers';
import { resetHcmState } from '@/hcm-mock/store';

describe('HCM timeout (504)', () => {
  beforeEach(() => {
    resetHcmState();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  async function flushDelay<T>(promise: Promise<T>): Promise<T> {
    await vi.advanceTimersByTimeAsync(35_000);
    return promise;
  }

  it('returns GATEWAY_TIMEOUT when batch exceeds 25s', async () => {
    const result = await flushDelay(handleGetBalancesBatch('emp-alex', 30_000));
    expect(result).toHaveProperty('code', 'GATEWAY_TIMEOUT');
  });

  it('returns GATEWAY_TIMEOUT when cell read exceeds 25s', async () => {
    const result = await flushDelay(
      handleGetBalanceCell('emp-alex', 'loc-austin', 'vacation', 30_000),
    );
    expect(result).toHaveProperty('code', 'GATEWAY_TIMEOUT');
  });

  it('returns GATEWAY_TIMEOUT when submit exceeds 25s', async () => {
    const result = await flushDelay(
      handleCreateTimeOffRequest(
        {
          employeeId: 'emp-sam',
          locationId: 'loc-nyc',
          balanceType: 'vacation',
          startDate: '2026-07-01',
          endDate: '2026-07-02',
          daysRequested: 1,
        },
        30_000,
      ),
    );
    expect(result.status).toBe(504);
    if ('code' in result.data) {
      expect(result.data.code).toBe('GATEWAY_TIMEOUT');
    }
  });
});
