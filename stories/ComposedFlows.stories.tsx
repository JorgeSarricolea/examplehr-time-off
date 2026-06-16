import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';
import { http, HttpResponse } from 'msw';
import { EmployeeRequestsHub } from '@/features/time-off-requests/EmployeeRequestsHub';
import { ApprovalQueue } from '@/features/manager-approvals/ApprovalQueue';
import { hcmHandlers } from '@/hcm-mock/msw-handlers';
import { handleGetBalanceCell } from '@/hcm-mock/handlers';
import { ALEX_SESSION, MORGAN_SESSION, withSession } from '../.storybook/session-decorator';
import { resetHcmState } from '@/hcm-mock/store';
import { seedManagerQueue, seedRequest } from './lib/story-seed';
import { EmployeeFullPage, ManagerFullPage } from './lib/full-page-shell';

const base = '/api/hcm';

const fullPageParams = { layout: 'fullscreen' as const };

const meta: Meta = {
  title: 'Flows',
  parameters: { layout: 'padded' },
};
export default meta;

export const EmployeeHubWithConfirming: StoryObj = {
  name: 'Employee — hub with confirming request',
  decorators: [withSession(ALEX_SESSION)],
  loaders: [
    async () => {
      seedRequest('hcm_confirming');
      return {};
    },
  ],
  render: () => <EmployeeRequestsHub />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('heading', { name: 'Requests' })).toBeInTheDocument();
    await expect(canvas.getByText(/confirming with payroll/i)).toBeInTheDocument();
  },
};

export const EmployeeHubEmpty: StoryObj = {
  name: 'Employee — empty requests list',
  decorators: [withSession(ALEX_SESSION)],
  loaders: [
    async () => {
      resetHcmState();
      return {};
    },
  ],
  render: () => <EmployeeRequestsHub />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(/no time off booked yet/i)).toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: 'Request time off' })).toBeInTheDocument();
  },
};

export const EmployeeHubFormOpen: StoryObj = {
  name: 'Employee — drawer open with request form',
  decorators: [withSession(ALEX_SESSION)],
  render: () => <EmployeeRequestsHub initialFormOpen />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Request time off')).toBeInTheDocument();
    await expect(canvas.getByLabelText(/start date/i)).toBeInTheDocument();
  },
};

export const EmployeeHubFormRejected: StoryObj = {
  name: 'Employee — form rejected (409)',
  decorators: [withSession(ALEX_SESSION)],
  render: () => (
    <EmployeeRequestsHub
      initialFormOpen
      initialFormError="Only 2 days available"
    />
  ),
};

export const EmployeeFullPageDrawerOpen: StoryObj = {
  name: 'Employee — full page, drawer open',
  decorators: [withSession(ALEX_SESSION, '/employee/requests/new')],
  parameters: fullPageParams,
  render: () => (
    <EmployeeFullPage>
      <EmployeeRequestsHub initialFormOpen />
    </EmployeeFullPage>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('link', { name: 'ExampleHR' })).toBeInTheDocument();
    await expect(canvas.getByText('Alex Rivera')).toBeInTheDocument();
    await expect(canvas.getByRole('link', { name: /book time off/i })).toHaveAttribute(
      'aria-current',
      'page',
    );
    await expect(canvas.getByRole('button', { name: 'Log out' })).toBeInTheDocument();
    await expect(canvas.getByRole('heading', { name: 'Requests' })).toBeInTheDocument();
    await expect(canvas.getByLabelText(/start date/i)).toBeInTheDocument();
  },
};

export const EmployeeFullPageFormRejected: StoryObj = {
  name: 'Employee — full page, form rejected (409)',
  decorators: [withSession(ALEX_SESSION, '/employee/requests/new')],
  parameters: fullPageParams,
  render: () => (
    <EmployeeFullPage>
      <EmployeeRequestsHub
        initialFormOpen
        initialFormError="Only 2 days available"
      />
    </EmployeeFullPage>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('link', { name: 'ExampleHR' })).toBeInTheDocument();
    await expect(canvas.getByRole('alert')).toHaveTextContent(/only 2 days available/i);
    await expect(canvas.getByRole('button', { name: 'Submit request' })).toBeDisabled();
  },
};

export const ManagerFullPageReview: StoryObj = {
  name: 'Manager — full page, drawer reviewing request',
  decorators: [withSession(MORGAN_SESSION, '/manager/approvals')],
  parameters: fullPageParams,
  loaders: [
    async () => {
      const requests = seedManagerQueue();
      return { requestId: requests[0].id };
    },
  ],
  render: (_, { loaded }) => (
    <ManagerFullPage>
      <ApprovalQueue
        managerId="mgr-morgan"
        initialSelectedId={loaded.requestId}
        initialDetailOpen
      />
    </ManagerFullPage>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('link', { name: 'ExampleHR' })).toBeInTheDocument();
    await expect(canvas.getByText('Morgan Lee')).toBeInTheDocument();
    await expect(canvas.getByRole('link', { name: /review pending team requests/i })).toHaveAttribute(
      'aria-current',
      'page',
    );
    await expect(canvas.getByText('Review request')).toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: 'Approve' })).toBeInTheDocument();
  },
};

export const ManagerDrawerReview: StoryObj = {
  name: 'Manager — drawer open reviewing request',
  decorators: [withSession(MORGAN_SESSION)],
  loaders: [
    async () => {
      const requests = seedManagerQueue();
      return { requestId: requests[0].id };
    },
  ],
  render: (_, { loaded }) => (
    <ApprovalQueue
      managerId="mgr-morgan"
      initialSelectedId={loaded.requestId}
      initialDetailOpen
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Review request')).toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: 'Approve' })).toBeInTheDocument();
  },
};

let freshnessCellReads = 0;

export const ManagerFreshnessGateOnApprove: StoryObj = {
  name: 'Manager — freshness gate on approve',
  decorators: [withSession(MORGAN_SESSION)],
  loaders: [
    async () => {
      freshnessCellReads = 0;
      const requests = seedManagerQueue();
      return { requestId: requests[0].id };
    },
  ],
  parameters: {
    msw: {
      handlers: [
        ...hcmHandlers,
        http.get(`${base}/balances/:employeeId/:locationId`, async ({ request, params }) => {
          const url = new URL(request.url);
          const balanceType = (url.searchParams.get('balanceType') ?? 'vacation') as
            | 'vacation'
            | 'sick';
          freshnessCellReads += 1;
          const result = await handleGetBalanceCell(
            params.employeeId as string,
            params.locationId as string,
            balanceType,
          );
          if ('code' in result) {
            return HttpResponse.json(result, { status: 404 });
          }
          const days = freshnessCellReads === 1 ? 10 : 6;
          return HttpResponse.json({ ...result, availableDays: days });
        }),
      ],
    },
  },
  render: (_, { loaded }) => (
    <ApprovalQueue
      managerId="mgr-morgan"
      initialSelectedId={loaded.requestId}
      initialDetailOpen
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Approve' }));
    await expect(canvas.getByText(/balance changed since you opened/i)).toBeInTheDocument();
  },
};
