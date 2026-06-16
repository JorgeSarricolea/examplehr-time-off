import { describe, expect, it, beforeEach } from 'vitest';
import { handleCreateTimeOffRequest } from '@/hcm-mock/handlers';
import { resetHcmState, getBalanceCell } from '@/hcm-mock/store';

describe('submit reject', () => {
  beforeEach(() => resetHcmState());

  it('returns 409 when insufficient balance', async () => {
    const result = await handleCreateTimeOffRequest({
      employeeId: 'emp-sam',
      locationId: 'loc-nyc',
      balanceType: 'vacation',
      startDate: '2026-07-01',
      endDate: '2026-07-15',
      daysRequested: 99,
    });
    expect(result.status).toBe(409);
    if ('code' in result.data) {
      expect(result.data.code).toBe('INSUFFICIENT_BALANCE');
    }
  });

  it('deducts balance on successful submit', async () => {
    const result = await handleCreateTimeOffRequest({
      employeeId: 'emp-sam',
      locationId: 'loc-nyc',
      balanceType: 'vacation',
      startDate: '2026-07-01',
      endDate: '2026-07-03',
      daysRequested: 2,
    });
    expect(result.status).toBe(201);
    const cell = getBalanceCell('emp-sam', 'loc-nyc', 'vacation');
    expect(cell?.availableDays).toBe(8);
  });
});
