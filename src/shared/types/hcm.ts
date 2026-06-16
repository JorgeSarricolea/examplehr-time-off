export type BalanceType = 'vacation' | 'sick';

export type RequestStatus =
  | 'optimistic_pending'
  | 'hcm_confirming'
  | 'confirmed'
  | 'manager_pending'
  | 'manager_verifying'
  | 'approved'
  | 'denied'
  | 'reverted'
  | 'silently_wrong'
  | 'conflict_recovery'
  | 'withdrawn'
  | 'stale_confirmation';

export type UserRole = 'employee' | 'manager';

export interface DemoUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  managerId?: string;
}

export interface BalanceCell {
  employeeId: string;
  locationId: string;
  locationName: string;
  balanceType: BalanceType;
  availableDays: number;
  asOf: string;
}

export interface BalanceBatchResponse {
  items: BalanceCell[];
  fetchedAt: string;
}

export interface TimeOffRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  managerId: string;
  locationId: string;
  locationName: string;
  balanceType: BalanceType;
  startDate: string;
  endDate: string;
  daysRequested: number;
  status: RequestStatus;
  note?: string;
  hcmConfirmedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTimeOffRequest {
  employeeId: string;
  locationId: string;
  balanceType: BalanceType;
  startDate: string;
  endDate: string;
  daysRequested: number;
  note?: string;
}

export interface PatchTimeOffRequest {
  action: 'approve' | 'deny';
  managerId: string;
  balanceSnapshotDays?: number;
}

export interface ApiError {
  code:
    | 'INSUFFICIENT_BALANCE'
    | 'INVALID_DIMENSION'
    | 'STATE_CONFLICT'
    | 'RATE_LIMITED'
    | 'GATEWAY_TIMEOUT'
    | 'NOT_FOUND';
  message: string;
}

export type ChaosAction =
  | 'anniversary_bonus'
  | 'silent_wrong_next'
  | 'slow_confirm_next'
  | 'slow_network'
  | 'reset'
  | 'year_start_refresh';

export interface ChaosTrigger {
  action: ChaosAction;
  employeeId?: string;
  locationId?: string;
  bonusDays?: number;
  delayMs?: number;
}

export interface ChaosResult {
  applied: boolean;
  message: string;
  affectedCells?: BalanceCell[];
}

export interface SessionUser {
  userId: string;
  email: string;
  name: string;
  role: UserRole;
}
