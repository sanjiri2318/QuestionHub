import { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
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
  MenuItem,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Checkbox,
  FormControlLabel,
  Paper,
  Snackbar,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  School,
  Person,
  Email,
  Lock,
  Badge,
  CheckCircle,
} from '@mui/icons-material';
import { registerSchema, type RegisterFormData } from '@utils/validators';
import { useRegister } from '@hooks/useAuth';
import { useDepartments } from '@hooks/useDepartments';
import { useAuth } from '@contexts/AuthContext';

const steps = ['Personal Info', 'Account Details', 'Review & Submit'];

const RegisterPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [agreed, setAgreed] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });
  const registerMutation = useRegister();
  const { data: departments, isLoading: departmentsLoading } = useDepartments();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'ADMIN') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    trigger,
    getValues,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
  });

  const watchedPassword = watch('password', '');

  const passwordRequirements = [
    { label: 'At least 8 characters', met: watchedPassword.length >= 8 },
    { label: 'One uppercase letter', met: /[A-Z]/.test(watchedPassword) },
    { label: 'One lowercase letter', met: /[a-z]/.test(watchedPassword) },
    { label: 'One number', met: /[0-9]/.test(watchedPassword) },
    { label: 'One special character', met: /[^A-Za-z0-9]/.test(watchedPassword) },
  ];

  const handleNext = async () => {
    let fieldsToValidate: (keyof RegisterFormData)[] = [];

    if (activeStep === 0) {
      fieldsToValidate = ['name', 'registerNumber', 'departmentId'];
    } else if (activeStep === 1) {
      fieldsToValidate = ['email', 'password', 'confirmPassword'];
    }

    const isStepValid = await trigger(fieldsToValidate);
    if (isStepValid) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const onSubmit = async (data: RegisterFormData) => {
    if (!agreed) {
      setSnackbar({
        open: true,
        message: 'Please agree to the Terms of Service and Privacy Policy',
        severity: 'error',
      });
      return;
    }

    try {
      await registerMutation.mutateAsync(data);
      navigate('/login', {
        state: {
          message: 'Registration successful! Your account is pending admin approval. You will be able to login once approved.',
        },
      });
    } catch {
      // Error handled by mutation
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <>
            <TextField
              {...register('name')}
              fullWidth
              label="Full Name"
              placeholder="Enter your full name"
              error={!!errors.name}
              helperText={errors.name?.message}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person color="action" />
                    </InputAdornment>
                  ),
                },
              }}
              sx={{ mb: 2 }}
            />

            <TextField
              {...register('registerNumber')}
              fullWidth
              label="Register Number"
              placeholder="e.g., RA2311003010001"
              error={!!errors.registerNumber}
              helperText={errors.registerNumber?.message}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Badge color="action" />
                    </InputAdornment>
                  ),
                },
              }}
              sx={{ mb: 2 }}
            />

            <TextField
              {...register('departmentId')}
              fullWidth
              select
              label="Department"
              error={!!errors.departmentId}
              helperText={errors.departmentId?.message}
              sx={{ mb: 2 }}
            >
              {departmentsLoading ? (
                <MenuItem disabled>
                  <CircularProgress size={20} />
                </MenuItem>
              ) : departments && departments.length > 0 ? (
                departments.map((dept) => (
                  <MenuItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </MenuItem>
                ))
              ) : (
                <MenuItem disabled>No departments available</MenuItem>
              )}
            </TextField>
          </>
        );

      case 1:
        return (
          <>
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
              sx={{ mb: 2 }}
            />

            <TextField
              {...register('password')}
              fullWidth
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Create a strong password"
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
              placeholder="Confirm your password"
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
            />
          </>
        );

      case 2:
        const values = getValues();
        const selectedDept = departments?.find((d) => d.id === values.departmentId);
        return (
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
              Review Your Information
            </Typography>

            <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Name:
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                  {values.name}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Register Number:
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                  {values.registerNumber}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Department:
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                  {selectedDept?.name || 'Not selected'}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Email:
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                  {values.email}
                </Typography>
              </Box>
            </Paper>

            <Alert severity="info" sx={{ mb: 2 }}>
              Your account will be created with <strong>PENDING</strong> status.
              You will be able to login after admin approval.
            </Alert>

            <FormControlLabel
              control={
                <Checkbox
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  color="primary"
                />
              }
              label={
                <Typography variant="body2">
                  I agree to the{' '}
                  <Link href="#" target="_blank">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link href="#" target="_blank">
                    Privacy Policy
                  </Link>
                </Typography>
              }
            />
          </Box>
        );

      default:
        return null;
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
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          opacity: 0.5,
        },
      }}
    >
      <Card
        sx={{
          width: '100%',
          maxWidth: 520,
          position: 'relative',
          zIndex: 1,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        }}
      >
        <CardContent sx={{ p: 4 }}>
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 3 }}>
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
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              SRM Institute of Science and Technology
            </Typography>
          </Box>

          {/* Title */}
          <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
            Student Registration
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Create your account to access question papers
          </Typography>

          {/* Stepper */}
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {/* Error Alert */}
          {registerMutation.isError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {(registerMutation.error as Error)?.message || 'Registration failed'}
            </Alert>
          )}

          {/* Form */}
          <Box component="form" onSubmit={handleSubmit(onSubmit)}>
            {renderStepContent(activeStep)}

            {/* Navigation Buttons */}
            <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
              {activeStep > 0 && (
                <Button
                  type="button"
                  variant="outlined"
                  onClick={handleBack}
                  sx={{ flex: 1 }}
                >
                  Back
                </Button>
              )}
              {activeStep < steps.length - 1 ? (
                <Button
                  type="button"
                  variant="contained"
                  onClick={handleNext}
                  sx={{ flex: 1 }}
                >
                  Next
                </Button>
              ) : (
                <Button
                  type="submit"
                  variant="contained"
                  disabled={registerMutation.isPending || !agreed}
                  sx={{ flex: 1 }}
                >
                  {registerMutation.isPending ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    'Create Account'
                  )}
                </Button>
              )}
            </Box>
          </Box>

          {/* Divider */}
          <Box sx={{ my: 3 }}>
            <Typography variant="body2" sx={{ textAlign: 'center' }} color="text.secondary">
              Already have an account?{' '}
              <Link
                component={RouterLink}
                to="/login"
                sx={{ textDecoration: 'none', fontWeight: 'bold' }}
              >
                Sign in
              </Link>
            </Typography>
          </Box>
        </CardContent>
      </Card>

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
    </Box>
  );
};

export default RegisterPage;
