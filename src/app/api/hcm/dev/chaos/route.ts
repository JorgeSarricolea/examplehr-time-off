import { NextResponse } from 'next/server';
import { triggerChaos } from '@/hcm-mock/handlers';
import { withHcmPersistence } from '@/hcm-mock/with-hcm-persistence';
import { chaosTriggerSchema } from '@/shared/lib/schemas';

export async function POST(request: Request) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { applied: false, message: 'Chaos API is disabled in production' },
      { status: 403 },
    );
  }

  const body = await request.json();
  const parsed = chaosTriggerSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ applied: false, message: parsed.error.message });
  }

  const result = await withHcmPersistence(async () => triggerChaos(parsed.data));
  return NextResponse.json(result);
}
