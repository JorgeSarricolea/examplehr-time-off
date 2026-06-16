'use client';

import { useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import { Box, Typography } from '@mui/material';
import { useSessionStore } from '@/features/auth/session-store';
import type { UserRole } from '@/shared/types/hcm';

interface RoleGuardProps {
  role: UserRole;
  children: ReactNode;
}

export function RoleGuard({ role, children }: RoleGuardProps) {
  const user = useSessionStore((s) => s.user);
  const router = useRouter();

  useEffect(() => {
    if (user && user.role !== role) {
      router.replace(user.role === 'manager' ? '/manager/approvals' : '/employee/balances');
    }
  }, [user, role, router]);

  if (!user) {
    return (
      <Typography>
        Please{' '}
        <Typography
          component="span"
          color="primary"
          sx={{ cursor: 'pointer', textDecoration: 'underline' }}
          onClick={() => router.push('/login')}
        >
          sign in
        </Typography>{' '}
        to continue.
      </Typography>
    );
  }

  if (user.role !== role) {
    return <Box sx={{ py: 4 }}>Redirecting…</Box>;
  }

  return <>{children}</>;
}
