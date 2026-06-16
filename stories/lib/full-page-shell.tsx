import type { ReactNode } from 'react';
import { AppShell } from '@/shared/ui/AppShell';
import { ManagerLayoutClient } from '@/features/manager-approvals/ManagerLayoutClient';
import { EmployeeLayoutClient } from '@/features/time-off-requests/EmployeeLayoutClient';

export function EmployeeFullPage({ children }: { children: ReactNode }) {
  return (
    <AppShell>
      <EmployeeLayoutClient>{children}</EmployeeLayoutClient>
    </AppShell>
  );
}

export function ManagerFullPage({ children }: { children: ReactNode }) {
  return (
    <AppShell>
      <ManagerLayoutClient>{children}</ManagerLayoutClient>
    </AppShell>
  );
}
