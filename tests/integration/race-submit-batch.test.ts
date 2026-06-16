import { describe, expect, it, beforeEach } from 'vitest';
import {
  handleCreateTimeOffRequest,
  handleGetBalancesBatch,
} from '@/hcm-mock/handlers';
import { resetHcmState } from '@/hcm-mock/store';
import { reconcileBalances } from '@/shared/lib/reconcile';

describe('batch during optimistic submit', () => {
  beforeEach(() => resetHcmState());

  it('merge preserves optimistic deduction when batch arrives', async () => {
    const submitResult = await handleCreateTimeOffRequest({
      employeeId: 'emp-alex',
      locationId: 'loc-austin',
      balanceType: 'vacation',
      startDate: '2026-07-07',
      endDate: '2026-07-08',
      daysRequested: 2,
    });
    expect(submitResult.status).toBe(201);

    const batchResult = await handleGetBalancesBatch('emp-alex');
    expect(batchResult).toHaveProperty('items');
    if (!('items' in batchResult)) return;

    const reconciled = reconcileBalances(batchResult.items, [
      {
        employeeId: 'emp-alex',
        locationId: 'loc-austin',
        balanceType: 'vacation',
        days: 2,
      },
    ]);

    const austinVacation = reconciled.find(
      (b) => b.locationId === 'loc-austin' && b.balanceType === 'vacation',
    );
    expect(austinVacation?.availableDays).toBe(8);
  });

  it('server batch does not wipe pending deduction when reconciled', async () => {
    const batchBefore = await handleGetBalancesBatch('emp-alex');
    expect(batchBefore).toHaveProperty('items');
    if (!('items' in batchBefore)) return;

    const austinBefore = batchBefore.items.find(
      (b) => b.locationId === 'loc-austin' && b.balanceType === 'vacation',
    );
    expect(austinBefore?.availableDays).toBe(12);

    await handleCreateTimeOffRequest({
      employeeId: 'emp-alex',
      locationId: 'loc-austin',
      balanceType: 'vacation',
      startDate: '2026-08-01',
      endDate: '2026-08-04',
      daysRequested: 3,
    });

    const batchAfter = await handleGetBalancesBatch('emp-alex');
    if (!('items' in batchAfter)) return;

    const reconciledAfter = reconcileBalances(batchAfter.items, [
      {
        employeeId: 'emp-alex',
        locationId: 'loc-austin',
        balanceType: 'vacation',
        days: 3,
      },
    ]);

    const austinAfter = reconciledAfter.find(
      (b) => b.locationId === 'loc-austin' && b.balanceType === 'vacation',
    );
    expect(austinAfter?.availableDays).toBe(6);
  });
});
