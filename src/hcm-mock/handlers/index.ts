import type {
  ApiError,
  BalanceBatchResponse,
  BalanceCell,
  CreateTimeOffRequest,
  PatchTimeOffRequest,
  TimeOffRequest,
} from '@/shared/types/hcm';
import { shouldSilentWrong } from '../chaos-controls';
import {
  applyDelay,
  generateRequestId,
  getAllBalances,
  getBalanceCell,
  getDemoUserById,
  getHcmState,
  updateBalanceCell,
} from '../store';

const now = () => new Date().toISOString();

function finalizeConfirmedRequest(
  requestId: string,
  body: CreateTimeOffRequest,
): void {
  const state = getHcmState();
  const current = state.requests.get(requestId);
  const cell = getBalanceCell(body.employeeId, body.locationId, body.balanceType);
  if (!current || !cell || cell.availableDays < body.daysRequested) return;

  updateBalanceCell({
    ...cell,
    availableDays: cell.availableDays - body.daysRequested,
  });

  state.requests.set(requestId, {
    ...current,
    status: 'manager_pending',
    hcmConfirmedAt: now(),
    updatedAt: now(),
  });
}

function scheduleSlowConfirmation(requestId: string, body: CreateTimeOffRequest): void {
  setTimeout(() => {
    const current = getHcmState().requests.get(requestId);
    if (current?.status === 'hcm_confirming') {
      getHcmState().requests.set(requestId, {
        ...current,
        status: 'stale_confirmation',
        updatedAt: now(),
      });
    }
  }, 15_000);

  setTimeout(() => finalizeConfirmedRequest(requestId, body), 25_000);
}

export async function handleGetBalancesBatch(
  employeeId?: string,
  delayMs?: number,
): Promise<BalanceBatchResponse | ApiError> {
  const state = getHcmState();
  state.batchCallCount += 1;

  if (state.rateLimitBatch && state.batchCallCount > 3) {
    return { code: 'RATE_LIMITED', message: 'Batch endpoint rate limited' };
  }

  await applyDelay(delayMs);

  if (delayMs && delayMs > 25000) {
    return { code: 'GATEWAY_TIMEOUT', message: 'HCM batch request timed out' };
  }

  return {
    items: getAllBalances(employeeId),
    fetchedAt: now(),
  };
}

export async function handleGetBalanceCell(
  employeeId: string,
  locationId: string,
  balanceType: 'vacation' | 'sick' = 'vacation',
  delayMs?: number,
): Promise<BalanceCell | ApiError> {
  await applyDelay(delayMs);

  if (delayMs && delayMs > 25000) {
    return { code: 'GATEWAY_TIMEOUT', message: 'HCM cell read timed out' };
  }

  const cell = getBalanceCell(employeeId, locationId, balanceType);
  if (!cell) {
    return { code: 'NOT_FOUND', message: 'Balance cell not found' };
  }
  return cell;
}

export async function handleCreateTimeOffRequest(
  body: CreateTimeOffRequest,
  delayMs?: number,
): Promise<{ status: number; data: TimeOffRequest | ApiError }> {
  const employee = getDemoUserById(body.employeeId);
  if (!employee?.managerId) {
    return {
      status: 400,
      data: { code: 'INVALID_DIMENSION', message: 'Invalid employee or dimension' },
    };
  }

  const cell = getBalanceCell(body.employeeId, body.locationId, body.balanceType);
  if (!cell) {
    return {
      status: 400,
      data: { code: 'INVALID_DIMENSION', message: 'Invalid location or balance type' },
    };
  }

  await applyDelay(delayMs);

  if (delayMs && delayMs > 25000) {
    return { status: 504, data: { code: 'GATEWAY_TIMEOUT', message: 'HCM submit timed out' } };
  }

  if (cell.availableDays < body.daysRequested) {
    return {
      status: 409,
      data: {
        code: 'INSUFFICIENT_BALANCE',
        message: `Only ${cell.availableDays} days available`,
      },
    };
  }

  const id = generateRequestId();
  const timestamp = now();
  const request: TimeOffRequest = {
    id,
    employeeId: body.employeeId,
    employeeName: employee.name,
    managerId: employee.managerId,
    locationId: body.locationId,
    locationName: cell.locationName,
    balanceType: body.balanceType,
    startDate: body.startDate,
    endDate: body.endDate,
    daysRequested: body.daysRequested,
    status: 'manager_pending',
    note: body.note,
    hcmConfirmedAt: timestamp,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  if (shouldSilentWrong()) {
    const wrongRequest: TimeOffRequest = {
      ...request,
      status: 'silently_wrong',
      daysRequested: body.daysRequested - 1,
    };
    getHcmState().requests.set(id, request);
    return { status: 200, data: wrongRequest };
  }

  const state = getHcmState();
  if (state.slowConfirmNext) {
    state.slowConfirmNext = false;
    const confirming: TimeOffRequest = {
      ...request,
      status: 'hcm_confirming',
      hcmConfirmedAt: undefined,
    };
    state.requests.set(id, confirming);
    scheduleSlowConfirmation(id, body);
    return { status: 201, data: confirming };
  }

  updateBalanceCell({
    ...cell,
    availableDays: cell.availableDays - body.daysRequested,
  });
  getHcmState().requests.set(id, request);

  return { status: 201, data: request };
}

export async function handleListTimeOffRequests(filters: {
  status?: string;
  managerId?: string;
  employeeId?: string;
}): Promise<{ items: TimeOffRequest[] }> {
  let items = Array.from(getHcmState().requests.values());

  if (filters.employeeId) {
    items = items.filter((r) => r.employeeId === filters.employeeId);
  }
  if (filters.managerId) {
    items = items.filter((r) => r.managerId === filters.managerId);
  }
  if (filters.status) {
    items = items.filter((r) => r.status === filters.status);
  }

  return { items: items.sort((a, b) => b.createdAt.localeCompare(a.createdAt)) };
}

export async function handlePatchTimeOffRequest(
  requestId: string,
  body: PatchTimeOffRequest,
  delayMs?: number,
): Promise<{ status: number; data: TimeOffRequest | ApiError }> {
  const state = getHcmState();
  const request = state.requests.get(requestId);

  if (!request) {
    return { status: 404, data: { code: 'NOT_FOUND', message: 'Request not found' } };
  }

  if (request.status === 'withdrawn') {
    return {
      status: 409,
      data: { code: 'STATE_CONFLICT', message: 'Request was withdrawn' },
    };
  }

  await applyDelay(delayMs);

  if (body.action === 'approve') {
    const cell = getBalanceCell(
      request.employeeId,
      request.locationId,
      request.balanceType,
    );

    if (!cell) {
      return {
        status: 400,
        data: { code: 'INVALID_DIMENSION', message: 'Balance cell missing' },
      };
    }

    if (
      body.balanceSnapshotDays !== undefined &&
      body.balanceSnapshotDays !== cell.availableDays
    ) {
      return {
        status: 409,
        data: {
          code: 'INSUFFICIENT_BALANCE',
          message: `Balance changed: saw ${body.balanceSnapshotDays}, HCM now reports ${cell.availableDays}`,
        },
      };
    }

    const updated: TimeOffRequest = {
      ...request,
      status: 'approved',
      updatedAt: now(),
    };
    state.requests.set(requestId, updated);
    return { status: 200, data: updated };
  }

  const cell = getBalanceCell(
    request.employeeId,
    request.locationId,
    request.balanceType,
  );
  if (cell) {
    updateBalanceCell({
      ...cell,
      availableDays: cell.availableDays + request.daysRequested,
    });
  }

  const updated: TimeOffRequest = {
    ...request,
    status: 'denied',
    updatedAt: now(),
  };
  state.requests.set(requestId, updated);
  return { status: 200, data: updated };
}

export async function handleWithdrawTimeOffRequest(
  requestId: string,
): Promise<{ status: number; data?: ApiError }> {
  const state = getHcmState();
  const request = state.requests.get(requestId);

  if (!request) {
    return { status: 404, data: { code: 'NOT_FOUND', message: 'Request not found' } };
  }

  if (request.status === 'approved' || request.status === 'denied') {
    return {
      status: 409,
      data: { code: 'STATE_CONFLICT', message: 'Cannot withdraw finalized request' },
    };
  }

  const cell = getBalanceCell(
    request.employeeId,
    request.locationId,
    request.balanceType,
  );
  if (cell) {
    updateBalanceCell({
      ...cell,
      availableDays: cell.availableDays + request.daysRequested,
    });
  }

  state.requests.set(requestId, {
    ...request,
    status: 'withdrawn',
    updatedAt: now(),
  });

  return { status: 204 };
}

export { triggerChaos } from '../chaos-controls';
