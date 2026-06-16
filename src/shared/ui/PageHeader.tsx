'use client';

import { Chip, Stack, Typography, type ChipProps } from '@mui/material';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  chipLabel?: string;
  chipColor?: ChipProps['color'];
}

export function PageHeader({ title, subtitle, chipLabel, chipColor = 'warning' }: PageHeaderProps) {
  return (
    <Stack spacing={0.75} sx={{ mb: 2.5 }}>
      <Stack direction="row" alignItems="center" spacing={1.5} flexWrap="wrap" useFlexGap>
        <Typography variant="h4" component="h1">
          {title}
        </Typography>
        {chipLabel ? <Chip size="small" color={chipColor} label={chipLabel} /> : null}
      </Stack>
      {subtitle && <Typography color="text.secondary">{subtitle}</Typography>}
    </Stack>
  );
}
