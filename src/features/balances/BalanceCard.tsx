'use client';

import { Card, CardContent, Divider, Skeleton, Stack, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import type { BalanceCell } from '@/shared/types/hcm';
import { BALANCE_TYPE_LABELS, sortBalanceCells } from '@/shared/lib/balance-labels';
import { formatFreshness } from '@/shared/lib/reconcile';
import { getLocationMeta } from '@/shared/lib/locations';

interface LocationBalanceCardProps {
  locationId: string;
  locationName: string;
  balances: BalanceCell[];
  isStale?: boolean;
  highlight?: boolean;
}

export function LocationBalanceCard({
  locationId,
  locationName,
  balances,
  isStale,
  highlight,
}: LocationBalanceCardProps) {
  const location = getLocationMeta(locationId, locationName);
  const rows = sortBalanceCells(balances);
  const latestAsOf = rows.reduce(
    (latest, cell) => (cell.asOf > latest ? cell.asOf : latest),
    rows[0]?.asOf ?? new Date().toISOString(),
  );

  return (
    <motion.div
      layout
      animate={highlight ? { scale: [1, 1.02, 1] } : { scale: 1 }}
      transition={{ duration: 0.4 }}
    >
      <Card
        variant="outlined"
        sx={{
          height: '100%',
          borderColor: highlight ? 'primary.main' : 'divider',
          transition: 'border-color 0.2s',
        }}
      >
        <CardContent>
          <Stack spacing={2}>
            <Stack spacing={0.25}>
              <Typography variant="overline" color="text.secondary" sx={{ lineHeight: 1.4 }}>
                Work location
              </Typography>
              <Typography variant="h6" component="p">
                {location.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {location.subtitle}
              </Typography>
            </Stack>

            <Divider />

            <Stack spacing={1.5} divider={<Divider flexItem />}>
              {rows.map((cell) => (
                <Stack
                  key={cell.balanceType}
                  direction="row"
                  justifyContent="space-between"
                  alignItems="baseline"
                  spacing={2}
                >
                  <Typography variant="body1" fontWeight={500}>
                    {BALANCE_TYPE_LABELS[cell.balanceType]}
                  </Typography>
                  <Typography variant="h5" component="p" aria-live="polite" sx={{ whiteSpace: 'nowrap' }}>
                    {cell.availableDays}{' '}
                    <Typography component="span" variant="body1" color="text.secondary">
                      days left
                    </Typography>
                  </Typography>
                </Stack>
              ))}
            </Stack>

            <Typography variant="caption" color={isStale ? 'warning.main' : 'text.secondary'}>
              Updated {formatFreshness(latestAsOf)}
              {isStale ? ' · refreshing…' : ''}
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function LocationBalanceCardSkeleton() {
  return (
    <Card variant="outlined">
      <CardContent>
        <Skeleton height={18} width="40%" />
        <Skeleton height={32} width="55%" sx={{ mt: 0.5 }} />
        <Skeleton height={20} width="35%" sx={{ mt: 0.5 }} />
        <Skeleton height={1} sx={{ my: 2 }} />
        <Skeleton height={28} width="100%" />
        <Skeleton height={28} width="100%" sx={{ mt: 1.5 }} />
        <Skeleton height={18} width="45%" sx={{ mt: 2 }} />
      </CardContent>
    </Card>
  );
}
