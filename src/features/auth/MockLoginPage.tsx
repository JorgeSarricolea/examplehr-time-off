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
import { authApi } from '@/shared/lib/api';
import { useSessionStore } from '@/features/auth/session-store';

const roleLabels = {
  employee: 'Employee',
  manager: 'Manager',
};

export function MockLoginPage() {
  const router = useRouter();
  const setUser = useSessionStore((s) => s.setUser);
  const [loading, setLoading] = useState<string | null>(null);

  const handleLogin = async (email: string) => {
    setLoading(email);
    try {
      const user = await authApi.login(email);
      setUser(user);
      router.push(user.role === 'manager' ? '/manager/approvals' : '/employee/balances');
    } finally {
      setLoading(null);
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
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
