'use client';

import { Stack } from '@mui/material';
import { ApprovalQueue } from '@/features/manager-approvals/ApprovalQueue';
import { PageHeader } from '@/shared/ui/PageHeader';
import { useSessionStore } from '@/features/auth/session-store';

export function ManagerHistoryPage() {
  const managerId = useSessionStore((s) => s.user?.userId ?? '');

  return (
    <Stack spacing={2}>
      <PageHeader title="History" />
      <ApprovalQueue managerId={managerId} filter="history" />
    </Stack>
  );
}
