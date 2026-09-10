import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { Snackbar, Alert, Stack, type AlertColor } from '@mui/material';

interface Notification {
  id: string;
  message: string;
  severity: AlertColor;
  autoHideDuration?: number;
}

interface NotificationContextType {
  notify: (message: string, severity?: AlertColor, duration?: number) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  warning: (message: string) => void;
  info: (message: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

let notifId = 0;

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const notify = useCallback((message: string, severity: AlertColor = 'info', duration = 4000) => {
    const id = `notif-${++notifId}`;
    setNotifications((prev) => [...prev, { id, message, severity, autoHideDuration: duration }]);
  }, []);

  const success = useCallback((msg: string) => notify(msg, 'success'), [notify]);
  const error = useCallback((msg: string) => notify(msg, 'error', 6000), [notify]);
  const warning = useCallback((msg: string) => notify(msg, 'warning', 5000), [notify]);
  const info = useCallback((msg: string) => notify(msg, 'info'), [notify]);

  const handleClose = useCallback((_event?: React.SyntheticEvent | Event, reason?: string, id?: string) => {
    if (reason === 'clickaway') return;
    if (id) {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } else {
      setNotifications((prev) => prev.slice(1));
    }
  }, []);

  return (
    <NotificationContext.Provider value={{ notify, success, error, warning, info }}>
      {children}
      <Stack
        spacing={1}
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 2000,
          maxWidth: 400,
        }}
      >
        {notifications.map((n) => (
          <Snackbar
            key={n.id}
            open
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            autoHideDuration={n.autoHideDuration}
            onClose={(e, r) => handleClose(e, r, n.id)}
          >
            <Alert
              onClose={(e) => handleClose(e, undefined, n.id)}
              severity={n.severity}
              variant="filled"
              elevation={6}
              sx={{ width: '100%' }}
            >
              {n.message}
            </Alert>
          </Snackbar>
        ))}
      </Stack>
    </NotificationContext.Provider>
  );
};
