import { NextResponse } from 'next/server';
import { handleGetBalanceCell } from '@/hcm-mock/handlers';
import type { BalanceType } from '@/shared/types/hcm';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ employeeId: string; locationId: string }> },
) {
  const { employeeId, locationId } = await params;
  const { searchParams } = new URL(request.url);
  const balanceType = (searchParams.get('balanceType') ?? 'vacation') as BalanceType;
  const delayMs = searchParams.get('delay')
    ? Number(searchParams.get('delay'))
    : undefined;

  const result = await handleGetBalanceCell(employeeId, locationId, balanceType, delayMs);

  if ('code' in result) {
    const status = result.code === 'NOT_FOUND' ? 404 : 504;
    return NextResponse.json(result, { status });
  }

  return NextResponse.json(result);
}
