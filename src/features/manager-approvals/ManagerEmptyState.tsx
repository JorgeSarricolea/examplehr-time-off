'use client';

import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined';
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';
import { Box, Card, CardContent, Stack, Typography } from '@mui/material';

type ManagerEmptyVariant = 'pending' | 'history';

const emptyCopy: Record<ManagerEmptyVariant, { icon: typeof EventAvailableOutlinedIcon; text: string }> = {
  pending: {
    icon: EventAvailableOutlinedIcon,
    text: 'No requests waiting for you. New submissions from your team will show up here.',
  },
  history: {
    icon: HistoryOutlinedIcon,
    text: 'No decisions yet. Approved and denied requests will appear here.',
  },
};

export function ManagerEmptyState({ variant = 'pending' }: { variant?: ManagerEmptyVariant }) {
  const { icon: Icon, text } = emptyCopy[variant];

  return (
    <Card variant="outlined" sx={{ borderStyle: 'dashed', bgcolor: 'background.paper' }}>
      <CardContent>
        <Stack spacing={1.5} alignItems="center" textAlign="center" sx={{ py: 4 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              bgcolor: 'action.hover',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon color="primary" />
          </Box>
          <Typography variant="body1" color="text.secondary" maxWidth={400}>
            {text}
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}
