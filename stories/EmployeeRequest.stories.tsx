import React, { useMemo, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';
import { Stack, Typography } from '@mui/material';
import { ConflictCard } from '@/features/time-off-requests/ConflictCard';
import { RequestForm } from '@/features/time-off-requests/RequestForm';
import { RequestRow } from '@/features/time-off-requests/RequestRow';
import { StaleConfirmationCard } from '@/features/time-off-requests/StaleConfirmationCard';
import { StatusLegend } from '@/shared/ui/StatusLegend';
import type { BalanceCell, RequestStatus, TimeOffRequest } from '@/shared/types/hcm';
import { displayRequestStatus } from '@/shared/lib/request-status';
import { STATUS_CHIP_CONFIG } from '@/shared/ui/status-chip-config';

const alexBalances: BalanceCell[] = [
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

const samBalances: BalanceCell[] = [
  {
    employeeId: 'emp-sam',
    locationId: 'loc-nyc',
    locationName: 'New York',
    balanceType: 'vacation',
    availableDays: 2,
    asOf: new Date().toISOString(),
  },
];

const baseRequest: TimeOffRequest = {
  id: 'req-atom-1',
  employeeId: 'emp-alex',
  employeeName: 'Alex Rivera',
  managerId: 'mgr-morgan',
  locationId: 'loc-austin',
  locationName: 'Austin HQ',
  balanceType: 'vacation',
  startDate: '2026-07-07',
  endDate: '2026-07-08',
  daysRequested: 2,
  status: 'hcm_confirming',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const meta: Meta = {
  title: 'Employee/Atoms',
  parameters: { layout: 'padded' },
};
export default meta;

export const StatusLegendStory: StoryObj = {
  name: 'Status legend',
  render: () => <StatusLegend />,
};

export const StatusLegendFilter: StoryObj = {
  name: 'Status legend — filter toggle',
  render: function StatusLegendFilterStory() {
    const sampleRequests: TimeOffRequest[] = [
      { ...baseRequest, id: 'req-1', status: 'manager_pending' },
      { ...baseRequest, id: 'req-2', status: 'denied' },
      { ...baseRequest, id: 'req-3', status: 'approved' },
    ];
    const [selected, setSelected] = useState<RequestStatus | null>(null);

    const visible = useMemo(() => {
      if (!selected) return sampleRequests;
      return sampleRequests.filter((r) => displayRequestStatus(r) === selected);
    }, [selected]);

    return (
      <Stack spacing={2} sx={{ maxWidth: 560 }}>
        <StatusLegend selected={selected} onChange={setSelected} />
        <Stack spacing={0.5}>
          {visible.map((request) => (
            <Typography key={request.id} variant="body2">
              {request.id} · {STATUS_CHIP_CONFIG[displayRequestStatus(request)].label}
            </Typography>
          ))}
        </Stack>
      </Stack>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const deniedChip = canvas.getByRole('button', { name: 'Denied' });

    await userEvent.click(deniedChip);
    await expect(deniedChip).toHaveAttribute('aria-pressed', 'true');
    await expect(canvas.getByText('req-2 · Denied')).toBeInTheDocument();
    await expect(canvas.queryByText('req-1 · Awaiting manager')).not.toBeInTheDocument();

    await userEvent.click(deniedChip);
    await expect(deniedChip).toHaveAttribute('aria-pressed', 'false');
    await expect(canvas.getByText('req-1 · Awaiting manager')).toBeInTheDocument();
  },
};

export const OptimisticPending: StoryObj = {
  name: 'Optimistic pending — confirming with payroll',
  render: () => (
    <RequestRow
      request={{ ...baseRequest, status: 'hcm_confirming' }}
      employeeId="emp-alex"
    />
  ),
};

export const StaleConfirmation: StoryObj = {
  name: 'Stale confirmation — payroll delayed',
  render: () => <StaleConfirmationCard onRetry={() => undefined} />,
};

export const ConflictRecovery: StoryObj = {
  name: 'Conflict recovery — retry or withdraw',
  render: () => (
    <ConflictCard
      requestedDays={2}
      actualDays={1}
      message="Payroll returned success but the numbers may not match."
      onRetry={() => undefined}
      onWithdraw={() => undefined}
    />
  ),
};

export const HcmRejected: StoryObj = {
  name: 'HCM rejected — insufficient balance',
  render: () => (
    <RequestForm
      employeeId="emp-sam"
      balances={samBalances}
      initialError="Only 2 days available"
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('alert')).toHaveTextContent('Only 2 days');
  },
};

export const OptimisticReverted: StoryObj = {
  name: 'Optimistic reverted — HCM rejected',
  render: () => (
    <RequestRow
      request={{ ...baseRequest, status: 'reverted' }}
      employeeId="emp-alex"
    />
  ),
};

export const TerminalApproved: StoryObj = {
  name: 'Terminal — approved',
  render: () => (
    <RequestRow
      request={{ ...baseRequest, id: 'req-approved', status: 'approved' }}
      employeeId="emp-alex"
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Approved')).toBeInTheDocument();
  },
};

export const TerminalDenied: StoryObj = {
  name: 'Terminal — denied',
  render: () => (
    <RequestRow
      request={{ ...baseRequest, id: 'req-denied', status: 'denied' }}
      employeeId="emp-alex"
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Denied')).toBeInTheDocument();
  },
};

export const TerminalWithdrawn: StoryObj = {
  name: 'Terminal — withdrawn',
  render: () => (
    <RequestRow
      request={{ ...baseRequest, id: 'req-withdrawn', status: 'withdrawn' }}
      employeeId="emp-alex"
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Withdrawn')).toBeInTheDocument();
  },
};

export const AwaitingManagerWithWithdraw: StoryObj = {
  name: 'Awaiting manager — withdraw available',
  render: () => (
    <RequestRow
      request={{ ...baseRequest, id: 'req-pending', status: 'manager_pending' }}
      employeeId="emp-alex"
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Awaiting manager')).toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: 'Withdraw' })).toBeInTheDocument();
  },
};

export const SilentlyWrong: StoryObj = {
  name: 'Silently wrong — success but mismatch',
  render: () => (
    <RequestRow
      request={{ ...baseRequest, status: 'silently_wrong' }}
      employeeId="emp-alex"
    />
  ),
};

export const RequestFormFresh: StoryObj = {
  name: 'Request form — ready to submit',
  render: () => <RequestForm employeeId="emp-alex" balances={alexBalances} />,
};

export const HcmTimeout: StoryObj = {
  name: 'HCM timeout — retry after payroll delay',
  render: () => (
    <RequestForm
      employeeId="emp-alex"
      balances={alexBalances}
      initialError="Payroll request timed out. Please try again."
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('alert')).toHaveTextContent(/timed out/i);
  },
};

export const WeekendOnlyRange: StoryObj = {
  name: 'Weekend-only range — zero business days',
  render: () => (
    <RequestForm
      employeeId="emp-alex"
      balances={alexBalances}
      initialStartDate="2026-07-11"
      initialEndDate="2026-07-12"
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('textbox', { name: 'Days requested' })).toHaveValue('0');
    await expect(canvas.getByRole('button', { name: 'Submit request' })).toBeDisabled();
  },
};

export const FriMonRange: StoryObj = {
  name: 'Fri to Mon — two business days',
  render: () => (
    <RequestForm
      employeeId="emp-alex"
      balances={alexBalances}
      initialStartDate="2026-07-10"
      initialEndDate="2026-07-13"
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('textbox', { name: 'Days requested' })).toHaveValue('2');
    await expect(canvas.getByRole('button', { name: 'Submit request' })).toBeEnabled();
  },
};
