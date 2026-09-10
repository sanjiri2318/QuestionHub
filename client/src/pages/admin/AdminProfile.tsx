import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Divider,
  TextField,
  Button,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Chip,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { Person, Save, Lock, CheckCircle, Shield, Edit as EditIcon } from '@mui/icons-material';
import { useAuth } from '@contexts/AuthContext';
import { useChangePassword, useUpdateProfile } from '@hooks/useAuth';
import { changePasswordSchema, type ChangePasswordFormData } from '@utils/validators';

const AdminProfile = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { user, refreshUser } = useAuth();
  const changePasswordMutation = useChangePassword();
  const updateProfileMutation = useUpdateProfile();
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
  });

  const handleChangePassword = async (data: ChangePasswordFormData) => {
    try {
      await changePasswordMutation.mutateAsync({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      setPasswordDialogOpen(false);
      reset();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDialogClose = () => {
    setPasswordDialogOpen(false);
    reset();
    changePasswordMutation.reset();
  };

  const handleSaveProfile = async () => {
    if (!editName.trim() || editName === user?.name) {
      setEditing(false);
      return;
    }
    try {
      await updateProfileMutation.mutateAsync({ name: editName.trim() });
      setEditing(false);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" sx={{ mb: 3 }}>
        Admin Profile
      </Typography>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Avatar sx={{ width: 80, height: 80, bgcolor: 'secondary.main', fontSize: 32 }}>
                  {user?.name?.charAt(0).toUpperCase()}
                </Avatar>
                <Box>
                  <Typography variant="h5" fontWeight="bold">
                    {user?.name}
                  </Typography>
                  <Chip
                    icon={<Shield sx={{ fontSize: 14 }} />}
                    label="Administrator"
                    size="small"
                    color="secondary"
                    sx={{ mt: 0.5 }}
                  />
                </Box>
              </Box>

              <Divider sx={{ my: 3 }} />

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                {editing ? (
                  <>
                    <TextField
                      fullWidth
                      label="Full Name"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      slotProps={{
                        input: {
                          startAdornment: <Person sx={{ mr: 1, color: 'text.secondary' }} />,
                        },
                      }}
                    />
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        variant="contained"
                        startIcon={<Save />}
                        onClick={handleSaveProfile}
                        disabled={updateProfileMutation.isPending || !editName.trim()}
                      >
                        {updateProfileMutation.isPending ? 'Saving...' : 'Save'}
                      </Button>
                      <Button
                        variant="outlined"
                        onClick={() => { setEditing(false); setEditName(user?.name || ''); }}
                        disabled={updateProfileMutation.isPending}
                      >
                        Cancel
                      </Button>
                    </Box>
                  </>
                ) : (
                  <>
                    <TextField
                      fullWidth
                      label="Full Name"
                      value={user?.name || ''}
                      disabled
                      slotProps={{
                        input: {
                          startAdornment: <Person sx={{ mr: 1, color: 'text.secondary' }} />,
                        },
                      }}
                    />
                    <Button
                      variant="outlined"
                      startIcon={<EditIcon />}
                      onClick={() => setEditing(true)}
                    >
                      Edit Profile
                    </Button>
                  </>
                )}
                <TextField
                  fullWidth
                  label="Email Address"
                  value={user?.email || ''}
                  disabled
                />
                <TextField
                  fullWidth
                  label="Role"
                  value={user?.role || ''}
                  disabled
                />
                <TextField
                  fullWidth
                  label="Account Status"
                  value={user?.status || ''}
                  disabled
                />
                {user?.createdAt && (
                  <TextField
                    fullWidth
                    label="Member Since"
                    value={new Date(user.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                    disabled
                  />
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
                Security Settings
              </Typography>
              <Card variant="outlined" sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    <Lock />
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle1" fontWeight="medium">
                      Change Password
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Update your password regularly to keep your account secure
                    </Typography>
                  </Box>
                </Box>
                <Button
                  variant="outlined"
                  startIcon={<Lock />}
                  onClick={() => setPasswordDialogOpen(true)}
                  fullWidth
                >
                  Change Password
                </Button>
              </Card>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Dialog open={passwordDialogOpen} onClose={handleDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          {changePasswordMutation.isSuccess && (
            <Alert severity="success" icon={<CheckCircle />} sx={{ mb: 2 }}>
              Password changed successfully!
            </Alert>
          )}
          {changePasswordMutation.isError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {(changePasswordMutation.error as Error)?.message || 'Failed to change password'}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit(handleChangePassword)} sx={{ pt: 1 }}>
            <TextField
              {...register('currentPassword')}
              fullWidth
              type="password"
              label="Current Password"
              error={!!errors.currentPassword}
              helperText={errors.currentPassword?.message}
              sx={{ mb: 2 }}
              disabled={changePasswordMutation.isPending}
            />
            <TextField
              {...register('newPassword')}
              fullWidth
              type="password"
              label="New Password"
              error={!!errors.newPassword}
              helperText={errors.newPassword?.message}
              sx={{ mb: 2 }}
              disabled={changePasswordMutation.isPending}
            />
            <TextField
              {...register('confirmNewPassword')}
              fullWidth
              type="password"
              label="Confirm New Password"
              error={!!errors.confirmNewPassword}
              helperText={errors.confirmNewPassword?.message}
              disabled={changePasswordMutation.isPending}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} disabled={changePasswordMutation.isPending}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit(handleChangePassword)}
            variant="contained"
            startIcon={<Save />}
            disabled={changePasswordMutation.isPending}
          >
            {changePasswordMutation.isPending ? 'Saving...' : 'Save Password'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminProfile;
