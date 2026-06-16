'use client';

import { ManagerLayoutClient } from '@/features/manager-approvals/ManagerLayoutClient';

export default function ManagerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ManagerLayoutClient>{children}</ManagerLayoutClient>;
}
