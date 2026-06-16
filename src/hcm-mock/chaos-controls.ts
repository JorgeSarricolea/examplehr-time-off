import type { ChaosResult, ChaosTrigger } from '@/shared/types/hcm';
import {
  applyAnniversaryBonus,
  applyYearStartRefresh,
  getHcmState,
  resetHcmState,
} from './store';

export function triggerChaos(input: ChaosTrigger): ChaosResult {
  const state = getHcmState();

  const handlers: Record<ChaosTrigger['action'], () => ChaosResult> = {
    anniversary_bonus: () => {
      const affected = applyAnniversaryBonus(
        input.employeeId,
        input.locationId,
        input.bonusDays ?? 1,
      );
      return {
        applied: true,
        message: `Anniversary bonus applied (+${input.bonusDays ?? 1} vacation day(s))`,
        affectedCells: affected,
      };
    },
    silent_wrong_next: () => {
      state.silentWrongNext = true;
      return {
        applied: true,
        message: 'Next POST will return silent-wrong success',
      };
    },
    slow_confirm_next: () => {
      state.slowConfirmNext = true;
      return {
        applied: true,
        message: 'Next POST will stay in payroll confirmation (stale after 15s)',
      };
    },
    slow_network: () => {
      state.defaultDelayMs = input.delayMs ?? 3000;
      return {
        applied: true,
        message: `Default HCM delay set to ${state.defaultDelayMs}ms`,
      };
    },
    reset: () => {
      resetHcmState();
      return {
        applied: true,
        message: 'HCM mock state reset',
      };
    },
    year_start_refresh: () => {
      const affected = applyYearStartRefresh();
      return {
        applied: true,
        message: 'Year-start balance refresh applied',
        affectedCells: affected,
      };
    },
  };

  return handlers[input.action]();
}

export function shouldSilentWrong(): boolean {
  const state = getHcmState();
  if (state.silentWrongNext) {
    state.silentWrongNext = false;
    return true;
  }
  if (process.env.VITEST) return false;
  if (process.env.NODE_ENV === 'production') return false;
  return Math.random() < 0.05;
}
