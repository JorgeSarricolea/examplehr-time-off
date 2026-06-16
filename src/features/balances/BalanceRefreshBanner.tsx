'use client';

import { Alert, AlertTitle, Button, Stack } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';

interface BalanceRefreshBannerProps {
  changes: Array<{ locationName: string; delta: number }>;
  onDismiss: () => void;
}

export function BalanceRefreshBanner({ changes, onDismiss }: BalanceRefreshBannerProps) {
  if (changes.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
      >
        <Alert
          severity="info"
          role="status"
          aria-live="polite"
          action={
            <Button color="inherit" size="small" onClick={onDismiss}>
              Dismiss
            </Button>
          }
        >
          <AlertTitle>Balance updated</AlertTitle>
          <Stack spacing={0.5}>
            {changes.map((c) => (
              <span key={c.locationName}>
                {c.locationName}: {c.delta > 0 ? '+' : ''}
                {c.delta} day(s)
              </span>
            ))}
          </Stack>
        </Alert>
      </motion.div>
    </AnimatePresence>
  );
}
