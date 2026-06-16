'use client';

import { useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Divider,
  Stack,
  Typography,
} from '@mui/material';
import { FreshnessGateModal } from '@/features/manager-approvals/FreshnessGateModal';
import { useBalanceCell, usePatchRequestMutation } from '@/features/balances/hooks';
import { BALANCE_TYPE_LABELS } from '@/shared/lib/balance-labels';
import { getLocationMeta } from '@/shared/lib/locations';
import { formatFreshness } from '@/shared/lib/reconcile';
import { hasInsufficientBalance } from '@/shared/lib/request-status';
import { StatusChip } from '@/shared/ui/StatusChip';
import { useSnackbar } from '@/providers/SnackbarProvider';
import type { TimeOffRequest } from '@/shared/types/hcm';

interface ApprovalDetailPanelProps {
  request: TimeOffRequest;
  managerId: string;
  readOnly?: boolean;
  onResolved?: (requestId: string) => void;
}

export function ApprovalDetailPanel({
  request,
  managerId,
  readOnly = false,
  onResolved,
}: ApprovalDetailPanelProps) {
  const patchMutation = usePatchRequestMutation(managerId);
  const { notify } = useSnackbar();
  const [gateOpen, setGateOpen] = useState(false);
  const [currentDays, setCurrentDays] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const snapshotRef = useRef<number | null>(null);

  const cellQuery = useBalanceCell(
    request.employeeId,
    request.locationId,
    request.balanceType,
    !readOnly,
  );

  if (!readOnly && cellQuery.data && snapshotRef.current === null) {
    snapshotRef.current = cellQuery.data.availableDays;
  }

  const snapshotDays = snapshotRef.current ?? cellQuery.data?.availableDays ?? 0;
  const liveDays = cellQuery.data?.availableDays;
  const balanceChanged =
    !readOnly &&
    liveDays !== undefined &&
    snapshotRef.current !== null &&
    liveDays !== snapshotRef.current;
  const location = getLocationMeta(request.locationId, request.locationName);
  const balanceLabel = BALANCE_TYPE_LABELS[request.balanceType];
  const isPending = request.status === 'manager_pending';
  const effectiveDays = liveDays ?? snapshotDays;
  const insufficientBalance = !readOnly && hasInsufficientBalance(effectiveDays, request.daysRequested);

  const approve = async (skipGate = false) => {
    setError(null);
    if (!skipGate) {
      const fresh = await cellQuery.refetch();
      const days = fresh.data?.availableDays ?? snapshotDays;
      const baseline = snapshotRef.current ?? snapshotDays;
      if (hasInsufficientBalance(days, request.daysRequested)) {
        setError(
          `Not enough days available (${days} remaining, ${request.daysRequested} requested).`,
        );
        return;
      }
      if (days !== baseline) {
        setCurrentDays(days);
        setGateOpen(true);
        return;
      }
    }

    try {
      notify('Verifying balance with payroll…', { severity: 'info' });
      await patchMutation.mutateAsync({
        requestId: request.id,
        body: {
          action: 'approve',
          managerId,
          balanceSnapshotDays: snapshotDays,
        },
      });
      notify(`Approved ${request.employeeName}'s request.`, { severity: 'success' });
      onResolved?.(request.id);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Approval failed';
      setError(message);
      notify(message, { severity: 'error' });
    }
  };

  const deny = async () => {
    try {
      await patchMutation.mutateAsync({
        requestId: request.id,
        body: { action: 'deny', managerId },
      });
      notify(`Denied ${request.employeeName}'s request.`, { severity: 'info' });
      onResolved?.(request.id);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Deny failed';
      setError(message);
      notify(message, { severity: 'error' });
    }
  };

  return (
    <Stack spacing={2}>
      <Stack direction="row" spacing={1} alignItems="flex-start" justifyContent="space-between">
        <Typography variant="h6" component="p">
          {request.employeeName}
        </Typography>
        <StatusChip status={request.status} />
      </Stack>

      <Box
        sx={{
          p: 1.75,
          borderRadius: 1.5,
          bgcolor: 'action.hover',
        }}
      >
        <Stack spacing={0.75}>
          <Typography variant="subtitle2">
            {balanceLabel} · {location.title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {request.daysRequested} business day(s) · {request.startDate} → {request.endDate}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {location.subtitle}
          </Typography>

          {!readOnly && (
            <>
              <Divider sx={{ my: 0.5 }} />
              <Typography variant="body2">
                Available when you opened: <strong>{snapshotDays}</strong> days
              </Typography>
              {cellQuery.data && (
                <Typography variant="body2" color="text.secondary">
                  Current from payroll: <strong>{liveDays}</strong> days · updated{' '}
                  {formatFreshness(cellQuery.data.asOf)}
                </Typography>
              )}
            </>
          )}
        </Stack>
      </Box>

      {balanceChanged && liveDays !== undefined && !insufficientBalance && (
        <Alert severity="warning" variant="outlined">
          Balance changed since you opened this (was {snapshotRef.current}, now {liveDays}).
        </Alert>
      )}

      {insufficientBalance && (
        <Alert severity="error" variant="outlined">
          Cannot approve — payroll shows <strong>{effectiveDays}</strong> day(s) available but{' '}
          {request.daysRequested} requested.
        </Alert>
      )}

      {error && <Alert severity="error">{error}</Alert>}

      {isPending && !readOnly && (
        <Stack direction="row" spacing={1}>
          <Button
            variant="contained"
            disabled={patchMutation.isPending || insufficientBalance}
            onClick={() => approve()}
          >
            {patchMutation.isPending ? 'Verifying…' : 'Approve'}
          </Button>
          <Button
            variant="outlined"
            color="inherit"
            disabled={patchMutation.isPending}
            onClick={deny}
          >
            Deny
          </Button>
        </Stack>
      )}

      <FreshnessGateModal
        open={gateOpen}
        snapshotDays={snapshotRef.current ?? snapshotDays}
        currentDays={currentDays}
        onClose={() => setGateOpen(false)}
        onRefresh={() => {
          setGateOpen(false);
          snapshotRef.current = currentDays;
          approve(true);
        }}
        onApproveAnyway={async () => {
          setGateOpen(false);
          if (hasInsufficientBalance(currentDays, request.daysRequested)) {
            setError(
              `Not enough days available (${currentDays} remaining, ${request.daysRequested} requested).`,
            );
            return;
          }
          try {
            await patchMutation.mutateAsync({
              requestId: request.id,
              body: { action: 'approve', managerId },
            });
            notify('Approved (balance change acknowledged).', { severity: 'warning' });
            onResolved?.(request.id);
          } catch (err) {
            const message = err instanceof Error ? err.message : 'Approval failed';
            setError(message);
          }
        }}
      />
    </Stack>
  );
}
