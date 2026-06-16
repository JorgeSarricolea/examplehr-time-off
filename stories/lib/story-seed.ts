import { getHcmState, resetHcmState } from '@/hcm-mock/store';
import type { RequestStatus, TimeOffRequest } from '@/shared/types/hcm';

const now = () => new Date().toISOString();

function baseRequest(overrides: Partial<TimeOffRequest>): TimeOffRequest {
  return {
    id: 'req-story-1',
    employeeId: 'emp-alex',
    employeeName: 'Alex Rivera',
    managerId: 'mgr-morgan',
    locationId: 'loc-austin',
    locationName: 'Austin HQ',
    balanceType: 'vacation',
    startDate: '2026-07-07',
    endDate: '2026-07-08',
    daysRequested: 2,
    status: 'manager_pending',
    createdAt: now(),
    updatedAt: now(),
    ...overrides,
  };
}

export function seedRequest(status: RequestStatus, overrides?: Partial<TimeOffRequest>) {
  resetHcmState();
  const request = baseRequest({ status, ...overrides });
  getHcmState().requests.set(request.id, request);
  return request;
}

export function seedManagerQueue(requests?: TimeOffRequest[]) {
  resetHcmState();
  const items =
    requests ??
    [
      baseRequest({ id: 'req-story-1', status: 'manager_pending' }),
      baseRequest({
        id: 'req-story-2',
        status: 'approved',
        employeeName: 'Sam Chen',
        employeeId: 'emp-sam',
        locationId: 'loc-nyc',
        locationName: 'New York',
      }),
    ];
  items.forEach((request) => {
    getHcmState().requests.set(request.id, request);
  });
  return items;
}
