import type { RequestStatus, TimeOffRequest } from '@/shared/types/hcm';

export const STALE_CONFIRMATION_MS = 15_000;

const WITHDRAWABLE_STATUSES = new Set<RequestStatus>([
  'optimistic_pending',
  'hcm_confirming',
  'stale_confirmation',
  'confirmed',
  'manager_pending',
  'silently_wrong',
  'conflict_recovery',
]);

export function isStaleConfirmationRequest(request: TimeOffRequest): boolean {
  if (request.status === 'stale_confirmation') return true;
  if (request.status !== 'hcm_confirming') return false;
  return Date.now() - new Date(request.createdAt).getTime() > STALE_CONFIRMATION_MS;
}

export function displayRequestStatus(request: TimeOffRequest): RequestStatus {
  return isStaleConfirmationRequest(request) ? 'stale_confirmation' : request.status;
}

export function canWithdrawRequest(status: RequestStatus): boolean {
  return WITHDRAWABLE_STATUSES.has(status);
}

export function hasInsufficientBalance(availableDays: number, daysRequested: number): boolean {
  return availableDays < daysRequested;
}
