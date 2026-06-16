import { describe, expect, it, beforeEach } from 'vitest';
import { applyPersistedBlob, snapshotHcmState } from '@/hcm-mock/persisted-blob';
import { createHcmMockState, resetHcmState } from '@/hcm-mock/store';
import type { TimeOffRequest } from '@/shared/types/hcm';

describe('persisted HCM blob', () => {
  beforeEach(() => resetHcmState());

  it('round-trips balances, requests, and requestCounter', () => {
    const state = createHcmMockState();
    const cell = state.balances.values().next().value!;
    state.balances.set(`${cell.employeeId}:${cell.locationId}:${cell.balanceType}`, {
      ...cell,
      availableDays: 3,
    });

    const request: TimeOffRequest = {
      id: 'req-1',
      employeeId: 'emp-alex',
      employeeName: 'Alex Rivera',
      managerId: 'mgr-morgan',
      locationId: 'loc-austin',
      locationName: 'Austin HQ',
      balanceType: 'vacation',
      startDate: '2026-06-16',
      endDate: '2026-06-20',
      daysRequested: 5,
      status: 'manager_pending',
      hcmConfirmedAt: '2026-06-16T00:00:00.000Z',
      createdAt: '2026-06-16T00:00:00.000Z',
      updatedAt: '2026-06-16T00:00:00.000Z',
    };
    state.requests.set(request.id, request);
    state.requestCounter = 1;

    const blob = snapshotHcmState(state);
    const restored = createHcmMockState();
    applyPersistedBlob(restored, blob);

    expect(restored.requestCounter).toBe(1);
    expect(restored.requests.get('req-1')?.daysRequested).toBe(5);
    expect(
      restored.balances.get('emp-alex:loc-austin:vacation')?.availableDays,
    ).toBe(3);
  });
});
