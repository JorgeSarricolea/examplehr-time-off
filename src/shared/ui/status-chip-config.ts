import type { ChipProps } from '@mui/material';
import type { RequestStatus } from '@/shared/types/hcm';

export const STATUS_CHIP_CONFIG: Record<
  RequestStatus,
  { label: string; color: ChipProps['color'] }
> = {
  optimistic_pending: { label: 'Submitting…', color: 'warning' },
  hcm_confirming: { label: 'Confirming with payroll', color: 'warning' },
  confirmed: { label: 'Confirmed by payroll', color: 'success' },
  manager_pending: { label: 'Awaiting manager', color: 'info' },
  manager_verifying: { label: 'Verifying balance…', color: 'warning' },
  approved: { label: 'Approved', color: 'success' },
  denied: { label: 'Denied', color: 'error' },
  reverted: { label: 'Reverted', color: 'error' },
  silently_wrong: { label: 'Needs verification', color: 'warning' },
  conflict_recovery: { label: 'Conflict — action needed', color: 'error' },
  withdrawn: { label: 'Withdrawn', color: 'default' },
  stale_confirmation: { label: 'Confirmation delayed', color: 'warning' },
};
