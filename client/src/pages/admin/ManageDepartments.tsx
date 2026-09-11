import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Skeleton,
  Alert,
  Grid,
  Avatar,
  Chip,
  Tooltip,
  Divider,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Business,
  School,
  People,
  Description,
} from '@mui/icons-material';
import { useAdminDepartments, useCreateDepartment, useUpdateDepartment, useDeleteDepartment } from '@hooks/useAdmin';
import { useNotification } from '@contexts/NotificationContext';
import { departmentSchema, type DepartmentFormData } from '@utils/validators';

const ManageDepartments = () => {
  const { data: departments, isLoading } = useAdminDepartments();
  const createMutation = useCreateDepartment();
  const updateMutation = useUpdateDepartment();
  const deleteMutation = useDeleteDepartment();
  const notify = useNotification();

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [departmentToDelete, setDepartmentToDelete] = useState<{ id: string; name: string; _count: { users: number; subjects: number; papers: number } } | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<DepartmentFormData>({
    resolver: zodResolver(departmentSchema),
  });

  const handleOpen = (department?: { id: string; name: string }) => {
    if (department) {
      setEditingId(department.id);
      setValue('name', department.name);
    } else {
      setEditingId(null);
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingId(null);
    reset();
  };

  const onSubmit = async (data: DepartmentFormData) => {
    try {
      if (editingId) {
        await updateMutation.mutateAsync({ id: editingId, data });
        notify.success('Department updated');
      } else {
        await createMutation.mutateAsync(data);
        notify.success('Department created');
      }
      handleClose();
    } catch {
      notify.error('Failed to save department');
    }
  };

  const handleDeleteClick = (dept: typeof departmentToDelete) => {
    setDepartmentToDelete(dept);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (departmentToDelete) {
      deleteMutation.mutate(departmentToDelete.id, {
        onSuccess: () => {
          setDeleteDialogOpen(false);
          setDepartmentToDelete(null);
          notify.success('Department deleted');
        },
        onError: () => {
          notify.error('Failed to delete department');
        },
      });
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Manage Departments
        </Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpen()}>
          Add Department
        </Button>
      </Box>

      {isLoading ? (
        <Grid container spacing={3}>
          {Array.from({ length: 4 }).map((_, i) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
              <Skeleton variant="rounded" height={160} />
            </Grid>
          ))}
        </Grid>
      ) : departments && departments.length > 0 ? (
        <Grid container spacing={3}>
          {departments.map((dept) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={dept.id}>
              <Card
                sx={{
                  height: '100%',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 },
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>
                      <Business />
                    </Avatar>
                    <Box>
                      <Tooltip title="Edit">
                        <IconButton size="small" onClick={() => handleOpen(dept)}>
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteClick(dept)}
                          disabled={deleteMutation.isPending}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                    {dept.name}
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <Chip
                      icon={<School sx={{ fontSize: 16 }} />}
                      label={`${dept._count?.subjects || 0} subjects`}
                      size="small"
                      variant="outlined"
                    />
                    <Chip
                      icon={<People sx={{ fontSize: 16 }} />}
                      label={`${dept._count?.users || 0} users`}
                      size="small"
                      variant="outlined"
                    />
                    <Chip
                      icon={<Description sx={{ fontSize: 16 }} />}
                      label={`${dept._count?.papers || 0} papers`}
                      size="small"
                      variant="outlined"
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <Business sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              No departments found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Add your first department to get started.
            </Typography>
            <Button variant="contained" startIcon={<Add />} onClick={() => handleOpen()}>
              Add Department
            </Button>
          </CardContent>
        </Card>
      )}

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? 'Edit Department' : 'Add Department'}</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ pt: 1 }}>
            <TextField
              {...register('name')}
              fullWidth
              label="Department Name"
              placeholder="e.g., Computer Science and Engineering"
              error={!!errors.name}
              helperText={errors.name?.message}
              autoFocus
              disabled={createMutation.isPending || updateMutation.isPending}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            onClick={handleSubmit(onSubmit)}
            variant="contained"
            disabled={createMutation.isPending || updateMutation.isPending}
          >
            {editingId ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Delete Department</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Are you sure you want to delete <strong>{departmentToDelete?.name}</strong>?
          </Typography>
          {departmentToDelete && (departmentToDelete._count.users > 0 || departmentToDelete._count.subjects > 0 || departmentToDelete._count.papers > 0) && (
            <Alert severity="warning" sx={{ mt: 1 }}>
              This department has associated data that will be affected:
              <Box component="ul" sx={{ mt: 0.5, pl: 2 }}>
                {departmentToDelete._count.users > 0 && <li>{departmentToDelete._count.users} registered users</li>}
                {departmentToDelete._count.subjects > 0 && <li>{departmentToDelete._count.subjects} subjects</li>}
                {departmentToDelete._count.papers > 0 && <li>{departmentToDelete._count.papers} question papers</li>}
              </Box>
            </Alert>
          )}
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            disabled={deleteMutation.isPending}
            startIcon={<Delete />}
          >
            {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ManageDepartments;
