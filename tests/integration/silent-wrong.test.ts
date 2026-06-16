import { describe, expect, it, beforeEach } from 'vitest';
import { triggerChaos } from '@/hcm-mock/chaos-controls';
import { handleCreateTimeOffRequest } from '@/hcm-mock/handlers';
import { resetHcmState } from '@/hcm-mock/store';
import { hasSilentWrongConflict } from '@/shared/lib/reconcile';

describe('silent wrong', () => {
  beforeEach(() => resetHcmState());

  it('returns 200 with wrong days when chaos triggered', async () => {
    triggerChaos({ action: 'silent_wrong_next' });
    const result = await handleCreateTimeOffRequest({
      employeeId: 'emp-sam',
      locationId: 'loc-nyc',
      balanceType: 'vacation',
      startDate: '2026-08-01',
      endDate: '2026-08-02',
      daysRequested: 2,
    });
    expect(result.status).toBe(200);
    if (!('code' in result.data)) {
      expect(hasSilentWrongConflict(1, 2)).toBe(true);
      expect(result.data.status).toBe('silently_wrong');
    }
  });
});
