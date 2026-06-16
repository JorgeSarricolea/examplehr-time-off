'use client';

import { Stack } from '@mui/material';
import { ApprovalQueue } from '@/features/manager-approvals/ApprovalQueue';
import { PageHeader } from '@/shared/ui/PageHeader';
import { useManagerRequests } from '@/features/balances/hooks';
import { useSessionStore } from '@/features/auth/session-store';

export function ManagerApprovalsPage() {
  const managerId = useSessionStore((s) => s.user?.userId ?? '');
  const query = useManagerRequests(managerId);
  const pendingCount =
    query.data?.items.filter((r) => r.status === 'manager_pending').length ?? 0;

  return (
    <Stack spacing={2}>
      <PageHeader
        title="Approvals"
        chipLabel={pendingCount > 0 ? `${pendingCount} pending` : undefined}
      />
      <ApprovalQueue managerId={managerId} filter="pending" />
    </Stack>
  );
}
