'use client';

import { useEffect } from 'react';
import { useSessionStore } from '@/features/auth/session-store';
import type { SessionUser } from '@/shared/types/hcm';

export function SessionHydrator() {
  const setUser = useSessionStore((s) => s.setUser);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data: { user: SessionUser | null }) => {
        if (data.user) setUser(data.user);
      })
      .catch(() => undefined);
  }, [setUser]);

  return null;
}
