'use client';

import { Card, CardActionArea, CardContent, Stack, Typography, alpha, useTheme } from '@mui/material';
import { BALANCE_TYPE_LABELS } from '@/shared/lib/balance-labels';
import { getLocationMeta } from '@/shared/lib/locations';
import { StatusChip } from '@/shared/ui/StatusChip';
import type { TimeOffRequest } from '@/shared/types/hcm';

interface ApprovalRequestRowProps {
  request: TimeOffRequest;
  selected?: boolean;
  highlighted?: boolean;
  showStatus?: boolean;
  onSelect: () => void;
}

export function ApprovalRequestRow({
  request,
  selected,
  highlighted,
  showStatus,
  onSelect,
}: ApprovalRequestRowProps) {
  const theme = useTheme();
  const location = getLocationMeta(request.locationId, request.locationName);
  const balanceLabel = BALANCE_TYPE_LABELS[request.balanceType];
  const active = highlighted ?? selected;

  return (
    <Card
      variant="outlined"
      sx={{
        borderColor: active ? 'primary.main' : 'divider',
        borderLeftWidth: 3,
        borderLeftColor: active ? 'primary.main' : 'transparent',
        bgcolor: active ? alpha(theme.palette.primary.main, 0.06) : 'background.paper',
        transition: 'border-color 0.2s, background-color 0.2s',
      }}
    >
      <CardActionArea onClick={onSelect} sx={{ borderRadius: 'inherit' }}>
        <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
          <Stack
            direction="row"
            spacing={1}
            alignItems="flex-start"
            justifyContent="space-between"
          >
            <Stack spacing={0.25} sx={{ minWidth: 0 }}>
              <Typography variant="subtitle2" noWrap>
                {request.employeeName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {location.title} · {balanceLabel} · {request.daysRequested} business day(s)
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {request.startDate} → {request.endDate}
              </Typography>
            </Stack>
            {showStatus ? <StatusChip status={request.status} /> : null}
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
