'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Grid2 as Grid, Typography, Stack } from '@mui/material';
import { useBalancesBatch } from '@/features/balances/hooks';
import {
  LocationBalanceCard,
  LocationBalanceCardSkeleton,
} from '@/features/balances/BalanceCard';
import { BalanceRefreshBanner } from '@/features/balances/BalanceRefreshBanner';
import { detectBalanceDiff } from '@/shared/lib/reconcile';
import type { BalanceCell } from '@/shared/types/hcm';

interface BalanceListProps {
  employeeId: string;
  isLoading?: boolean;
  balances?: BalanceCell[];
  showRefreshBanner?: boolean;
}

function groupByLocation(balances: BalanceCell[]) {
  const map = new Map<string, { locationName: string; cells: BalanceCell[] }>();

  for (const balance of balances) {
    const entry = map.get(balance.locationId) ?? {
      locationName: balance.locationName,
      cells: [],
    };
    entry.cells.push(balance);
    map.set(balance.locationId, entry);
  }

  return Array.from(map.entries()).map(([locationId, { locationName, cells }]) => ({
    locationId,
    locationName,
    cells,
  }));
}

export function BalanceList({
  employeeId,
  isLoading: forceLoading,
  balances: overrideBalances,
  showRefreshBanner = true,
}: BalanceListProps) {
  const query = useBalancesBatch(employeeId);
  const isLoading = forceLoading ?? query.isLoading;
  const balances = overrideBalances ?? query.data?.items ?? [];
  const locationGroups = useMemo(() => groupByLocation(balances), [balances]);
  const previousRef = useRef<BalanceCell[]>([]);
  const [bannerChanges, setBannerChanges] = useState<
    Array<{ locationName: string; delta: number }>
  >([]);

  useEffect(() => {
    if (balances.length === 0) return;
    const diffs = detectBalanceDiff(previousRef.current, balances);
    if (previousRef.current.length > 0 && diffs.length > 0 && showRefreshBanner) {
      setBannerChanges(
        diffs.map((d) => ({
          locationName: d.cell.locationName,
          delta: d.delta,
        })),
      );
    }
    previousRef.current = balances;
  }, [balances, showRefreshBanner]);

  if (isLoading) {
    return (
      <Grid container spacing={2}>
        {[1, 2].map((i) => (
          <Grid key={i} size={{ xs: 12, md: 6 }}>
            <LocationBalanceCardSkeleton />
          </Grid>
        ))}
      </Grid>
    );
  }

  if (balances.length === 0) {
    return (
      <Typography color="text.secondary" role="status">
        No time-off balances found.
      </Typography>
    );
  }

  return (
    <Stack spacing={2}>
      <BalanceRefreshBanner
        changes={bannerChanges}
        onDismiss={() => setBannerChanges([])}
      />
      <Grid container spacing={2}>
        {locationGroups.map((group) => (
          <Grid key={group.locationId} size={{ xs: 12, md: 6 }}>
            <LocationBalanceCard
              locationId={group.locationId}
              locationName={group.locationName}
              balances={group.cells}
              isStale={query.isFetching}
              highlight={bannerChanges.some((c) => c.locationName === group.locationName)}
            />
          </Grid>
        ))}
      </Grid>
    </Stack>
  );
}
