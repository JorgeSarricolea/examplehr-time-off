'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Stack,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
} from '@mui/material';
import { DEMO_USERS } from '@/hcm-mock/store';
import { authApi, hcmApi } from '@/shared/lib/api';
import { useSessionStore } from '@/features/auth/session-store';
import { clearPayrollQueryCache } from '@/features/auth/query-cache';
import { useSnackbar } from '@/providers/SnackbarProvider';
import { useQueryClient } from '@tanstack/react-query';

const roleLabels = {
  employee: 'Employee',
  manager: 'Manager',
};

export function MockLoginPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const setUser = useSessionStore((s) => s.setUser);
  const { notify } = useSnackbar();
  const [loading, setLoading] = useState<string | null>(null);
  const [resetting, setResetting] = useState(false);

  const handleLogin = async (email: string) => {
    setLoading(email);
    try {
      const user = await authApi.login(email);
      clearPayrollQueryCache(queryClient);
      setUser(user);
      router.push(user.role === 'manager' ? '/manager/approvals' : '/employee/balances');
    } finally {
      setLoading(null);
    }
  };

  const handleResetDemo = async () => {
    setResetting(true);
    try {
      const result = await hcmApi.resetDemo();
      notify(result.message, { severity: 'info' });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Reset failed';
      notify(message, { severity: 'error' });
    } finally {
      setResetting(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4,
      }}
    >
      <Card sx={{ maxWidth: 480, width: '100%' }}>
        <CardContent sx={{ p: { xs: 2.5, sm: 4 } }}>
          <Stack spacing={3}>
            <Stack spacing={1}>
              <Typography variant="h5" component="h1">
                Demo sign-in
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Pick a persona to explore the employee or manager experience.
              </Typography>
            </Stack>
            <List disablePadding>
              {DEMO_USERS.map((user) => (
                <ListItem key={user.id} disablePadding sx={{ mb: 1 }}>
                  <ListItemButton
                    onClick={() => handleLogin(user.email)}
                    disabled={loading === user.email}
                    sx={{
                      border: 1,
                      borderColor: 'divider',
                      borderRadius: 2,
                    }}
                  >
                    <ListItemText
                      primary={user.name}
                      secondary={user.email}
                    />
                    <Chip
                      size="small"
                      label={roleLabels[user.role]}
                      color={user.role === 'manager' ? 'primary' : 'default'}
                      variant="outlined"
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
            <Button variant="text" size="small" href="/">
              Back to home
            </Button>
            <Button
              variant="outlined"
              size="small"
              color="inherit"
              disabled={resetting}
              onClick={handleResetDemo}
            >
              {resetting ? 'Resetting…' : 'Reset demo data'}
            </Button>
            <Typography variant="caption" color="text.secondary" textAlign="center">
              Clears shared mock requests and restores demo balances (live deploy only).
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
