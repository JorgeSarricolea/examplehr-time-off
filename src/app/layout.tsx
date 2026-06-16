import type { Metadata } from 'next';
import { AppThemeProvider } from '@/providers/ThemeProvider';
import { QueryProvider } from '@/providers/QueryProvider';
import { SnackbarProvider } from '@/providers/SnackbarProvider';
import { AppShell } from '@/shared/ui/AppShell';
import { SessionHydrator } from '@/features/auth/SessionHydrator';
import './globals.css';

export const metadata: Metadata = {
  title: 'ExampleHR Time Off',
  description: 'Time-off frontend with honest HCM reconciliation',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AppThemeProvider>
          <QueryProvider>
            <SnackbarProvider>
              <SessionHydrator />
              <AppShell>{children}</AppShell>
            </SnackbarProvider>
          </QueryProvider>
        </AppThemeProvider>
      </body>
    </html>
  );
}
