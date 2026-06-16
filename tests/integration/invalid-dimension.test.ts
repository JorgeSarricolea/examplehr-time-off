import { describe, expect, it, beforeEach } from 'vitest';
import { handleCreateTimeOffRequest } from '@/hcm-mock/handlers';
import { resetHcmState } from '@/hcm-mock/store';

describe('invalid dimension', () => {
  beforeEach(() => resetHcmState());

  it('returns 400 for non-existent employee', async () => {
    const result = await handleCreateTimeOffRequest({
      employeeId: 'emp-ghost',
      locationId: 'loc-austin',
      balanceType: 'vacation',
      startDate: '2026-07-01',
      endDate: '2026-07-02',
      daysRequested: 1,
    });
    expect(result.status).toBe(400);
    if ('code' in result.data) {
      expect(result.data.code).toBe('INVALID_DIMENSION');
    }
  });

  it('returns 400 for non-existent location', async () => {
    const result = await handleCreateTimeOffRequest({
      employeeId: 'emp-alex',
      locationId: 'loc-mars',
      balanceType: 'vacation',
      startDate: '2026-07-01',
      endDate: '2026-07-02',
      daysRequested: 1,
    });
    expect(result.status).toBe(400);
    if ('code' in result.data) {
      expect(result.data.code).toBe('INVALID_DIMENSION');
    }
  });

  it('returns 400 for employee without manager', async () => {
    const result = await handleCreateTimeOffRequest({
      employeeId: 'mgr-morgan',
      locationId: 'loc-austin',
      balanceType: 'vacation',
      startDate: '2026-07-01',
      endDate: '2026-07-02',
      daysRequested: 1,
    });
    expect(result.status).toBe(400);
    if ('code' in result.data) {
      expect(result.data.code).toBe('INVALID_DIMENSION');
    }
  });
});
