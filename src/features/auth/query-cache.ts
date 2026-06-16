import type { QueryClient } from '@tanstack/react-query';

export function clearPayrollQueryCache(queryClient: QueryClient) {
  queryClient.removeQueries({ queryKey: ['requests'] });
  queryClient.removeQueries({ queryKey: ['balances'] });
}

export function invalidatePayrollQueryCache(queryClient: QueryClient) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: ['requests'] }),
    queryClient.invalidateQueries({ queryKey: ['balances'] }),
  ]);
}
