import type { BalanceCell, DemoUser, TimeOffRequest } from '@/shared/types/hcm';

export const DEMO_USERS: DemoUser[] = [
  {
    id: 'emp-alex',
    email: 'alex@example.com',
    name: 'Alex Rivera',
    role: 'employee',
    managerId: 'mgr-morgan',
  },
  {
    id: 'emp-sam',
    email: 'sam@example.com',
    name: 'Sam Chen',
    role: 'employee',
    managerId: 'mgr-morgan',
  },
  {
    id: 'mgr-morgan',
    email: 'morgan@example.com',
    name: 'Morgan Lee',
    role: 'manager',
  },
];

const now = () => new Date().toISOString();

function cellKey(employeeId: string, locationId: string, balanceType: string) {
  return `${employeeId}:${locationId}:${balanceType}`;
}

export function createInitialBalances(): BalanceCell[] {
  const t = now();
  return [
    {
      employeeId: 'emp-alex',
      locationId: 'loc-austin',
      locationName: 'Austin HQ',
      balanceType: 'vacation',
      availableDays: 12,
      asOf: t,
    },
    {
      employeeId: 'emp-alex',
      locationId: 'loc-austin',
      locationName: 'Austin HQ',
      balanceType: 'sick',
      availableDays: 5,
      asOf: t,
    },
    {
      employeeId: 'emp-alex',
      locationId: 'loc-remote',
      locationName: 'Remote',
      balanceType: 'vacation',
      availableDays: 8,
      asOf: t,
    },
    {
      employeeId: 'emp-sam',
      locationId: 'loc-nyc',
      locationName: 'New York',
      balanceType: 'vacation',
      availableDays: 10,
      asOf: t,
    },
    {
      employeeId: 'emp-sam',
      locationId: 'loc-nyc',
      locationName: 'New York',
      balanceType: 'sick',
      availableDays: 4,
      asOf: t,
    },
  ];
}

export interface HcmMockState {
  balances: Map<string, BalanceCell>;
  requests: Map<string, TimeOffRequest>;
  requestCounter: number;
  silentWrongNext: boolean;
  slowConfirmNext: boolean;
  defaultDelayMs: number;
  batchCallCount: number;
  rateLimitBatch: boolean;
}

export function createHcmMockState(): HcmMockState {
  const balances = new Map<string, BalanceCell>();
  createInitialBalances().forEach((cell) => {
    balances.set(cellKey(cell.employeeId, cell.locationId, cell.balanceType), cell);
  });

  return {
    balances,
    requests: new Map(),
    requestCounter: 0,
    silentWrongNext: false,
    slowConfirmNext: false,
    defaultDelayMs: 0,
    batchCallCount: 0,
    rateLimitBatch: false,
  };
}

let globalState: HcmMockState = createHcmMockState();

export function getHcmState(): HcmMockState {
  return globalState;
}

export function resetHcmState(): void {
  globalState = createHcmMockState();
}

export function getDemoUserByEmail(email: string): DemoUser | undefined {
  return DEMO_USERS.find((u) => u.email === email);
}

export function getDemoUserById(id: string): DemoUser | undefined {
  return DEMO_USERS.find((u) => u.id === id);
}

export function getBalanceCell(
  employeeId: string,
  locationId: string,
  balanceType?: string,
): BalanceCell | undefined {
  if (balanceType) {
    return globalState.balances.get(cellKey(employeeId, locationId, balanceType));
  }
  const vacation = globalState.balances.get(cellKey(employeeId, locationId, 'vacation'));
  return vacation ?? globalState.balances.get(cellKey(employeeId, locationId, 'sick'));
}

export function getAllBalances(employeeId?: string): BalanceCell[] {
  const items = Array.from(globalState.balances.values());
  return employeeId ? items.filter((b) => b.employeeId === employeeId) : items;
}

export function updateBalanceCell(cell: BalanceCell): void {
  globalState.balances.set(
    cellKey(cell.employeeId, cell.locationId, cell.balanceType),
    { ...cell, asOf: now() },
  );
}

export function applyAnniversaryBonus(
  employeeId?: string,
  locationId?: string,
  bonusDays = 1,
): BalanceCell[] {
  const affected: BalanceCell[] = [];
  const cells = getAllBalances(employeeId).filter(
    (c) => !locationId || c.locationId === locationId,
  );

  cells
    .filter((c) => c.balanceType === 'vacation')
    .forEach((cell) => {
      const updated = {
        ...cell,
        availableDays: cell.availableDays + bonusDays,
        asOf: now(),
      };
      updateBalanceCell(updated);
      affected.push(updated);
    });

  return affected;
}

export function applyYearStartRefresh(): BalanceCell[] {
  const affected: BalanceCell[] = [];
  globalState.balances.forEach((cell, key) => {
    const refreshed = {
      ...cell,
      availableDays: cell.balanceType === 'vacation' ? 15 : 5,
      asOf: now(),
    };
    globalState.balances.set(key, refreshed);
    affected.push(refreshed);
  });
  return affected;
}

export function generateRequestId(): string {
  globalState.requestCounter += 1;
  return `req-${globalState.requestCounter}`;
}

export async function applyDelay(ms?: number): Promise<void> {
  const delay = ms ?? globalState.defaultDelayMs;
  if (delay > 0) {
    await new Promise((resolve) => setTimeout(resolve, delay));
  }
}
