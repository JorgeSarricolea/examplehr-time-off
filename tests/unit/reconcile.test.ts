import { describe, expect, it } from 'vitest';
import { detectBalanceDiff, reconcileBalances } from '@/shared/lib/reconcile';
import type { BalanceCell } from '@/shared/types/hcm';

const baseCell = (days: number): BalanceCell => ({
  employeeId: 'emp-alex',
  locationId: 'loc-austin',
  locationName: 'Austin HQ',
  balanceType: 'vacation',
  availableDays: days,
  asOf: new Date().toISOString(),
});

describe('reconcile helpers', () => {
  it('detects balance diff', () => {
    const changes = detectBalanceDiff([baseCell(10)], [baseCell(12)]);
    expect(changes).toHaveLength(1);
    expect(changes[0].delta).toBe(2);
  });

  it('merges optimistic deduction', () => {
    const result = reconcileBalances([baseCell(12)], [
      {
        employeeId: 'emp-alex',
        locationId: 'loc-austin',
        balanceType: 'vacation',
        days: 2,
      },
    ]);
    expect(result[0].availableDays).toBe(10);
  });
});
