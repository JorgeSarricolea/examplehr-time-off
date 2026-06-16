import { NextResponse } from 'next/server';
import { clearPersistedHcmState, persistHcmState } from '@/hcm-mock/persistence';
import { resetHcmState } from '@/hcm-mock/store';

export async function POST() {
  resetHcmState();
  await clearPersistedHcmState();
  await persistHcmState();

  return NextResponse.json({
    applied: true,
    message: 'Demo mock data reset to initial balances and empty requests',
  });
}
