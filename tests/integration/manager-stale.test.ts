import { describe, expect, it, beforeEach } from 'vitest';
import {
  handleCreateTimeOffRequest,
  handlePatchTimeOffRequest,
} from '@/hcm-mock/handlers';
import { applyAnniversaryBonus, getBalanceCell, resetHcmState } from '@/hcm-mock/store';

describe('manager stale approve', () => {
  beforeEach(() => resetHcmState());

  it('blocks approve when balance snapshot differs from HCM', async () => {
    const created = await handleCreateTimeOffRequest({
      employeeId: 'emp-sam',
      locationId: 'loc-nyc',
      balanceType: 'vacation',
      startDate: '2026-09-01',
      endDate: '2026-09-02',
      daysRequested: 1,
    });
    expect(created.status).toBe(201);
    if ('code' in created.data) return;

    applyAnniversaryBonus('emp-sam', 'loc-nyc', 0);
    applyAnniversaryBonus('emp-sam', 'loc-nyc', -3);

    const patch = await handlePatchTimeOffRequest(created.data.id, {
      action: 'approve',
      managerId: 'mgr-morgan',
      balanceSnapshotDays: 10,
    });

    expect(patch.status).toBe(409);
  });

  it('allows approve when days were reserved at employee submit', async () => {
    const created = await handleCreateTimeOffRequest({
      employeeId: 'emp-sam',
      locationId: 'loc-nyc',
      balanceType: 'vacation',
      startDate: '2026-06-16',
      endDate: '2026-06-29',
      daysRequested: 10,
    });
    expect(created.status).toBe(201);
    if ('code' in created.data) return;

    const cell = getBalanceCell('emp-sam', 'loc-nyc', 'vacation');
    expect(cell?.availableDays).toBe(0);

    const patch = await handlePatchTimeOffRequest(created.data.id, {
      action: 'approve',
      managerId: 'mgr-morgan',
      balanceSnapshotDays: 0,
    });

    expect(patch.status).toBe(200);
    if ('code' in patch.data) return;
    expect(patch.data.status).toBe('approved');
  });
});
