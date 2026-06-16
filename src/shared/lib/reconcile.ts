import type { BalanceCell } from '@/shared/types/hcm';

export interface OptimisticDeduction {
  employeeId: string;
  locationId: string;
  balanceType: string;
  days: number;
}

export function reconcileBalances(
  serverCells: BalanceCell[],
  optimisticDeductions: OptimisticDeduction[],
): BalanceCell[] {
  return serverCells.map((cell) => {
    const pending = optimisticDeductions.find(
      (d) =>
        d.employeeId === cell.employeeId &&
        d.locationId === cell.locationId &&
        d.balanceType === cell.balanceType,
    );
    if (!pending) return cell;
    return {
      ...cell,
      availableDays: Math.max(0, cell.availableDays - pending.days),
    };
  });
}

export function detectBalanceDiff(
  previous: BalanceCell[],
  current: BalanceCell[],
): Array<{ cell: BalanceCell; delta: number }> {
  const changes: Array<{ cell: BalanceCell; delta: number }> = [];

  current.forEach((cell) => {
    const prev = previous.find(
      (p) =>
        p.employeeId === cell.employeeId &&
        p.locationId === cell.locationId &&
        p.balanceType === cell.balanceType,
    );
    if (prev && prev.availableDays !== cell.availableDays) {
      changes.push({ cell, delta: cell.availableDays - prev.availableDays });
    }
  });

  return changes;
}

export function hasSilentWrongConflict(
  responseDays: number,
  persistedDays: number,
): boolean {
  return responseDays !== persistedDays;
}

export function formatFreshness(asOf: string): string {
  const seconds = Math.floor((Date.now() - new Date(asOf).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  return `${minutes}m ago`;
}
