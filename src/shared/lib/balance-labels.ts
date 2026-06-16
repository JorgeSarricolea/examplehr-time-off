import type { BalanceType } from '@/shared/types/hcm';

export const BALANCE_TYPE_LABELS: Record<BalanceType, string> = {
  vacation: 'Vacation',
  sick: 'Sick leave',
};

export const BALANCE_TYPE_ORDER: Record<BalanceType, number> = {
  vacation: 0,
  sick: 1,
};

export function sortBalanceCells<T extends { balanceType: BalanceType }>(cells: T[]): T[] {
  return [...cells].sort(
    (a, b) => BALANCE_TYPE_ORDER[a.balanceType] - BALANCE_TYPE_ORDER[b.balanceType],
  );
}
