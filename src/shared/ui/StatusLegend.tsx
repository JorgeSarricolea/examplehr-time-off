'use client';

import { Chip, Stack, Typography } from '@mui/material';
import type { RequestStatus } from '@/shared/types/hcm';
import { STATUS_CHIP_CONFIG } from '@/shared/ui/status-chip-config';

const LEGEND_STATUSES: RequestStatus[] = [
  'hcm_confirming',
  'stale_confirmation',
  'manager_pending',
  'approved',
  'denied',
  'withdrawn',
];

export function StatusLegend() {
  return (
    <Stack spacing={1}>
      <Typography variant="caption" color="text.secondary" fontWeight={600}>
        Request status
      </Typography>
      <Stack direction="row" flexWrap="wrap" gap={0.75} useFlexGap>
        {LEGEND_STATUSES.map((status) => {
          const config = STATUS_CHIP_CONFIG[status];
          return (
            <Chip
              key={status}
              size="small"
              label={config.label}
              color={config.color}
              variant="outlined"
            />
          );
        })}
      </Stack>
    </Stack>
  );
}
