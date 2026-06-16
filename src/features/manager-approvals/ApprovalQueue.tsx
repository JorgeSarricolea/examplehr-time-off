'use client';

import { useState } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import {
  Box,
  Dialog,
  Drawer,
  IconButton,
  Skeleton,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { ApprovalDetailPanel } from '@/features/manager-approvals/ApprovalDetailPanel';
import { ApprovalRequestRow } from '@/features/manager-approvals/ApprovalRequestRow';
import { ManagerEmptyState } from '@/features/manager-approvals/ManagerEmptyState';
import { useManagerRequests } from '@/features/balances/hooks';
import type { TimeOffRequest } from '@/shared/types/hcm';

function QueueSkeleton() {
  return (
    <Stack spacing={1}>
      <Skeleton variant="rounded" height={88} />
      <Skeleton variant="rounded" height={88} />
    </Stack>
  );
}

interface ApprovalQueueProps {
  managerId: string;
  filter?: 'pending' | 'history';
  isLoading?: boolean;
  requests?: TimeOffRequest[];
  initialSelectedId?: string | null;
  initialDetailOpen?: boolean;
}

export function ApprovalQueue({
  managerId,
  filter = 'pending',
  isLoading: forceLoading,
  requests: overrideRequests,
  initialSelectedId = null,
  initialDetailOpen = false,
}: ApprovalQueueProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const query = useManagerRequests(managerId);
  const [selectedId, setSelectedId] = useState<string | null>(initialSelectedId);
  const [detailOpen, setDetailOpen] = useState(initialDetailOpen);

  const allRequests = overrideRequests ?? query.data?.items ?? [];
  const isHistory = filter === 'history';

  const isLoading =
    forceLoading ??
    (query.isPending || (query.isFetching && allRequests.length === 0));

  const requests = isHistory
    ? allRequests.filter((r) => r.status === 'approved' || r.status === 'denied')
    : allRequests.filter((r) => r.status === 'manager_pending');

  const selected = selectedId ? requests.find((r) => r.id === selectedId) : undefined;

  const openDetail = (requestId: string) => {
    setSelectedId(requestId);
    setDetailOpen(true);
  };

  const closeDetail = () => {
    setDetailOpen(false);
    setSelectedId(null);
  };

  const handleResolved = (resolvedId: string) => {
    const idx = requests.findIndex((r) => r.id === resolvedId);
    const nextId = requests[idx + 1]?.id;

    if (!isHistory && nextId) {
      setSelectedId(nextId);
      setDetailOpen(true);
      return;
    }

    closeDetail();
  };

  if (isLoading) {
    return <QueueSkeleton />;
  }

  if (requests.length === 0) {
    return <ManagerEmptyState variant={isHistory ? 'history' : 'pending'} />;
  }

  const detailBody = selected ? (
    <Stack spacing={2} sx={{ p: { xs: 2, sm: 3 } }}>
      <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={1}>
        <Box>
          <Typography variant="h6">{isHistory ? 'Decision details' : 'Review request'}</Typography>
          {!isHistory && (
            <Typography variant="body2" color="text.secondary">
              Balance is re-checked with payroll before you approve.
            </Typography>
          )}
        </Box>
        <IconButton onClick={closeDetail} aria-label="Close" size="small">
          <CloseIcon />
        </IconButton>
      </Stack>
      <ApprovalDetailPanel
        key={selected.id}
        request={selected}
        managerId={managerId}
        readOnly={isHistory}
        onResolved={isHistory ? undefined : handleResolved}
      />
    </Stack>
  ) : null;

  return (
    <>
      <Stack spacing={1} role="list" aria-label={isHistory ? 'Past decisions' : 'Pending requests'}>
        {requests.map((req) => (
          <Box key={req.id} role="listitem">
            <ApprovalRequestRow
              request={req}
              highlighted={detailOpen && req.id === selectedId}
              showStatus={isHistory}
              onSelect={() => openDetail(req.id)}
            />
          </Box>
        ))}
      </Stack>

      {isMobile ? (
        <Dialog fullScreen open={detailOpen} onClose={closeDetail}>
          {detailBody}
        </Dialog>
      ) : (
        <Drawer
          anchor="right"
          open={detailOpen}
          onClose={closeDetail}
          PaperProps={{ sx: { width: { sm: 420, md: 480 } } }}
        >
          {detailBody}
        </Drawer>
      )}
    </>
  );
}
