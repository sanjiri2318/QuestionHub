import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Skeleton,
  Chip,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tooltip,
  Alert,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  ExpandMore,
  School,
  Description,
  FilterList,
} from '@mui/icons-material';
import { useAdminDepartments, useAdminSubjects, useCreateSubject, useUpdateSubject, useDeleteSubject } from '@hooks/useAdmin';
import { useNotification } from '@contexts/NotificationContext';
import { subjectSchema, type SubjectFormData } from '@utils/validators';

const ManageSubjects = () => {
  const { data: departments } = useAdminDepartments();
  const { data: subjects, isLoading } = useAdminSubjects();
  const createMutation = useCreateSubject();
  const updateMutation = useUpdateSubject();
  const deleteMutation = useDeleteSubject();
  const notify = useNotification();

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [subjectToDelete, setSubjectToDelete] = useState<{ id: string; name: string; code: string; _count?: { papers: number } } | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<SubjectFormData>({
    resolver: zodResolver(subjectSchema),
  });

  const filteredSubjects = useMemo(() => {
    if (!subjects) return [];
    return selectedDepartment
      ? subjects.filter((s) => s.departmentId === selectedDepartment)
      : subjects;
  }, [subjects, selectedDepartment]);

  const groupedBySemester = useMemo(() => {
    const groups: Record<number, typeof filteredSubjects> = {};
    filteredSubjects.forEach((subject) => {
      if (!groups[subject.semester]) groups[subject.semester] = [];
      groups[subject.semester].push(subject);
    });
    return Object.entries(groups)
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([sem, subs]) => ({ semester: Number(sem), subjects: subs }));
  }, [filteredSubjects]);

  const handleOpen = (subject?: import('@utils/types').Subject) => {
    if (subject) {
      setEditingId(subject.id);
      setValue('code', subject.code);
      setValue('name', subject.name);
      setValue('semester', subject.semester);
      setValue('departmentId', subject.departmentId);
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

  const onSubmit = async (data: SubjectFormData) => {
    try {
      if (editingId) {
        await updateMutation.mutateAsync({ id: editingId, data });
        notify.success('Subject updated');
      } else {
        await createMutation.mutateAsync(data);
        notify.success('Subject created');
      }
      handleClose();
    } catch {
      notify.error('Failed to save subject');
    }
  };

  const handleDeleteClick = (subject: typeof subjectToDelete) => {
    setSubjectToDelete(subject);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (subjectToDelete) {
      deleteMutation.mutate(subjectToDelete.id, {
        onSuccess: () => {
          setDeleteDialogOpen(false);
          setSubjectToDelete(null);
          notify.success('Subject deleted');
        },
        onError: () => {
          notify.error('Failed to delete subject');
        },
      });
    }
  };

  const getDeptName = (deptId: string) =>
    departments?.find((d) => d.id === deptId)?.name || 'Unknown';

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Manage Subjects
        </Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpen()}>
          Add Subject
        </Button>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <FilterList color="action" />
            <TextField
              select
              size="small"
              label="Filter by Department"
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              sx={{ minWidth: 250 }}
            >
              <MenuItem value="">All Departments</MenuItem>
              {departments?.map((dept) => (
                <MenuItem key={dept.id} value={dept.id}>
                  {dept.name}
                </MenuItem>
              ))}
            </TextField>
            <Chip
              label={`${filteredSubjects.length} subject${filteredSubjects.length !== 1 ? 's' : ''}`}
              size="small"
              color="primary"
              variant="outlined"
            />
          </Box>
        </CardContent>
      </Card>

      {isLoading ? (
        <Box>
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} variant="rounded" height={80} sx={{ mb: 2 }} />
          ))}
        </Box>
      ) : groupedBySemester.length > 0 ? (
        groupedBySemester.map(({ semester, subjects: semSubjects }) => (
          <Accordion key={semester} defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <School color="primary" />
                <Typography sx={{ fontWeight: 'bold' }}>Semester {semester}</Typography>
                <Chip label={semSubjects.length} size="small" />
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ pt: 0 }}>
              <Grid container spacing={2}>
                {semSubjects.map((subject) => (
                  <Grid size={{ xs: 12, sm: 6, md: 4 }} key={subject.id}>
                    <Card variant="outlined" sx={{ height: '100%' }}>
                      <CardContent sx={{ pb: '12px !important' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                          <Chip label={subject.code} size="small" color="primary" />
                          <Box>
                            <Tooltip title="Edit">
                              <IconButton size="small" onClick={() => handleOpen(subject)}>
                                <Edit fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDeleteClick(subject)}
                                disabled={deleteMutation.isPending}
                              >
                                <Delete fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </Box>
                        <Typography variant="body2" sx={{ fontWeight: 'medium', mb: 0.5 }}>
                          {subject.name}
                        </Typography>
                        {!selectedDepartment && (
                          <Typography variant="caption" color="text.secondary">
                            {getDeptName(subject.departmentId)}
                          </Typography>
                        )}
                        {subject._count && subject._count.papers > 0 && (
                          <Chip
                            icon={<Description sx={{ fontSize: 12 }} />}
                            label={`${subject._count.papers} papers`}
                            size="small"
                            sx={{ mt: 1 }}
                          />
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </AccordionDetails>
          </Accordion>
        ))
      ) : (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <School sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              No subjects found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {selectedDepartment ? 'No subjects in this department' : 'Add your first subject to get started'}
            </Typography>
            <Button variant="contained" startIcon={<Add />} onClick={() => handleOpen()}>
              Add Subject
            </Button>
          </CardContent>
        </Card>
      )}

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? 'Edit Subject' : 'Add Subject'}</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ pt: 1 }}>
            <TextField
              {...register('code')}
              fullWidth
              label="Subject Code"
              placeholder="e.g., CSE4001"
              error={!!errors.code}
              helperText={errors.code?.message}
              sx={{ mb: 2 }}
              disabled={createMutation.isPending || updateMutation.isPending}
            />
            <TextField
              {...register('name')}
              fullWidth
              label="Subject Name"
              placeholder="e.g., Data Structures and Algorithms"
              error={!!errors.name}
              helperText={errors.name?.message}
              sx={{ mb: 2 }}
              disabled={createMutation.isPending || updateMutation.isPending}
            />
            <TextField
              {...register('semester', { valueAsNumber: true })}
              fullWidth
              select
              label="Semester"
              error={!!errors.semester}
              helperText={errors.semester?.message}
              sx={{ mb: 2 }}
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                <MenuItem key={sem} value={sem}>
                  Semester {sem}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              {...register('departmentId')}
              fullWidth
              select
              label="Department"
              error={!!errors.departmentId}
              helperText={errors.departmentId?.message}
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {departments?.map((dept) => (
                <MenuItem key={dept.id} value={dept.id}>
                  {dept.name}
                </MenuItem>
              ))}
            </TextField>
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
        <DialogTitle>Delete Subject</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Are you sure you want to delete <strong>{subjectToDelete?.code} - {subjectToDelete?.name}</strong>?
          </Typography>
          {subjectToDelete && subjectToDelete._count && subjectToDelete._count.papers > 0 && (
            <Alert severity="warning" sx={{ mt: 1 }}>
              This subject has {subjectToDelete._count.papers} question paper(s) associated with it.
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

export default ManageSubjects;
