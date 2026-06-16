import { describe, expect, it, beforeEach } from 'vitest';
import {
  handleCreateTimeOffRequest,
  handleWithdrawTimeOffRequest,
} from '@/hcm-mock/handlers';
import { getBalanceCell, resetHcmState } from '@/hcm-mock/store';

describe('withdraw request', () => {
  beforeEach(() => resetHcmState());

  it('restores balance when withdrawing a pending request', async () => {
    const before = getBalanceCell('emp-sam', 'loc-nyc', 'vacation')?.availableDays;
    const created = await handleCreateTimeOffRequest({
      employeeId: 'emp-sam',
      locationId: 'loc-nyc',
      balanceType: 'vacation',
      startDate: '2026-07-01',
      endDate: '2026-07-03',
      daysRequested: 2,
    });
    expect(created.status).toBe(201);
    if ('code' in created.data) return;

    const withdrawn = await handleWithdrawTimeOffRequest(created.data.id);
    expect(withdrawn.status).toBe(204);

    const after = getBalanceCell('emp-sam', 'loc-nyc', 'vacation')?.availableDays;
    expect(after).toBe(before);
  });
});
