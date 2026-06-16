'use client';

import { RoleGuard } from '@/features/auth/RoleGuard';
import { DashboardLayout } from '@/shared/ui/DashboardLayout';
import { employeeNav } from '@/shared/lib/navigation';

export function EmployeeLayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard role="employee">
      <DashboardLayout navItems={employeeNav} navTitle="">
        {children}
      </DashboardLayout>
    </RoleGuard>
  );
}
