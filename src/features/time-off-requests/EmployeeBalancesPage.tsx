'use client';

import { Stack } from '@mui/material';
import { BalanceList } from '@/features/balances/BalanceList';
import { PageHeader } from '@/shared/ui/PageHeader';
import { useSessionStore } from '@/features/auth/session-store';

export function EmployeeBalancesPage() {
  const userId = useSessionStore((s) => s.user?.userId ?? '');

  return (
    <Stack spacing={2}>
      <PageHeader
        title="Your balances"
        subtitle="Days you can take off, grouped by where you work."
      />
      <BalanceList employeeId={userId} />
    </Stack>
  );
}
