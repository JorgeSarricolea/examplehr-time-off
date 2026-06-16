'use client';

import { Chip, Stack, Typography } from '@mui/material';
import type { RequestStatus } from '@/shared/types/hcm';
import { STATUS_CHIP_CONFIG } from '@/shared/ui/status-chip-config';

export const FILTERABLE_REQUEST_STATUSES: RequestStatus[] = [
  'hcm_confirming',
  'stale_confirmation',
  'manager_pending',
  'approved',
  'denied',
  'withdrawn',
];

interface StatusLegendProps {
  selected?: RequestStatus | null;
  onChange?: (status: RequestStatus | null) => void;
}

export function StatusLegend({ selected = null, onChange }: StatusLegendProps) {
  const isFilterable = Boolean(onChange);

  const handleChipClick = (status: RequestStatus) => {
    if (!onChange) return;
    onChange(selected === status ? null : status);
  };

  return (
    <Stack spacing={1}>
      <Typography variant="caption" color="text.secondary" fontWeight={600}>
        Request status
      </Typography>
      <Stack direction="row" flexWrap="wrap" gap={0.75} useFlexGap>
        {FILTERABLE_REQUEST_STATUSES.map((status) => {
          const config = STATUS_CHIP_CONFIG[status];
          const isSelected = selected === status;

          return (
            <Chip
              key={status}
              size="small"
              label={config.label}
              color={config.color}
              variant={isSelected ? 'filled' : 'outlined'}
              clickable={isFilterable}
              onClick={isFilterable ? () => handleChipClick(status) : undefined}
              aria-pressed={isFilterable ? isSelected : undefined}
              sx={isFilterable ? { cursor: 'pointer' } : undefined}
            />
          );
        })}
      </Stack>
    </Stack>
  );
}
