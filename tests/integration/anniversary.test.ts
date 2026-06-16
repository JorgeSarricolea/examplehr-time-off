import { describe, expect, it } from 'vitest';
import {
  applyAnniversaryBonus,
  createHcmMockState,
  getAllBalances,
  resetHcmState,
} from '@/hcm-mock/store';
import { reconcileBalances } from '@/shared/lib/reconcile';

describe('anniversary mid-session', () => {
  it('increments vacation balance for employee cell', () => {
    resetHcmState();
    const before = getAllBalances('emp-alex').find(
      (b) => b.locationId === 'loc-austin' && b.balanceType === 'vacation',
    );
    expect(before?.availableDays).toBe(12);

    const affected = applyAnniversaryBonus('emp-alex', 'loc-austin', 1);
    expect(affected).toHaveLength(1);
    expect(affected[0].availableDays).toBe(13);
  });

  it('reconcile preserves optimistic deduction during batch refresh', () => {
    const serverCells = getAllBalances('emp-alex');
    const reconciled = reconcileBalances(serverCells, [
      {
        employeeId: 'emp-alex',
        locationId: 'loc-austin',
        balanceType: 'vacation',
        days: 2,
      },
    ]);
    const austin = reconciled.find(
      (b) => b.locationId === 'loc-austin' && b.balanceType === 'vacation',
    );
    expect(austin?.availableDays).toBe(10);
  });
});

describe('hcm mock state', () => {
  it('resets to seed data', () => {
    applyAnniversaryBonus('emp-alex');
    resetHcmState();
    const state = createHcmMockState();
    expect(state.balances.size).toBeGreaterThan(0);
  });
});
