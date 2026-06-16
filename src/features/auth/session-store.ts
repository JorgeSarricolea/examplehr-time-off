'use client';

import { create } from 'zustand';
import type { SessionUser } from '@/shared/types/hcm';

interface SessionState {
  user: SessionUser | null;
  setUser: (user: SessionUser | null) => void;
  optimisticDeductions: Array<{
    employeeId: string;
    locationId: string;
    balanceType: string;
    days: number;
  }>;
  addOptimisticDeduction: (deduction: SessionState['optimisticDeductions'][0]) => void;
  clearOptimisticDeduction: (
    employeeId: string,
    locationId: string,
    balanceType: string,
  ) => void;
  selectedRequestId: string | null;
  setSelectedRequestId: (id: string | null) => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  optimisticDeductions: [],
  addOptimisticDeduction: (deduction) =>
    set((s) => ({
      optimisticDeductions: [...s.optimisticDeductions, deduction],
    })),
  clearOptimisticDeduction: (employeeId, locationId, balanceType) =>
    set((s) => ({
      optimisticDeductions: s.optimisticDeductions.filter(
        (d) =>
          !(
            d.employeeId === employeeId &&
            d.locationId === locationId &&
            d.balanceType === balanceType
          ),
      ),
    })),
  selectedRequestId: null,
  setSelectedRequestId: (id) => set({ selectedRequestId: id }),
}));
