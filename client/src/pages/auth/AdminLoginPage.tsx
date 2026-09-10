import { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Link,
  Alert,
  InputAdornment,
  IconButton,
  CircularProgress,
  Snackbar,
  Fade,
  Paper,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  AdminPanelSettings,
  Login as LoginIcon,
  ArrowBack,
  Security,
  Email,
} from '@mui/icons-material';
import { loginSchema, type LoginFormData } from '@utils/validators';
import { useLogin } from '@hooks/useAuth';
import { useAuth } from '@contexts/AuthContext';

const AdminLoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({ open: false, message: '', severity: 'info' });
  const loginMutation = useLogin();

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname;

  // Set page title
  useEffect(() => {
    document.title = 'QuestionHub | Administrator Login';
    return () => {
      document.title = 'QuestionHub';
    };
  }, []);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'ADMIN') {
        navigate('/admin/dashboard', { replace: true });
      } else if (from) {
        navigate(from, { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate, from]);

  // Show success message from state
  useEffect(() => {
    if (location.state?.message) {
      setSnackbar({
        open: true,
        message: location.state.message,
        severity: 'success',
      });
      window.history.replaceState({}, '');
    }
  }, [location.state]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await loginMutation.mutateAsync(data);
    } catch {
      // Error is handled by the mutation
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  return (
    <>
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0a0e27 0%, #1a1f4e 30%, #1e2a5e 60%, #0d1333 100%)',
          p: 2,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.03\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            opacity: 0.5,
          },
          // Subtle animated gradient overlay
          '&::after': {
            content: '""',
            position: 'absolute',
            top: '-50%',
            left: '-50%',
            width: '200%',
            height: '200%',
            background: 'radial-gradient(ellipse at center, rgba(99, 102, 241, 0.15) 0%, transparent 50%)',
            animation: 'adminPulse 8s ease-in-out infinite',
            '@keyframes adminPulse': {
              '0%, 100%': { opacity: 0.3, transform: 'scale(1)' },
              '50%': { opacity: 0.6, transform: 'scale(1.05)' },
            },
          },
        }}
      >
        <Fade in timeout={600}>
          <Card
            sx={{
              width: '100%',
              maxWidth: 460,
              position: 'relative',
              zIndex: 1,
              background: 'rgba(15, 23, 42, 0.95)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 100px rgba(99, 102, 241, 0.1)',
              border: '1px solid rgba(99, 102, 241, 0.2)',
              borderRadius: 3,
            }}
          >
            <CardContent sx={{ p: 4 }}>
              {/* Back to Student Login */}
              <Box sx={{ mb: 3 }}>
                <Link
                  component={RouterLink}
                  to="/login"
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 0.5,
                    textDecoration: 'none',
                    color: 'text.secondary',
                    fontSize: '0.875rem',
                    transition: 'color 0.2s',
                    '&:hover': {
                      color: 'primary.main',
                    },
                  }}
                >
                  <ArrowBack sx={{ fontSize: 18 }} />
                  Back to Student Login
                </Link>
              </Box>

              {/* Header */}
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Box
                  sx={{
                    width: 72,
                    height: 72,
                    borderRadius: '20px',
                    background: 'linear-gradient(135deg, #312e81 0%, #4338ca 50%, #6366f1 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 2,
                    boxShadow: '0 8px 32px rgba(99, 102, 241, 0.4)',
                  }}
                >
                  <AdminPanelSettings sx={{ fontSize: 40, color: 'white' }} />
                </Box>
                <Typography
                  variant="h4"
                  fontWeight="bold"
                  sx={{
                    background: 'linear-gradient(135deg, #c7d2fe 0%, #a5b4fc 50%, #818cf8 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Administrator Portal
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.5, color: 'rgba(255,255,255,0.6)' }}>
                  Authorized administrators only
                </Typography>
              </Box>

              {/* Warning Banner */}
              <Paper
                sx={{
                  p: 2,
                  mb: 3,
                  background: 'rgba(251, 191, 36, 0.1)',
                  border: '1px solid rgba(251, 191, 36, 0.3)',
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                }}
              >
                <Security sx={{ color: '#fbbf24', fontSize: 22 }} />
                <Typography variant="body2" sx={{ color: '#fde68a', fontSize: '0.85rem' }}>
                  Only approved administrators can access this portal. Unauthorized access attempts are logged.
                </Typography>
              </Paper>

              {/* Sign In Title */}
              <Typography variant="h5" fontWeight="bold" sx={{ mb: 0.5, color: 'white' }}>
                Sign in
              </Typography>
              <Typography variant="body2" sx={{ mb: 3, color: 'rgba(255,255,255,0.5)' }}>
                Enter your administrator credentials
              </Typography>

              {/* Error Alert */}
              {loginMutation.isError && (
                <Alert
                  severity="error"
                  sx={{
                    mb: 2,
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: '#fca5a5',
                    '& .MuiAlert-icon': { color: '#ef4444' },
                  }}
                >
                  {(loginMutation.error as Error)?.message || 'Invalid credentials'}
                </Alert>
              )}

              {/* Form */}
              <Box component="form" onSubmit={handleSubmit(onSubmit)}>
                <TextField
                  {...register('email')}
                  fullWidth
                  label="Email Address"
                  type="email"
                  placeholder="admin@srmist.edu.in"
                  error={!!errors.email}
                  helperText={errors.email?.message}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <Email sx={{ color: 'rgba(255,255,255,0.4)' }} />
                        </InputAdornment>
                      ),
                    },
                  }}
                  sx={{
                    mb: 2,
                    '& .MuiOutlinedInput-root': {
                      bgcolor: 'rgba(255,255,255,0.05)',
                      '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                      '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.4)' },
                      '&.Mui-focused fieldset': { borderColor: '#6366f1', borderWidth: 2 },
                    },
                    '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.5)' },
                    '& .MuiInputLabel-root.Mui-focused': { color: '#a5b4fc' },
                    '& .MuiInputBase-input': { color: 'white', caretColor: 'white' },
                    '& .MuiFormHelperText-root': { color: '#fca5a5' },
                  }}
                />

                <TextField
                  {...register('password')}
                  fullWidth
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  error={!!errors.password}
                  helperText={errors.password?.message}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <LoginIcon sx={{ color: 'rgba(255,255,255,0.4)' }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                            size="small"
                            sx={{ color: 'rgba(255,255,255,0.5)' }}
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                  sx={{
                    mb: 3,
                    '& .MuiOutlinedInput-root': {
                      bgcolor: 'rgba(255,255,255,0.05)',
                      '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                      '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.4)' },
                      '&.Mui-focused fieldset': { borderColor: '#6366f1', borderWidth: 2 },
                    },
                    '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.5)' },
                    '& .MuiInputLabel-root.Mui-focused': { color: '#a5b4fc' },
                    '& .MuiInputBase-input': { color: 'white', caretColor: 'white' },
                    '& .MuiFormHelperText-root': { color: '#fca5a5' },
                  }}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={loginMutation.isPending}
                  sx={{
                    py: 1.5,
                    fontWeight: 700,
                    textTransform: 'none',
                    fontSize: '1rem',
                    background: 'linear-gradient(135deg, #4338ca 0%, #6366f1 100%)',
                    boxShadow: '0 4px 20px rgba(99, 102, 241, 0.4)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #3730a3 0%, #4f46e5 100%)',
                      boxShadow: '0 6px 24px rgba(99, 102, 241, 0.5)',
                    },
                    '&:disabled': {
                      background: 'rgba(99, 102, 241, 0.3)',
                    },
                  }}
                >
                  {loginMutation.isPending ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    'Sign in as Administrator'
                  )}
                </Button>
              </Box>

              {/* Divider */}
              <Box sx={{ my: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.3)' }}>
                  OR
                </Typography>
                <Box sx={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
              </Box>

              {/* Back to Student Login Button */}
              <Button
                component={RouterLink}
                to="/login"
                fullWidth
                variant="outlined"
                size="large"
                startIcon={<ArrowBack />}
                sx={{
                  py: 1.5,
                  fontWeight: 600,
                  textTransform: 'none',
                  fontSize: '0.95rem',
                  borderColor: 'rgba(255,255,255,0.2)',
                  color: 'rgba(255,255,255,0.8)',
                  '&:hover': {
                    borderColor: 'rgba(255,255,255,0.4)',
                    background: 'rgba(255,255,255,0.05)',
                  },
                }}
              >
                Back to Student Login
              </Button>
            </CardContent>
          </Card>
        </Fade>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default AdminLoginPage;
