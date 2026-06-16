export const queryKeys = {
  balances: {
    batch: (employeeId: string) => ['balances', 'batch', employeeId] as const,
    cell: (employeeId: string, locationId: string, balanceType: string) =>
      ['balances', 'cell', employeeId, locationId, balanceType] as const,
  },
  requests: {
    all: (filters: Record<string, string | undefined>) =>
      ['requests', filters] as const,
    employee: (employeeId: string) => ['requests', { employeeId }] as const,
    manager: (managerId: string) => ['requests', { managerId }] as const,
  },
};
