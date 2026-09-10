import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { useAuth } from '@contexts/AuthContext';

const PublicRoute = () => {
  const { isAuthenticated, user, isInitialized, isLoading } = useAuth();
  const location = useLocation();

  // Show loading screen while initializing
  if (!isInitialized || isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
        }}
      >
        <CircularProgress size={48} />
      </Box>
    );
  }

  // If authenticated, redirect to appropriate dashboard
  if (isAuthenticated && user) {
    const from = (location.state as { from?: { pathname: string } })?.from?.pathname;

    // If there's a specific redirect destination, go there
    if (from) {
      return <Navigate to={from} replace />;
    }

    // Otherwise, redirect based on role
    if (user.role === 'ADMIN') {
      return <Navigate to="/admin/dashboard" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default PublicRoute;
