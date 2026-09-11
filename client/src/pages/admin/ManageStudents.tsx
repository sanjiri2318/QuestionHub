import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Avatar,
  Chip,
  Skeleton,
  IconButton,
  Tooltip,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tab,
  Tabs,
  TablePagination,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  Search,
  People,
  Block,
  PersonAdd,
} from '@mui/icons-material';
import { usePendingStudents, useAllStudents, useApproveStudent, useRejectStudent } from '@hooks/useAdmin';
import { useNotification } from '@contexts/NotificationContext';

const ManageStudents = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [tab, setTab] = useState(0);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(10);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogAction, setDialogAction] = useState<'approve' | 'reject'>('approve');
  const [selectedStudent, setSelectedStudent] = useState<{ id: string; name: string } | null>(null);

  const { data: pendingStudents, isLoading: pendingLoading } = usePendingStudents();
  const { data: allStudentsData, isLoading: allLoading } = useAllStudents(page + 1, rowsPerPage, search);
  const approveMutation = useApproveStudent();
  const rejectMutation = useRejectStudent();
  const notify = useNotification();

  const handleAction = (student: { id: string; name: string }, action: 'approve' | 'reject') => {
    setSelectedStudent(student);
    setDialogAction(action);
    setDialogOpen(true);
  };

  const handleConfirm = () => {
    if (!selectedStudent) return;
    if (dialogAction === 'approve') {
      approveMutation.mutate(selectedStudent.id, {
        onSuccess: () => { setDialogOpen(false); setSelectedStudent(null); notify.success(`${selectedStudent.name} approved`); },
        onError: () => { notify.error('Failed to approve student'); },
      });
    } else {
      rejectMutation.mutate(selectedStudent.id, {
        onSuccess: () => { setDialogOpen(false); setSelectedStudent(null); notify.success(`${selectedStudent.name} rejected`); },
        onError: () => { notify.error('Failed to reject student'); },
      });
    }
  };

  const isLoading = tab === 0 ? pendingLoading : allLoading;

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3 }}>
        Manage Students
      </Typography>

      <Card>
        <CardContent sx={{ pb: 1 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tab} onChange={(_, v) => { setTab(v); setPage(0); setSearch(''); }}>
              <Tab
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    Pending Approvals
                    {pendingStudents && pendingStudents.length > 0 && (
                      <Chip label={pendingStudents.length} size="small" color="warning" />
                    )}
                  </Box>
                }
                icon={<PersonAdd />}
                iconPosition="start"
              />
              <Tab label="All Students" icon={<People />} iconPosition="start" />
            </Tabs>
          </Box>
        </CardContent>

        {tab === 1 && (
          <CardContent>
            <TextField
              fullWidth
              size="small"
              placeholder="Search by name, email, or register number..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              slotProps={{ input: { startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} /> } }}
              sx={{ mb: 2 }}
            />
          </CardContent>
        )}

        <TableContainer>
          {isLoading ? (
            <Box sx={{ p: 2 }}>
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} height={52} sx={{ mb: 1 }} />
              ))}
            </Box>
          ) : tab === 0 ? (
            pendingStudents && pendingStudents.length > 0 ? (
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Student</TableCell>
                    {!isMobile && <TableCell>Register Number</TableCell>}
                    {!isMobile && <TableCell>Email</TableCell>}
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pendingStudents.map((student) => (
                    <TableRow key={student.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar sx={{ bgcolor: 'warning.main', width: 36, height: 36 }}>
                            {student.name.charAt(0).toUpperCase()}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                              {student.name}
                            </Typography>
                            {isMobile && (
                              <Typography variant="caption" color="text.secondary">
                                {student.email}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </TableCell>
                      {!isMobile && <TableCell>{student.registerNumber}</TableCell>}
                      {!isMobile && <TableCell>{student.email}</TableCell>}
                      <TableCell align="right">
                        <Tooltip title="Approve">
                          <IconButton
                            color="success"
                            size="small"
                            onClick={() => handleAction(student, 'approve')}
                            disabled={approveMutation.isPending || rejectMutation.isPending}
                          >
                            <CheckCircle />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Reject">
                          <IconButton
                            color="error"
                            size="small"
                            onClick={() => handleAction(student, 'reject')}
                            disabled={approveMutation.isPending || rejectMutation.isPending}
                          >
                            <Cancel />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <CheckCircle sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  All caught up!
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  No pending student approvals at the moment.
                </Typography>
              </Box>
            )
          ) : allStudentsData && allStudentsData.data.length > 0 ? (
            <>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Student</TableCell>
                    {!isMobile && <TableCell>Register Number</TableCell>}
                    <TableCell>Status</TableCell>
                    {!isMobile && <TableCell>Joined</TableCell>}
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {allStudentsData.data.map((student) => (
                    <TableRow key={student.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar
                            sx={{
                              bgcolor: student.status === 'APPROVED' ? 'success.main'
                                : student.status === 'PENDING' ? 'warning.main' : 'error.main',
                              width: 36,
                              height: 36,
                            }}
                          >
                            {student.name.charAt(0).toUpperCase()}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                              {student.name}
                            </Typography>
                            {isMobile && (
                              <Typography variant="caption" color="text.secondary">
                                {student.email}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </TableCell>
                      {!isMobile && <TableCell>{student.registerNumber}</TableCell>}
                      <TableCell>
                        <Chip
                          label={student.status}
                          size="small"
                          color={student.status === 'APPROVED' ? 'success' : student.status === 'PENDING' ? 'warning' : 'error'}
                          variant="outlined"
                        />
                      </TableCell>
                      {!isMobile && (
                        <TableCell>
                          {new Date(student.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </TableCell>
                      )}
                      <TableCell align="right">
                        {student.status === 'PENDING' && (
                          <>
                            <Tooltip title="Approve">
                              <IconButton
                                color="success"
                                size="small"
                                onClick={() => handleAction(student, 'approve')}
                              >
                                <CheckCircle />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Reject">
                              <IconButton
                                color="error"
                                size="small"
                                onClick={() => handleAction(student, 'reject')}
                              >
                                <Block />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <TablePagination
                component="div"
                count={allStudentsData.total}
                page={page}
                onPageChange={(_, p) => setPage(p)}
                rowsPerPage={rowsPerPage}
                rowsPerPageOptions={[10, 25, 50]}
              />
            </>
          ) : (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <People sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                No students found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {search ? 'Try a different search term' : 'No students have registered yet'}
              </Typography>
            </Box>
          )}
        </TableContainer>
      </Card>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>
          {dialogAction === 'approve' ? 'Approve Student' : 'Reject Student'}
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to {dialogAction}{' '}
            <strong>{selectedStudent?.name}</strong>?
          </Typography>
          {dialogAction === 'reject' && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              This student will not be able to access the platform.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleConfirm}
            color={dialogAction === 'approve' ? 'success' : 'error'}
            variant="contained"
            disabled={approveMutation.isPending || rejectMutation.isPending}
            startIcon={dialogAction === 'approve' ? <CheckCircle /> : <Cancel />}
          >
            {dialogAction === 'approve' ? 'Approve' : 'Reject'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ManageStudents;
