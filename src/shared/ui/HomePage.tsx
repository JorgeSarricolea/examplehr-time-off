'use client';

import { Button, Stack, Typography } from '@mui/material';
import Link from 'next/link';
import { useChaosMutation } from '@/features/balances/hooks';

const showDevTools = process.env.NODE_ENV === 'development';

export function ChaosPanel() {
  const chaos = useChaosMutation();

  const triggers = [
    { label: 'Anniversary bonus', action: 'anniversary_bonus' as const },
    { label: 'Silent wrong next POST', action: 'silent_wrong_next' as const },
    { label: 'Slow payroll confirm', action: 'slow_confirm_next' as const },
    { label: 'Year-start refresh', action: 'year_start_refresh' as const },
    { label: 'Reset mock', action: 'reset' as const },
  ];

  return (
    <Stack spacing={1} sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 2 }}>
      <Typography variant="subtitle2">HCM Simulator (dev only)</Typography>
      <Typography variant="caption" color="text.secondary">
        Trigger payroll edge cases for demos and Storybook.
      </Typography>
      <Stack direction="row" flexWrap="wrap" gap={1}>
        {triggers.map((t) => (
          <Button
            key={t.action}
            size="small"
            variant="outlined"
            disabled={chaos.isPending}
            onClick={() =>
              chaos.mutate({
                action: t.action,
                employeeId: 'emp-alex',
                locationId: 'loc-austin',
              })
            }
          >
            {t.label}
          </Button>
        ))}
      </Stack>
      {chaos.data && (
        <Typography variant="caption" color="text.secondary">
          {chaos.data.message}
        </Typography>
      )}
    </Stack>
  );
}

export function HomePage() {
  return (
    <Stack spacing={4} sx={{ py: { xs: 3, md: 6 }, maxWidth: 720 }}>
      <Stack spacing={1.5}>
        <Typography variant="h3" component="h1">
          Time off, without payroll surprises
        </Typography>
        <Typography color="text.secondary" variant="body1">
          Your company&apos;s payroll system holds the official balance. ExampleHR
          helps you request time off with instant feedback — and tells you honestly
          when payroll hasn&apos;t confirmed yet.
        </Typography>
      </Stack>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <Button component={Link} href="/login" variant="contained" size="large">
          Try the demo
        </Button>
      </Stack>
      {showDevTools && <ChaosPanel />}
    </Stack>
  );
}
