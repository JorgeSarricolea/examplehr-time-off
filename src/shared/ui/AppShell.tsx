'use client';

import {
  AppBar,
  Box,
  Chip,
  Container,
  Toolbar,
  Typography,
} from '@mui/material';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSessionStore } from '@/features/auth/session-store';

export function AppShell({ children }: { children: React.ReactNode }) {
  const user = useSessionStore((s) => s.user);
  const pathname = usePathname();
  const isDashboard =
    pathname.startsWith('/employee') || pathname.startsWith('/manager');

  const main = isDashboard ? (
    <Box component="main">{children}</Box>
  ) : (
    <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
      {children}
    </Container>
  );

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar
        position="sticky"
        color="inherit"
        elevation={0}
        sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}
      >
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700 }}>
            <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
              ExampleHR
            </Link>
          </Typography>
          {user && (
            <>
              <Chip
                size="small"
                label={user.role}
                variant="outlined"
                sx={{ mr: 1.5, display: { xs: 'none', sm: 'inline-flex' } }}
              />
              <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'block' } }}>
                {user.name}
              </Typography>
            </>
          )}
        </Toolbar>
      </AppBar>
      {main}
    </Box>
  );
}
