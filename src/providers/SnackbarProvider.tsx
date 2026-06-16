'use client';

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from 'react';
import { Alert, Snackbar, type AlertColor } from '@mui/material';

interface NotifyOptions {
  severity?: AlertColor;
  duration?: number;
}

interface SnackbarContextValue {
  notify: (message: string, options?: NotifyOptions) => void;
}

const SnackbarContext = createContext<SnackbarContextValue | null>(null);

export function SnackbarProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState<AlertColor>('info');
  const [duration, setDuration] = useState(5000);

  const notify = useCallback((text: string, options?: NotifyOptions) => {
    setMessage(text);
    setSeverity(options?.severity ?? 'info');
    setDuration(options?.duration ?? 5000);
    setOpen(true);
  }, []);

  return (
    <SnackbarContext.Provider value={{ notify }}>
      {children}
      <Snackbar
        open={open}
        autoHideDuration={duration}
        onClose={() => setOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setOpen(false)}
          severity={severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {message}
        </Alert>
      </Snackbar>
    </SnackbarContext.Provider>
  );
}

export function useSnackbar() {
  const ctx = useContext(SnackbarContext);
  if (!ctx) throw new Error('useSnackbar must be used within SnackbarProvider');
  return ctx;
}
