import { NextResponse } from 'next/server';
import { DEMO_USERS } from '@/hcm-mock/store';

export async function POST(request: Request) {
  const { email } = await request.json();
  const user = DEMO_USERS.find((u) => u.email === email);

  if (!user) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  const response = NextResponse.json({
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  });

  response.cookies.set(
    'session',
    JSON.stringify({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    }),
    { httpOnly: true, path: '/', maxAge: 60 * 60 * 24 },
  );

  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete('session');
  return response;
}
