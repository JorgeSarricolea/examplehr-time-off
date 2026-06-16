import { NextResponse } from 'next/server';
import { handleGetBalancesBatch } from '@/hcm-mock/handlers';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const employeeId = searchParams.get('employeeId') ?? undefined;
  const delay = searchParams.get('delay');
  const delayMs = delay ? Number(delay) : undefined;

  const result = await handleGetBalancesBatch(employeeId, delayMs);

  if ('code' in result) {
    const statusMap = { RATE_LIMITED: 429, GATEWAY_TIMEOUT: 504 } as const;
    const status = statusMap[result.code as keyof typeof statusMap] ?? 500;
    return NextResponse.json(result, { status });
  }

  return NextResponse.json(result);
}
