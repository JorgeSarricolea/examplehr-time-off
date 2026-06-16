import { createTheme } from '@mui/material';

export const appTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#5048E5' },
    success: { main: '#2e7d32' },
    warning: { main: '#ed6c02' },
    error: { main: '#d32f2f' },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
  },
  shape: { borderRadius: 10 },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: { fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.25 },
    h5: { fontWeight: 600, lineHeight: 1.3 },
    h6: { fontWeight: 600, lineHeight: 1.3 },
    subtitle1: { fontWeight: 600, fontSize: '1rem', lineHeight: 1.4 },
    subtitle2: { fontWeight: 600, fontSize: '0.875rem', lineHeight: 1.4 },
    body1: { fontSize: '1rem', lineHeight: 1.5 },
    body2: { fontSize: '0.875rem', lineHeight: 1.5 },
    caption: { fontSize: '0.75rem', lineHeight: 1.4, letterSpacing: '0.01em' },
    overline: {
      fontSize: '0.6875rem',
      fontWeight: 600,
      lineHeight: 1.4,
      letterSpacing: '0.06em',
      textTransform: 'uppercase',
    },
  },
  components: {
    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: { border: '1px solid', borderColor: 'divider' },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: { textTransform: 'none', fontWeight: 600 },
      },
    },
  },
});
