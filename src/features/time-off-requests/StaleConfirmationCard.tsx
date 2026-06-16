'use client';

import { Alert, AlertTitle, Button, Stack, Typography } from '@mui/material';

interface StaleConfirmationCardProps {
  onRetry: () => void;
  isRetrying?: boolean;
}

export function StaleConfirmationCard({ onRetry, isRetrying }: StaleConfirmationCardProps) {
  return (
    <Alert severity="warning" variant="outlined">
      <AlertTitle>Payroll confirmation is taking longer than usual</AlertTitle>
      <Stack spacing={1}>
        <Typography variant="body2">
          Your request is still with payroll. We have not confirmed the balance yet — check again
          in a moment.
        </Typography>
        <Button size="small" variant="contained" onClick={onRetry} disabled={isRetrying}>
          {isRetrying ? 'Checking…' : 'Check with payroll'}
        </Button>
      </Stack>
    </Alert>
  );
}
