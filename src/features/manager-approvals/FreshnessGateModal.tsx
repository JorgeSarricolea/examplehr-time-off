'use client';

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';

interface FreshnessGateModalProps {
  open: boolean;
  snapshotDays: number;
  currentDays: number;
  onRefresh: () => void;
  onApproveAnyway: () => void;
  onClose: () => void;
}

export function FreshnessGateModal({
  open,
  snapshotDays,
  currentDays,
  onRefresh,
  onApproveAnyway,
  onClose,
}: FreshnessGateModalProps) {
  return (
    <Dialog open={open} onClose={onClose} aria-labelledby="freshness-gate-title">
      <DialogTitle id="freshness-gate-title">Balance changed since you opened this</DialogTitle>
      <DialogContent>
        <Typography>
          You saw <strong>{snapshotDays}</strong> days available. Payroll now reports{' '}
          <strong>{currentDays}</strong> days.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onApproveAnyway} color="warning">
          Approve anyway
        </Button>
        <Button variant="contained" onClick={onRefresh}>
          Refresh &amp; retry
        </Button>
      </DialogActions>
    </Dialog>
  );
}
