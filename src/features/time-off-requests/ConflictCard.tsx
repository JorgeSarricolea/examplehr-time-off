'use client';

import { Alert, AlertTitle, Button, Stack, Typography } from '@mui/material';
import { motion } from 'framer-motion';

interface ConflictCardProps {
  requestedDays: number;
  actualDays?: number;
  message?: string;
  onRetry: () => void;
  onWithdraw: () => void;
}

export function ConflictCard({
  requestedDays,
  actualDays,
  message,
  onRetry,
  onWithdraw,
}: ConflictCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
    >
      <Alert severity="error" role="alert">
        <AlertTitle>Payroll reported a mismatch</AlertTitle>
        <Stack spacing={1}>
          <Typography variant="body2">
            You requested <strong>{requestedDays}</strong> business day(s).
            {actualDays !== undefined && (
              <>
                {' '}
                Payroll&apos;s response shows <strong>{actualDays}</strong>.
              </>
            )}
          </Typography>
          {message && (
            <Typography variant="body2" color="text.secondary">
              {message}
            </Typography>
          )}
          <Stack direction="row" spacing={1}>
            <Button size="small" variant="contained" onClick={onRetry}>
              Retry with updated balance
            </Button>
            <Button size="small" variant="outlined" onClick={onWithdraw}>
              Withdraw request
            </Button>
          </Stack>
        </Stack>
      </Alert>
    </motion.div>
  );
}
