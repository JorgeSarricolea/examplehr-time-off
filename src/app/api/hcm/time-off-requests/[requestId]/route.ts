import { NextResponse } from 'next/server';
import {
  handlePatchTimeOffRequest,
  handleWithdrawTimeOffRequest,
} from '@/hcm-mock/handlers';
import { patchTimeOffRequestSchema } from '@/shared/lib/schemas';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ requestId: string }> },
) {
  const { requestId } = await params;
  const { searchParams } = new URL(request.url);
  const delayMs = searchParams.get('delay')
    ? Number(searchParams.get('delay'))
    : undefined;

  const body = await request.json();
  const parsed = patchTimeOffRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { code: 'INVALID_DIMENSION', message: parsed.error.message },
      { status: 400 },
    );
  }

  const result = await handlePatchTimeOffRequest(requestId, parsed.data, delayMs);
  return NextResponse.json(result.data, { status: result.status });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ requestId: string }> },
) {
  const { requestId } = await params;
  const result = await handleWithdrawTimeOffRequest(requestId);

  if (result.data) {
    return NextResponse.json(result.data, { status: result.status });
  }

  return new NextResponse(null, { status: result.status });
}
