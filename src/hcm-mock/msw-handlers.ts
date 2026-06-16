import { http, HttpResponse, delay } from 'msw';
import {
  handleCreateTimeOffRequest,
  handleGetBalanceCell,
  handleGetBalancesBatch,
  handleListTimeOffRequests,
  handlePatchTimeOffRequest,
  handleWithdrawTimeOffRequest,
} from '@/hcm-mock/handlers';
import { triggerChaos } from '@/hcm-mock/chaos-controls';
import { resetHcmState } from '@/hcm-mock/store';

const base = '/api/hcm';

export const hcmHandlers = [
  http.get(`${base}/balances/batch`, async ({ request }) => {
    const url = new URL(request.url);
    const employeeId = url.searchParams.get('employeeId') ?? undefined;
    const delayMs = url.searchParams.get('delay')
      ? Number(url.searchParams.get('delay'))
      : undefined;
    const result = await handleGetBalancesBatch(employeeId, delayMs);
    if ('code' in result) {
      const status = result.code === 'RATE_LIMITED' ? 429 : 504;
      return HttpResponse.json(result, { status });
    }
    return HttpResponse.json(result);
  }),

  http.get(`${base}/balances/:employeeId/:locationId`, async ({ request, params }) => {
    const url = new URL(request.url);
    const balanceType = (url.searchParams.get('balanceType') ?? 'vacation') as
      | 'vacation'
      | 'sick';
    const delayMs = url.searchParams.get('delay')
      ? Number(url.searchParams.get('delay'))
      : undefined;
    const result = await handleGetBalanceCell(
      params.employeeId as string,
      params.locationId as string,
      balanceType,
      delayMs,
    );
    if ('code' in result) {
      return HttpResponse.json(result, { status: 404 });
    }
    return HttpResponse.json(result);
  }),

  http.get(`${base}/time-off-requests`, async ({ request }) => {
    const url = new URL(request.url);
    const result = await handleListTimeOffRequests({
      status: url.searchParams.get('status') ?? undefined,
      managerId: url.searchParams.get('managerId') ?? undefined,
      employeeId: url.searchParams.get('employeeId') ?? undefined,
    });
    return HttpResponse.json(result);
  }),

  http.post(`${base}/time-off-requests`, async ({ request }) => {
    const url = new URL(request.url);
    const delayMs = url.searchParams.get('delay')
      ? Number(url.searchParams.get('delay'))
      : undefined;
    const body = await request.json();
    const result = await handleCreateTimeOffRequest(body as never, delayMs);
    return HttpResponse.json(result.data, { status: result.status });
  }),

  http.patch(`${base}/time-off-requests/:requestId`, async ({ request, params }) => {
    const body = await request.json();
    const result = await handlePatchTimeOffRequest(
      params.requestId as string,
      body as never,
    );
    return HttpResponse.json(result.data, { status: result.status });
  }),

  http.delete(`${base}/time-off-requests/:requestId`, async ({ params }) => {
    const result = await handleWithdrawTimeOffRequest(params.requestId as string);
    if (result.data) {
      return HttpResponse.json(result.data, { status: result.status });
    }
    return new HttpResponse(null, { status: result.status });
  }),

  http.post(`${base}/dev/chaos`, async ({ request }) => {
    const body = await request.json();
    const result = triggerChaos(body as never);
    return HttpResponse.json(result);
  }),
];

export async function resetMockForTests() {
  resetHcmState();
  await delay(0);
}
