import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Avatar,
  Divider,
  Alert,
  Grid,
  Stack,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Person,
  Save,
  Email,
  Badge,
  School,
  Lock,
  CheckCircle,
} from '@mui/icons-material';
import { useAuth } from '@contexts/AuthContext';
import { useProfile, useUpdateProfile, useChangePassword } from '@hooks/useAuth';
import { profileSchema, changePasswordSchema, type ProfileFormData, type ChangePasswordFormData } from '@utils/validators';

const ProfilePage = () => {
  const { user } = useAuth();
  const { data: profile, isLoading } = useProfile();
  const updateProfileMutation = useUpdateProfile();
  const changePasswordMutation = useChangePassword();
  const [successMessage, setSuccessMessage] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);

  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: profileErrors, isDirty },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    values: {
      name: profile?.name || user?.name || '',
      registerNumber: profile?.registerNumber || user?.registerNumber || '',
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    reset: resetPassword,
    formState: { errors: passwordErrors },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
  });

  const onSubmitProfile = async (data: ProfileFormData) => {
    try {
      await updateProfileMutation.mutateAsync(data);
      setSuccessMessage('Profile updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const onSubmitPassword = async (data: ChangePasswordFormData) => {
    try {
      await changePasswordMutation.mutateAsync(data);
      setPasswordSuccess('Password changed successfully!');
      resetPassword();
      setTimeout(() => {
        setPasswordSuccess('');
        setPasswordDialogOpen(false);
      }, 2000);
    } catch (err) {
      console.error(err);
    }
  };

  const displayProfile = profile || user;

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3 }}>
        My Profile
      </Typography>

      <Grid container spacing={3}>
        {/* Profile Card */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
                <Avatar
                  sx={{
                    width: 88,
                    height: 88,
                    bgcolor: 'primary.main',
                    fontSize: 36,
                    boxShadow: '0 4px 14px rgba(21,101,192,0.3)',
                  }}
                >
                  {user?.name?.charAt(0).toUpperCase()}
                </Avatar>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                    {user?.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {user?.email}
                  </Typography>
                  <Chip
                    label={user?.status}
                    size="small"
                    color={user?.status === 'APPROVED' ? 'success' : user?.status === 'PENDING' ? 'warning' : 'error'}
                    sx={{ mt: 1 }}
                  />
                </Box>
              </Box>

              <Divider sx={{ my: 3 }} />

              {successMessage && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  {successMessage}
                </Alert>
              )}

              {updateProfileMutation.isError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {(updateProfileMutation.error as Error)?.message || 'Failed to update profile'}
                </Alert>
              )}

              <Box component="form" onSubmit={handleSubmitProfile(onSubmitProfile)}>
                <Stack spacing={2.5}>
                  <TextField
                    {...registerProfile('name')}
                    fullWidth
                    label="Full Name"
                    error={!!profileErrors.name}
                    helperText={profileErrors.name?.message}
                    disabled={isLoading}
                    slotProps={{
                      input: {
                        startAdornment: <Person sx={{ mr: 1, color: 'text.secondary' }} />,
                      },
                    }}
                  />

                  <TextField
                    {...registerProfile('registerNumber')}
                    fullWidth
                    label="Register Number"
                    error={!!profileErrors.registerNumber}
                    helperText={profileErrors.registerNumber?.message}
                    disabled={isLoading}
                    slotProps={{
                      input: {
                        startAdornment: <Badge sx={{ mr: 1, color: 'text.secondary' }} />,
                      },
                    }}
                  />

                  <TextField
                    fullWidth
                    label="Email Address"
                    value={user?.email || ''}
                    disabled
                    helperText="Email cannot be changed"
                    slotProps={{
                      input: {
                        startAdornment: <Email sx={{ mr: 1, color: 'text.secondary' }} />,
                      },
                    }}
                  />

                  <TextField
                    fullWidth
                    label="Department"
                    value={displayProfile?.department?.name || displayProfile?.departmentId || ''}
                    disabled
                    slotProps={{
                      input: {
                        startAdornment: <School sx={{ mr: 1, color: 'text.secondary' }} />,
                      },
                    }}
                  />

                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={<Save />}
                    disabled={!isDirty || updateProfileMutation.isPending}
                    size="large"
                  >
                    {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
                  </Button>
                </Stack>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Account Info Sidebar */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Stack spacing={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                  Account Details
                </Typography>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Role
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                      {user?.role}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Status
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                        {user?.status}
                      </Typography>
                      {user?.status === 'APPROVED' && (
                        <CheckCircle sx={{ fontSize: 16, color: 'success.main' }} />
                      )}
                    </Box>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Member Since
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                      {user?.createdAt
                        ? new Date(user.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })
                        : 'N/A'}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                  Security
                </Typography>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Lock />}
                  onClick={() => setPasswordDialogOpen(true)}
                >
                  Change Password
                </Button>
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>

      {/* Change Password Dialog */}
      <Dialog
        open={passwordDialogOpen}
        onClose={() => {
          setPasswordDialogOpen(false);
          resetPassword();
          setPasswordSuccess('');
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Change Password
          </Typography>
        </DialogTitle>
        <DialogContent>
          {passwordSuccess && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {passwordSuccess}
            </Alert>
          )}

          {changePasswordMutation.isError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {(changePasswordMutation.error as Error)?.message || 'Failed to change password'}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmitPassword(onSubmitPassword)} sx={{ mt: 1 }}>
            <Stack spacing={2.5}>
              <TextField
                {...registerPassword('currentPassword')}
                fullWidth
                label="Current Password"
                type="password"
                error={!!passwordErrors.currentPassword}
                helperText={passwordErrors.currentPassword?.message}
              />
              <TextField
                {...registerPassword('newPassword')}
                fullWidth
                label="New Password"
                type="password"
                error={!!passwordErrors.newPassword}
                helperText={passwordErrors.newPassword?.message}
              />
              <TextField
                {...registerPassword('confirmNewPassword')}
                fullWidth
                label="Confirm New Password"
                type="password"
                error={!!passwordErrors.confirmNewPassword}
                helperText={passwordErrors.confirmNewPassword?.message}
              />
            </Stack>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            onClick={() => {
              setPasswordDialogOpen(false);
              resetPassword();
              setPasswordSuccess('');
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmitPassword(onSubmitPassword)}
            variant="contained"
            disabled={changePasswordMutation.isPending}
          >
            {changePasswordMutation.isPending ? 'Changing...' : 'Change Password'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProfilePage;
