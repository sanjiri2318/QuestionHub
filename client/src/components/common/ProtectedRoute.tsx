import { Navigate, useLocation, Outlet, Link as RouterLink } from 'react-router-dom';
import { Box, CircularProgress, Typography, Paper, Button } from '@mui/material';
import { Warning } from '@mui/icons-material';
import { useAuth } from '@contexts/AuthContext';
import type { UserRole } from '@utils/types';

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
  requireApproval?: boolean;
  loginPath?: string;
}

const LoadingScreen = () => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      gap: 2,
    }}
  >
    <CircularProgress size={48} />
    <Typography variant="body1" color="text.secondary">
      Loading...
    </Typography>
  </Box>
);

const PendingApprovalScreen = () => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      p: 3,
    }}
  >
    <Paper
      elevation={3}
      sx={{
        p: 4,
        maxWidth: 400,
        textAlign: 'center',
      }}
    >
      <Warning sx={{ fontSize: 64, color: 'warning.main', mb: 2 }} />
      <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>
        Account Pending Approval
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Your account is currently pending approval by an administrator.
        You will receive access once your account has been reviewed.
      </Typography>
      <Button
        variant="contained"
        onClick={() => {
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }}
      >
        Sign Out
      </Button>
    </Paper>
  </Box>
);

const RejectedScreen = () => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      p: 3,
    }}
  >
    <Paper
      elevation={3}
      sx={{
        p: 4,
        maxWidth: 400,
        textAlign: 'center',
      }}
    >
      <Warning sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
      <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }} color="error">
        Account Rejected
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Your account has been rejected by an administrator.
        Please contact support for more information.
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Button
          component={RouterLink}
          to="/register"
          variant="contained"
          fullWidth
        >
          Try Again
        </Button>
        <Button
          variant="outlined"
          fullWidth
          onClick={() => {
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            window.location.href = '/login';
          }}
        >
          Sign Out
        </Button>
      </Box>
    </Paper>
  </Box>
);

const UnauthorizedScreen = () => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      p: 3,
    }}
  >
    <Paper
      elevation={3}
      sx={{
        p: 4,
        maxWidth: 400,
        textAlign: 'center',
      }}
    >
      <Warning sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
      <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>
        Access Denied
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        You don't have permission to access this page.
        Please contact your administrator if you believe this is an error.
      </Typography>
      <Button
        variant="contained"
        onClick={() => window.location.href = '/'}
      >
        Go to Home
      </Button>
    </Paper>
  </Box>
);

const ProtectedRoute = ({
  allowedRoles,
  requireApproval = true,
  loginPath = '/login',
}: ProtectedRouteProps) => {
  const { user, isAuthenticated, isLoading, isInitialized } = useAuth();
  const location = useLocation();

  // Show loading screen while initializing
  if (!isInitialized || isLoading) {
    return <LoadingScreen />;
  }

  // Not authenticated - redirect to appropriate login
  if (!isAuthenticated) {
    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }

  // Check approval status for students
  if (requireApproval && user?.role === 'STUDENT') {
    if (user.status === 'PENDING') {
      return <PendingApprovalScreen />;
    }
    if (user.status === 'REJECTED') {
      return <RejectedScreen />;
    }
  }

  // Check role authorization
  if (allowedRoles && user && !allowedRoles.includes(user.role as UserRole)) {
    return <UnauthorizedScreen />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
