import { useState } from 'react';
import { Link as RouterLink, useSearchParams } from 'react-router-dom';
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
  Paper,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  School,
  Lock,
  CheckCircle,
  Warning,
} from '@mui/icons-material';
import { resetPasswordSchema, type ResetPasswordFormData } from '@utils/validators';
import { useResetPassword } from '@hooks/useAuth';

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [showPassword, setShowPassword] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const resetPasswordMutation = useResetPassword();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const watchedPassword = watch('password', '');

  const passwordRequirements = [
    { label: 'At least 8 characters', met: watchedPassword.length >= 8 },
    { label: 'One uppercase letter', met: /[A-Z]/.test(watchedPassword) },
    { label: 'One lowercase letter', met: /[a-z]/.test(watchedPassword) },
    { label: 'One number', met: /[0-9]/.test(watchedPassword) },
    { label: 'One special character', met: /[^A-Za-z0-9]/.test(watchedPassword) },
  ];

  if (!token) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #1565C0 0%, #0D47A1 50%, #002171 100%)',
          p: 2,
        }}
      >
        <Card
          sx={{
            width: '100%',
            maxWidth: 440,
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          }}
        >
          <CardContent sx={{ p: 4, textAlign: 'center' }}>
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                bgcolor: 'error.light',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2,
              }}
            >
              <Warning sx={{ fontSize: 40, color: 'error.main' }} />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>
              Invalid Reset Link
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              The password reset link is invalid or has expired.
              Please request a new one.
            </Typography>
            <Button
              component={RouterLink}
              to="/forgot-password"
              fullWidth
              variant="contained"
            >
              Request New Link
            </Button>
          </CardContent>
        </Card>
      </Box>
    );
  }

  if (resetSuccess) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #1565C0 0%, #0D47A1 50%, #002171 100%)',
          p: 2,
        }}
      >
        <Card
          sx={{
            width: '100%',
            maxWidth: 440,
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          }}
        >
          <CardContent sx={{ p: 4, textAlign: 'center' }}>
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                bgcolor: 'success.light',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2,
              }}
            >
              <CheckCircle sx={{ fontSize: 40, color: 'success.main' }} />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>
              Password Reset Successful!
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Your password has been successfully reset.
              You can now sign in with your new password.
            </Typography>
            <Button
              component={RouterLink}
              to="/login"
              fullWidth
              variant="contained"
            >
              Sign In
            </Button>
          </CardContent>
        </Card>
      </Box>
    );
  }

  const onSubmit = async (data: ResetPasswordFormData) => {
    try {
      await resetPasswordMutation.mutateAsync({
        token,
        password: data.password,
        confirmPassword: data.confirmPassword,
      });
      setResetSuccess(true);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1565C0 0%, #0D47A1 50%, #002171 100%)',
        p: 2,
      }}
    >
      <Card
        sx={{
          width: '100%',
          maxWidth: 440,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        }}
      >
        <CardContent sx={{ p: 4 }}>
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: '16px',
                bgcolor: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2,
              }}
            >
              <School sx={{ fontSize: 36, color: 'white' }} />
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold' }} color="primary">
              QuestionHub
            </Typography>
          </Box>

          {/* Title */}
          <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
            Reset Password
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Enter your new password below.
          </Typography>

          {/* Error Alert */}
          {resetPasswordMutation.isError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {(resetPasswordMutation.error as Error)?.message || 'Failed to reset password'}
            </Alert>
          )}

          {/* Form */}
          <Box component="form" onSubmit={handleSubmit(onSubmit)}>
            <TextField
              {...register('password')}
              fullWidth
              label="New Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your new password"
              error={!!errors.password}
              helperText={errors.password?.message}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        size="small"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
              sx={{ mb: 2 }}
            />

            {/* Password Requirements */}
            {watchedPassword && (
              <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                  Password Requirements:
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  {passwordRequirements.map((req) => (
                    <Box
                      key={req.label}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                      }}
                    >
                      <CheckCircle
                        sx={{
                          fontSize: 16,
                          color: req.met ? 'success.main' : 'text.secondary',
                        }}
                      />
                      <Typography
                        variant="caption"
                        sx={{
                          color: req.met ? 'success.main' : 'text.secondary',
                        }}
                      >
                        {req.label}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Paper>
            )}

            <TextField
              {...register('confirmPassword')}
              fullWidth
              label="Confirm Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Confirm your new password"
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword?.message}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock color="action" />
                    </InputAdornment>
                  ),
                },
              }}
              sx={{ mb: 3 }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={resetPasswordMutation.isPending}
              sx={{
                py: 1.5,
                fontWeight: 600,
                textTransform: 'none',
                fontSize: '1rem',
              }}
            >
              {resetPasswordMutation.isPending ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Reset Password'
              )}
            </Button>
          </Box>

          {/* Back to Login */}
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Link
              component={RouterLink}
              to="/login"
              sx={{
                textDecoration: 'none',
                color: 'text.secondary',
                '&:hover': {
                  color: 'primary.main',
                },
              }}
            >
              Back to Sign In
            </Link>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ResetPasswordPage;
