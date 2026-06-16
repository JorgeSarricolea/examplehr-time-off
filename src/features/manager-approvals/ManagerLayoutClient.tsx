'use client';

import { RoleGuard } from '@/features/auth/RoleGuard';
import { DashboardLayout } from '@/shared/ui/DashboardLayout';
import { managerNav } from '@/shared/lib/navigation';

export function ManagerLayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard role="manager">
      <DashboardLayout navItems={managerNav} navTitle="">
        {children}
      </DashboardLayout>
    </RoleGuard>
  );
}
