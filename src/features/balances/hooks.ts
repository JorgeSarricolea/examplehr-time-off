'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { hcmApi } from '@/shared/lib/api';
import { queryKeys } from '@/shared/lib/query-keys';
import { reconcileBalances } from '@/shared/lib/reconcile';
import { useSessionStore } from '@/features/auth/session-store';
import { invalidatePayrollQueryCache } from '@/features/auth/query-cache';
import type { CreateTimeOffRequest, PatchTimeOffRequest } from '@/shared/types/hcm';

export function useBalancesBatch(employeeId: string) {
  const optimisticDeductions = useSessionStore((s) => s.optimisticDeductions);

  return useQuery({
    queryKey: queryKeys.balances.batch(employeeId),
    queryFn: () => hcmApi.getBalancesBatch(employeeId),
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
    staleTime: 10_000,
    select: (data) => ({
      ...data,
      items: reconcileBalances(data.items, optimisticDeductions),
    }),
  });
}

export function useBalanceCell(
  employeeId: string,
  locationId: string,
  balanceType: string,
  enabled = true,
) {
  return useQuery({
    queryKey: queryKeys.balances.cell(employeeId, locationId, balanceType),
    queryFn: () => hcmApi.getBalanceCell(employeeId, locationId, balanceType),
    enabled,
    staleTime: 5_000,
  });
}

export function useEmployeeRequests(employeeId: string) {
  return useQuery({
    queryKey: queryKeys.requests.employee(employeeId),
    queryFn: () => hcmApi.listRequests({ employeeId }),
    enabled: Boolean(employeeId),
    refetchOnMount: 'always',
    refetchInterval: (query) => {
      const items = query.state.data?.items ?? [];
      const needsPoll = items.some(
        (r) => r.status === 'hcm_confirming' || r.status === 'stale_confirmation',
      );
      return needsPoll ? 3_000 : false;
    },
  });
}

export function useManagerRequests(managerId: string) {
  return useQuery({
    queryKey: queryKeys.requests.manager(managerId),
    queryFn: () => hcmApi.listRequests({ managerId }),
    enabled: Boolean(managerId),
    refetchOnMount: 'always',
    refetchInterval: 15_000,
  });
}

export function useCreateRequestMutation(employeeId: string) {
  const queryClient = useQueryClient();
  const addDeduction = useSessionStore((s) => s.addOptimisticDeduction);
  const clearDeduction = useSessionStore((s) => s.clearOptimisticDeduction);

  return useMutation({
    mutationFn: (body: CreateTimeOffRequest) => hcmApi.createRequest(body),
    onMutate: async (body) => {
      addDeduction({
        employeeId: body.employeeId,
        locationId: body.locationId,
        balanceType: body.balanceType,
        days: body.daysRequested,
      });
      await queryClient.cancelQueries({
        queryKey: queryKeys.balances.batch(employeeId),
      });
    },
    onError: (_err, body) => {
      clearDeduction(body.employeeId, body.locationId, body.balanceType);
    },
    onSettled: (_data, _err, body) => {
      clearDeduction(body.employeeId, body.locationId, body.balanceType);
      void invalidatePayrollQueryCache(queryClient);
    },
  });
}

export function usePatchRequestMutation(_managerId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      requestId,
      body,
    }: {
      requestId: string;
      body: PatchTimeOffRequest;
    }) => hcmApi.patchRequest(requestId, body),
    onSettled: () => {
      void invalidatePayrollQueryCache(queryClient);
    },
  });
}

export function useWithdrawRequestMutation(_employeeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (requestId: string) => hcmApi.withdrawRequest(requestId),
    onSettled: () => {
      void invalidatePayrollQueryCache(queryClient);
    },
  });
}

export function useChaosMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: hcmApi.triggerChaos,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['balances'] });
    },
  });
}
