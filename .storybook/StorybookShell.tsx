import React, { type ReactNode } from 'react';
import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { appTheme } from '../src/providers/app-theme';

const emotionCache = createCache({ key: 'storybook', prepend: true });

export function StorybookShell({ children }: { children: ReactNode }) {
  return (
    <CacheProvider value={emotionCache}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <ThemeProvider theme={appTheme}>
          <CssBaseline />
          {children}
        </ThemeProvider>
      </LocalizationProvider>
    </CacheProvider>
  );
}
