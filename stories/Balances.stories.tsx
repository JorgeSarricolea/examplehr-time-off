import React, { useEffect, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from '@storybook/test';
import { Stack, Typography } from '@mui/material';
import {
  LocationBalanceCard,
  LocationBalanceCardSkeleton,
} from '@/features/balances/BalanceCard';
import { BalanceList } from '@/features/balances/BalanceList';
import { BalanceRefreshBanner } from '@/features/balances/BalanceRefreshBanner';
import type { BalanceCell } from '@/shared/types/hcm';

const austinBalances: BalanceCell[] = [
  {
    employeeId: 'emp-alex',
    locationId: 'loc-austin',
    locationName: 'Austin HQ',
    balanceType: 'vacation',
    availableDays: 12,
    asOf: new Date().toISOString(),
  },
  {
    employeeId: 'emp-alex',
    locationId: 'loc-austin',
    locationName: 'Austin HQ',
    balanceType: 'sick',
    availableDays: 5,
    asOf: new Date().toISOString(),
  },
];

const remoteBalances: BalanceCell[] = [
  {
    employeeId: 'emp-alex',
    locationId: 'loc-remote',
    locationName: 'Remote',
    balanceType: 'vacation',
    availableDays: 8,
    asOf: new Date().toISOString(),
  },
  {
    employeeId: 'emp-alex',
    locationId: 'loc-remote',
    locationName: 'Remote',
    balanceType: 'sick',
    availableDays: 3,
    asOf: new Date().toISOString(),
  },
];

const staleBalances: BalanceCell[] = austinBalances.map((b) => ({
  ...b,
  availableDays: b.balanceType === 'vacation' ? 10 : 4,
  asOf: new Date(Date.now() - 120_000).toISOString(),
}));

function MidSessionBalanceRefresh() {
  const [balances, setBalances] = useState(austinBalances);

  useEffect(() => {
    const timer = setTimeout(() => {
      setBalances((prev) =>
        prev.map((b) =>
          b.balanceType === 'vacation' ? { ...b, availableDays: b.availableDays + 1 } : b,
        ),
      );
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  return <BalanceList employeeId="emp-alex" balances={balances} showRefreshBanner />;
}

const meta: Meta = {
  title: 'Balances',
  parameters: { layout: 'padded' },
};
export default meta;

export const Fresh: StoryObj = {
  name: 'Fresh — grouped by work location',
  render: () => (
    <LocationBalanceCard
      locationId="loc-austin"
      locationName="Austin HQ"
      balances={austinBalances}
    />
  ),
};

export const FullList: StoryObj = {
  name: 'Full list — multi-location employee',
  render: () => (
    <BalanceList
      employeeId="emp-alex"
      balances={[...austinBalances, ...remoteBalances]}
      showRefreshBanner
    />
  ),
};

export const Stale: StoryObj = {
  name: 'Stale — balance from 2 min ago',
  render: () => (
    <LocationBalanceCard
      locationId="loc-austin"
      locationName="Austin HQ"
      balances={staleBalances}
      isStale
    />
  ),
};

export const MidSessionRefresh: StoryObj = {
  name: 'Mid-session refresh — anniversary bonus applied',
  render: () => <MidSessionBalanceRefresh />,
};

export const RefreshBanner: StoryObj = {
  name: 'Balance refresh banner — diff only',
  render: () => (
    <BalanceRefreshBanner
      changes={[{ locationName: 'Austin HQ', delta: 1 }]}
      onDismiss={() => undefined}
    />
  ),
};

export const Empty: StoryObj = {
  name: 'Empty — no balances',
  render: () => <BalanceList employeeId="emp-none" balances={[]} showRefreshBanner={false} />,
};

export const Loading: StoryObj = {
  name: 'Loading — fetching balances',
  render: () => (
    <Stack spacing={1.5} sx={{ maxWidth: 480 }}>
      <Typography variant="caption" color="text.secondary">
        Skeleton shown while payroll responds — same loader as the employee balances page.
      </Typography>
      <LocationBalanceCardSkeleton />
    </Stack>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(/skeleton shown while payroll/i)).toBeInTheDocument();
  },
};
