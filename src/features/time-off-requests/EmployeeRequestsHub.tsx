'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  Divider,
  Drawer,
  IconButton,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import { useBalancesBatch, useEmployeeRequests } from '@/features/balances/hooks';
import { ConflictCard } from '@/features/time-off-requests/ConflictCard';
import { RequestForm } from '@/features/time-off-requests/RequestForm';
import { RequestRow } from '@/features/time-off-requests/RequestRow';
import { StatusLegend } from '@/shared/ui/StatusLegend';
import { useSessionStore } from '@/features/auth/session-store';
import { displayRequestStatus } from '@/shared/lib/request-status';
import type { RequestStatus } from '@/shared/types/hcm';

interface EmployeeRequestsHubProps {
  initialFormOpen?: boolean;
  initialFormError?: string | null;
}

export function EmployeeRequestsHub({
  initialFormOpen = false,
  initialFormError = null,
}: EmployeeRequestsHubProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const router = useRouter();
  const userId = useSessionStore((s) => s.user?.userId ?? '');
  const balancesQuery = useBalancesBatch(userId);
  const requestsQuery = useEmployeeRequests(userId);
  const requests = useMemo(
    () => requestsQuery.data?.items ?? [],
    [requestsQuery.data?.items],
  );
  const hasConfirming = requests.some((r) => r.status === 'hcm_confirming');

  const [formOpen, setFormOpen] = useState(initialFormOpen);
  const [conflict, setConflict] = useState<string | null>(null);
  const [conflictDays, setConflictDays] = useState(0);
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<RequestStatus | null>(null);

  const filteredRequests = useMemo(() => {
    if (!statusFilter) return requests;
    return requests.filter((request) => displayRequestStatus(request) === statusFilter);
  }, [requests, statusFilter]);

  const openForm = useCallback(() => {
    setFormOpen(true);
    router.replace('/employee/requests/new', { scroll: false });
  }, [router]);

  const closeForm = useCallback(() => {
    setFormOpen(false);
    setConflict(null);
    router.replace('/employee/requests', { scroll: false });
  }, [router]);

  useEffect(() => {
    setFormOpen(initialFormOpen);
  }, [initialFormOpen]);

  useEffect(() => {
    if (!hasConfirming) return;
    const timer = setInterval(() => {
      requestsQuery.refetch();
    }, 5_000);
    return () => clearInterval(timer);
  }, [hasConfirming, requestsQuery]);

  const handleSuccess = (requestId: string) => {
    requestsQuery.refetch();
    setHighlightId(requestId);
    closeForm();
  };

  const formBody = (
    <Stack spacing={2} sx={{ p: { xs: 2, sm: 3 } }}>
      <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={1}>
        <Box>
          <Typography variant="h6">Request time off</Typography>
          <Typography variant="body2" color="text.secondary">
            Business days only (Mon–Fri).
          </Typography>
        </Box>
        <IconButton onClick={closeForm} aria-label="Close" size="small">
          <CloseIcon />
        </IconButton>
      </Stack>

      {conflict && (
        <ConflictCard
          requestedDays={conflictDays}
          message={conflict}
          onRetry={() => {
            setConflict(null);
            balancesQuery.refetch();
          }}
          onWithdraw={() => setConflict(null)}
        />
      )}

      <RequestForm
        employeeId={userId}
        balances={balancesQuery.data?.items ?? []}
        initialError={initialFormError}
        onConflict={(message, days) => {
          setConflict(message);
          setConflictDays(days);
        }}
        onSuccess={(requestId) => handleSuccess(requestId)}
      />
    </Stack>
  );

  return (
    <Stack spacing={2}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems={{ sm: 'center' }}
        justifyContent="space-between"
        spacing={1.5}
        sx={{ mb: 2.5 }}
      >
        <Typography variant="h4" component="h1">
          Requests
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={openForm}
          sx={{ alignSelf: { xs: 'stretch', sm: 'flex-start' }, flexShrink: 0 }}
        >
          Request time off
        </Button>
      </Stack>

      <StatusLegend selected={statusFilter} onChange={setStatusFilter} />

      {requests.length === 0 ? (
        <Card variant="outlined" sx={{ borderStyle: 'dashed', bgcolor: 'background.paper' }}>
          <CardContent>
            <Stack spacing={1.5} alignItems="center" textAlign="center" sx={{ py: 4 }}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  bgcolor: 'action.hover',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <AssignmentOutlinedIcon color="primary" />
              </Box>
              <Typography variant="body1" color="text.secondary" maxWidth={400}>
                No time off booked yet. Submissions and payroll status will show up here.
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      ) : filteredRequests.length === 0 ? (
        <Card variant="outlined" sx={{ bgcolor: 'background.paper' }}>
          <CardContent>
            <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ py: 3 }}>
              No requests match this status. Click the filter again to show all.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Stack spacing={1.5} divider={<Divider flexItem />}>
          {filteredRequests.map((req) => (
            <RequestRow
              key={req.id}
              request={req}
              employeeId={userId}
              highlight={req.id === highlightId}
              onRetryConfirmation={() => requestsQuery.refetch()}
              isRetryingConfirmation={requestsQuery.isFetching}
            />
          ))}
        </Stack>
      )}

      {isMobile ? (
        <Dialog fullScreen open={formOpen} onClose={closeForm}>
          {formBody}
        </Dialog>
      ) : (
        <Drawer
          anchor="right"
          open={formOpen}
          onClose={closeForm}
          PaperProps={{ sx: { width: { sm: 420, md: 480 } } }}
        >
          {formBody}
        </Drawer>
      )}
    </Stack>
  );
}
