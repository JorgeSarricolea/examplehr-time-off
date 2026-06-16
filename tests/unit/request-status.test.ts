import { describe, expect, it } from 'vitest';
import {
  canWithdrawRequest,
  displayRequestStatus,
  hasInsufficientBalance,
  isStaleConfirmationRequest,
} from '@/shared/lib/request-status';
import type { TimeOffRequest } from '@/shared/types/hcm';

const baseRequest: TimeOffRequest = {
  id: 'req-1',
  employeeId: 'emp-alex',
  employeeName: 'Alex Rivera',
  managerId: 'mgr-morgan',
  locationId: 'loc-austin',
  locationName: 'Austin HQ',
  balanceType: 'vacation',
  startDate: '2026-07-01',
  endDate: '2026-07-03',
  daysRequested: 2,
  status: 'hcm_confirming',
  createdAt: new Date(Date.now() - 20_000).toISOString(),
  updatedAt: new Date().toISOString(),
};

describe('request-status', () => {
  it('detects stale confirmation from aged hcm_confirming', () => {
    expect(isStaleConfirmationRequest(baseRequest)).toBe(true);
    expect(displayRequestStatus(baseRequest)).toBe('stale_confirmation');
  });

  it('allows withdraw on pending manager requests', () => {
    expect(canWithdrawRequest('manager_pending')).toBe(true);
    expect(canWithdrawRequest('approved')).toBe(false);
  });

  it('flags insufficient balance', () => {
    expect(hasInsufficientBalance(0, 10)).toBe(true);
    expect(hasInsufficientBalance(10, 10)).toBe(false);
  });
});
