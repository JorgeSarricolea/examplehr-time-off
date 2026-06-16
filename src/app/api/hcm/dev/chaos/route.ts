import { NextResponse } from 'next/server';
import { triggerChaos } from '@/hcm-mock/handlers';
import { chaosTriggerSchema } from '@/shared/lib/schemas';

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = chaosTriggerSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ applied: false, message: parsed.error.message });
  }

  const result = triggerChaos(parsed.data);
  return NextResponse.json(result);
}
