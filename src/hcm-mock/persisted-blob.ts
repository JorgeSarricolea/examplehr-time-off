import type { BalanceCell, TimeOffRequest } from '@/shared/types/hcm';
import type { HcmMockState } from './store';

export const HCM_MOCK_PERSISTENCE_KEY = 'hcm-mock:state';

export interface PersistedHcmBlob {
  balances: BalanceCell[];
  requests: TimeOffRequest[];
  requestCounter: number;
}

function cellKey(employeeId: string, locationId: string, balanceType: string) {
  return `${employeeId}:${locationId}:${balanceType}`;
}

export function snapshotHcmState(state: HcmMockState): PersistedHcmBlob {
  return {
    balances: Array.from(state.balances.values()),
    requests: Array.from(state.requests.values()),
    requestCounter: state.requestCounter,
  };
}

export function applyPersistedBlob(
  state: HcmMockState,
  blob: PersistedHcmBlob,
): void {
  state.balances.clear();
  blob.balances.forEach((cell) => {
    state.balances.set(
      cellKey(cell.employeeId, cell.locationId, cell.balanceType),
      cell,
    );
  });

  state.requests.clear();
  blob.requests.forEach((request) => {
    state.requests.set(request.id, request);
  });

  state.requestCounter = blob.requestCounter;
}
