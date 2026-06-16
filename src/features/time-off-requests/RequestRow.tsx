'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Button, Card, CardContent, Stack, Typography } from '@mui/material';
import { StaleConfirmationCard } from '@/features/time-off-requests/StaleConfirmationCard';
import { useWithdrawRequestMutation } from '@/features/balances/hooks';
import { BALANCE_TYPE_LABELS } from '@/shared/lib/balance-labels';
import { getLocationMeta } from '@/shared/lib/locations';
import {
  canWithdrawRequest,
  displayRequestStatus,
  isStaleConfirmationRequest,
} from '@/shared/lib/request-status';
import { StatusChip } from '@/shared/ui/StatusChip';
import { useSnackbar } from '@/providers/SnackbarProvider';
import type { TimeOffRequest } from '@/shared/types/hcm';

interface RequestRowProps {
  request: TimeOffRequest;
  employeeId: string;
  highlight?: boolean;
  onRetryConfirmation?: () => void;
  isRetryingConfirmation?: boolean;
}

export function RequestRow({
  request,
  employeeId,
  highlight,
  onRetryConfirmation,
  isRetryingConfirmation,
}: RequestRowProps) {
  const location = getLocationMeta(request.locationId, request.locationName);
  const balanceLabel = BALANCE_TYPE_LABELS[request.balanceType];
  const displayStatus = displayRequestStatus(request);
  const withdrawMutation = useWithdrawRequestMutation(employeeId);
  const { notify } = useSnackbar();
  const [, setTick] = useState(0);

  useEffect(() => {
    if (request.status !== 'hcm_confirming') return;
    const timer = setInterval(() => setTick((n) => n + 1), 5_000);
    return () => clearInterval(timer);
  }, [request.status, request.id]);

  const showStaleCard = isStaleConfirmationRequest(request);

  const handleWithdraw = async () => {
    try {
      await withdrawMutation.mutateAsync(request.id);
      notify('Request withdrawn. Balance restored.', { severity: 'info' });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Withdraw failed';
      notify(message, { severity: 'error' });
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <Card
        variant="outlined"
        sx={{
          borderColor: highlight ? 'primary.main' : 'divider',
          transition: 'border-color 0.3s',
        }}
      >
        <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
          <Stack spacing={1.5}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1}
              alignItems={{ sm: 'center' }}
              justifyContent="space-between"
            >
              <Stack spacing={0.25}>
                <Typography variant="subtitle2">
                  {location.title} · {balanceLabel} · {request.daysRequested} business day(s)
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {request.startDate} → {request.endDate}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {location.subtitle}
                </Typography>
              </Stack>
              <StatusChip status={displayStatus} />
            </Stack>

            {showStaleCard && onRetryConfirmation && (
              <StaleConfirmationCard
                onRetry={onRetryConfirmation}
                isRetrying={isRetryingConfirmation}
              />
            )}

            {canWithdrawRequest(request.status) && (
              <Button
                size="small"
                variant="outlined"
                color="inherit"
                disabled={withdrawMutation.isPending}
                onClick={handleWithdraw}
                sx={{ alignSelf: 'flex-start' }}
              >
                {withdrawMutation.isPending ? 'Withdrawing…' : 'Withdraw'}
              </Button>
            )}
          </Stack>
        </CardContent>
      </Card>
    </motion.div>
  );
}
