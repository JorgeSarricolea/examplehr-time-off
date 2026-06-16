import { Chip } from '@mui/material';
import type { RequestStatus } from '@/shared/types/hcm';
import { STATUS_CHIP_CONFIG } from '@/shared/ui/status-chip-config';

export function StatusChip({ status }: { status: RequestStatus }) {
  const config = STATUS_CHIP_CONFIG[status];
  return (
    <Chip
      size="small"
      label={config.label}
      color={config.color}
      aria-label={`Request status: ${config.label}`}
    />
  );
}
