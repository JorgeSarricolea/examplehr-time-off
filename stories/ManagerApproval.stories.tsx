import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from '@storybook/test';
import { ApprovalDetailPanel } from '@/features/manager-approvals/ApprovalDetailPanel';
import { ApprovalQueue } from '@/features/manager-approvals/ApprovalQueue';
import { FreshnessGateModal } from '@/features/manager-approvals/FreshnessGateModal';
import { ManagerEmptyState } from '@/features/manager-approvals/ManagerEmptyState';
import type { TimeOffRequest } from '@/shared/types/hcm';

const pendingRequest: TimeOffRequest = {
  id: 'req-1',
  employeeId: 'emp-alex',
  employeeName: 'Alex Rivera',
  managerId: 'mgr-morgan',
  locationId: 'loc-austin',
  locationName: 'Austin HQ',
  balanceType: 'vacation',
  startDate: '2026-07-01',
  endDate: '2026-07-03',
  daysRequested: 2,
  status: 'manager_pending',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const insufficientRequest: TimeOffRequest = {
  ...pendingRequest,
  id: 'req-insufficient',
  employeeId: 'emp-sam',
  employeeName: 'Sam Chen',
  locationId: 'loc-nyc',
  locationName: 'New York',
  daysRequested: 15,
  startDate: '2026-06-16',
  endDate: '2026-06-29',
};

const meta: Meta = {
  title: 'Manager/Atoms',
  parameters: { layout: 'padded' },
};
export default meta;

export const QueueWithPending: StoryObj = {
  name: 'Queue with pending request',
  render: () => (
    <ApprovalQueue
      managerId="mgr-morgan"
      requests={[pendingRequest, { ...pendingRequest, id: 'req-2', status: 'approved' }]}
    />
  ),
};

export const InsufficientBalance: StoryObj = {
  name: 'Insufficient balance — approve blocked',
  render: () => (
    <ApprovalDetailPanel request={insufficientRequest} managerId="mgr-morgan" />
  ),
};

export const FreshnessGateBlocked: StoryObj = {
  name: 'Freshness gate — balance changed',
  render: () => (
    <FreshnessGateModal
      open
      snapshotDays={10}
      currentDays={6}
      onClose={() => undefined}
      onRefresh={() => undefined}
      onApproveAnyway={() => undefined}
    />
  ),
};

export const QueueLoading: StoryObj = {
  name: 'Queue loading',
  render: () => <ApprovalQueue managerId="mgr-morgan" isLoading />,
};

export const EmptyPendingQueue: StoryObj = {
  name: 'Empty — no pending requests',
  render: () => <ManagerEmptyState variant="pending" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(/no requests waiting/i)).toBeInTheDocument();
  },
};

const historyRequests: TimeOffRequest[] = [
  { ...pendingRequest, id: 'req-history-approved', status: 'approved' },
  {
    ...pendingRequest,
    id: 'req-history-denied',
    status: 'denied',
    employeeId: 'emp-sam',
    employeeName: 'Sam Chen',
    locationId: 'loc-nyc',
    locationName: 'New York',
    startDate: '2026-06-10',
    endDate: '2026-06-11',
    daysRequested: 1,
  },
];

export const HistoryWithDecisions: StoryObj = {
  name: 'History — approved and denied decisions',
  render: () => (
    <ApprovalQueue managerId="mgr-morgan" filter="history" requests={historyRequests} />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Approved')).toBeInTheDocument();
    await expect(canvas.getByText('Denied')).toBeInTheDocument();
  },
};

export const EmptyHistory: StoryObj = {
  name: 'Empty — no past decisions',
  render: () => <ManagerEmptyState variant="history" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(/no decisions yet/i)).toBeInTheDocument();
  },
};
