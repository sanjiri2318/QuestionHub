import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
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
  CircularProgress,
  Paper,
} from '@mui/material';
import { School, Email, ArrowBack, CheckCircle } from '@mui/icons-material';
import { forgotPasswordSchema, type ForgotPasswordFormData } from '@utils/validators';
import { useForgotPassword } from '@hooks/useAuth';

const ForgotPasswordPage = () => {
  const [emailSent, setEmailSent] = useState(false);
  const [sentEmail, setSentEmail] = useState('');
  const forgotPasswordMutation = useForgotPassword();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      await forgotPasswordMutation.mutateAsync(data.email);
      setSentEmail(data.email);
      setEmailSent(true);
    } catch {
      // Error handled by mutation
    }
  };

  if (emailSent) {
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

            <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>
              Check Your Email
            </Typography>

            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              We've sent a password reset link to:
            </Typography>

            <Paper
              variant="outlined"
              sx={{
                p: 2,
                mb: 3,
                bgcolor: 'background.default',
              }}
            >
              <Typography variant="body1" fontWeight="medium">
                {sentEmail}
              </Typography>
            </Paper>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Please check your inbox and click the link to reset your password.
              If you don't see the email, check your spam folder.
            </Typography>

            <Button
              component={RouterLink}
              to="/login"
              variant="contained"
              fullWidth
              startIcon={<ArrowBack />}
              sx={{ mb: 2 }}
            >
              Back to Sign In
            </Button>

            <Typography variant="body2" color="text.secondary">
              Didn't receive the email?{' '}
              <Link
                component="button"
                onClick={() => {
                  setEmailSent(false);
                  setSentEmail('');
                }}
                fontWeight="bold"
                sx={{ textDecoration: 'none' }}
              >
                Try again
              </Link>
            </Typography>
          </CardContent>
        </Card>
      </Box>
    );
  }

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
            <Typography variant="h4" fontWeight="bold" color="primary">
              QuestionHub
            </Typography>
          </Box>

          {/* Title */}
          <Typography variant="h5" fontWeight="bold" sx={{ mb: 1 }}>
            Forgot Password?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Enter your email address and we'll send you a link to reset your password.
          </Typography>

          {/* Error Alert */}
          {forgotPasswordMutation.isError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {(forgotPasswordMutation.error as Error)?.message || 'An error occurred'}
            </Alert>
          )}

          {/* Form */}
          <Box component="form" onSubmit={handleSubmit(onSubmit)}>
            <TextField
              {...register('email')}
              fullWidth
              label="Email Address"
              type="email"
              placeholder="yourname@srmist.edu.in"
              error={!!errors.email}
              helperText={errors.email?.message}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email color="action" />
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
              disabled={forgotPasswordMutation.isPending}
              sx={{
                py: 1.5,
                fontWeight: 600,
                textTransform: 'none',
                fontSize: '1rem',
              }}
            >
              {forgotPasswordMutation.isPending ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Send Reset Link'
              )}
            </Button>
          </Box>

          {/* Back to Login */}
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Link
              component={RouterLink}
              to="/login"
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.5,
                textDecoration: 'none',
                color: 'text.secondary',
                '&:hover': {
                  color: 'primary.main',
                },
              }}
            >
              <ArrowBack sx={{ fontSize: 18 }} />
              Back to Sign In
            </Link>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ForgotPasswordPage;
