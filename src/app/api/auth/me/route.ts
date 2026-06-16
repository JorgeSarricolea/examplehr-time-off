import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { SessionUser } from '@/shared/types/hcm';

export async function GET() {
  const cookieStore = await cookies();
  const session = cookieStore.get('session');

  if (!session?.value) {
    return NextResponse.json({ user: null });
  }

  try {
    const user = JSON.parse(session.value) as SessionUser;
    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ user: null });
  }
}
