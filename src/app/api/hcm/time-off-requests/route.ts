import { NextResponse } from 'next/server';
import { handleCreateTimeOffRequest, handleListTimeOffRequests } from '@/hcm-mock/handlers';
import { createTimeOffRequestSchema } from '@/shared/lib/schemas';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const result = await handleListTimeOffRequests({
    status: searchParams.get('status') ?? undefined,
    managerId: searchParams.get('managerId') ?? undefined,
    employeeId: searchParams.get('employeeId') ?? undefined,
  });
  return NextResponse.json(result);
}

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const delayMs = searchParams.get('delay')
    ? Number(searchParams.get('delay'))
    : undefined;

  const body = await request.json();
  const parsed = createTimeOffRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { code: 'INVALID_DIMENSION', message: parsed.error.message },
      { status: 400 },
    );
  }

  const result = await handleCreateTimeOffRequest(parsed.data, delayMs);
  return NextResponse.json(result.data, { status: result.status });
}
