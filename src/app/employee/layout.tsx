'use client';

import { EmployeeLayoutClient } from '@/features/time-off-requests/EmployeeLayoutClient';

export default function EmployeeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <EmployeeLayoutClient>{children}</EmployeeLayoutClient>;
}
