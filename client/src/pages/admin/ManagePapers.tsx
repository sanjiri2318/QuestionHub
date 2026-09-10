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
  TextField,
  MenuItem,
  IconButton,
  Skeleton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TablePagination,
  Tooltip,
  InputAdornment,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { Add, Edit, Delete, Download, Search, Description, Sort } from '@mui/icons-material';
import { usePapers, useDeletePaper, useDownloadPaper, useUpdatePaper } from '@hooks/usePapers';
import { useDepartments } from '@hooks/useDepartments';
import { useNotification } from '@contexts/NotificationContext';
import type { PaperFilters, ExamMonth } from '@utils/types';
import { PAPER_SORT_OPTIONS } from '@utils/types';
import { EXAM_MONTHS, getExamYears } from '@utils/helpers';

const ManagePapers = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [filters, setFilters] = useState<PaperFilters>({ page: 1, limit: 10 });
  const [searchTerm, setSearchTerm] = useState('');
  const { data: papers, isLoading } = usePapers(filters);
  const { data: departments } = useDepartments();
  const deleteMutation = useDeletePaper();
  const downloadMutation = useDownloadPaper();
  const updateMutation = useUpdatePaper();
  const notify = useNotification();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [paperToDelete, setPaperToDelete] = useState<string | null>(null);
  const [paperToEdit, setPaperToEdit] = useState<{
    id: string;
    title: string;
    semester: number;
    examYear: number;
    examMonth: ExamMonth;
    departmentId: string;
    subjectId: string;
  } | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editSemester, setEditSemester] = useState<number>(1);
  const [editExamYear, setEditExamYear] = useState<number>(new Date().getFullYear());
  const [editExamMonth, setEditExamMonth] = useState<ExamMonth>('JANUARY');
  const [editDepartmentId, setEditDepartmentId] = useState('');
  const [editSubjectId, setEditSubjectId] = useState('');
  const [editDepartmentSubjects, setEditDepartmentSubjects] = useState<Array<{ id: string; code: string; name: string }>>([]);

  const examMonths = EXAM_MONTHS;
  const years = getExamYears();

  const handleSearch = () => {
    setFilters((prev) => ({ ...prev, search: searchTerm || undefined, page: 1 }));
  };

  const handleDeleteClick = (id: string) => {
    setPaperToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (paperToDelete) {
      deleteMutation.mutate(paperToDelete, {
        onSuccess: () => {
          setDeleteDialogOpen(false);
          setPaperToDelete(null);
          notify.success('Paper deleted');
        },
        onError: () => {
          notify.error('Failed to delete paper');
        },
      });
    }
  };

  const handleEditClick = (paper: typeof paperToEdit) => {
    if (!paper) return;
    setPaperToEdit(paper);
    setEditTitle(paper.title);
    setEditSemester(paper.semester);
    setEditExamYear(paper.examYear);
    setEditExamMonth(paper.examMonth);
    setEditDepartmentId(paper.departmentId);
    setEditSubjectId(paper.subjectId);
    // Load subjects for this department
    const dept = departments?.find((d) => d.id === paper.departmentId);
    if (dept && 'subjects' in dept) {
      setEditDepartmentSubjects((dept as any).subjects || []);
    } else {
      setEditDepartmentSubjects([]);
    }
    setEditDialogOpen(true);
  };

  const handleConfirmEdit = () => {
    if (!paperToEdit) return;
    updateMutation.mutate(
      {
        id: paperToEdit.id,
        data: {
          title: editTitle,
          semester: editSemester,
          examYear: editExamYear,
          examMonth: editExamMonth,
          departmentId: editDepartmentId,
          subjectId: editSubjectId,
        },
      },
      {
        onSuccess: () => {
          setEditDialogOpen(false);
          setPaperToEdit(null);
          notify.success('Paper updated');
        },
        onError: () => {
          notify.error('Failed to update paper');
        },
      }
    );
  };

  const handleEditDepartmentChange = (deptId: string) => {
    setEditDepartmentId(deptId);
    setEditSubjectId('');
    // In a real app you'd fetch subjects via API; for now use the paper's department
    if (deptId === paperToEdit?.departmentId && paperToEdit.subjectId) {
      setEditSubjectId(paperToEdit.subjectId);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" fontWeight="bold">
          Manage Papers
        </Typography>
        <Button variant="contained" startIcon={<Add />} href="/admin/papers/upload">
          Upload New Paper
        </Button>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <TextField
              size="small"
              placeholder="Search papers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                },
              }}
              sx={{ minWidth: 200, flex: 1 }}
            />
            <TextField
              select
              size="small"
              label="Department"
              value={filters.departmentId || ''}
              onChange={(e) => setFilters((prev) => ({ ...prev, departmentId: e.target.value || undefined, page: 1 }))}
              sx={{ minWidth: 160 }}
            >
              <MenuItem value="">All Departments</MenuItem>
              {departments?.map((dept) => (
                <MenuItem key={dept.id} value={dept.id}>
                  {dept.name}
                </MenuItem>
              ))}
            </TextField>
            {!isMobile && (
              <>
                <TextField
                  select
                  size="small"
                  label="Year"
                  value={filters.examYear || ''}
                  onChange={(e) => setFilters((prev) => ({ ...prev, examYear: e.target.value ? Number(e.target.value) : undefined, page: 1 }))}
                  sx={{ minWidth: 100 }}
                >
                  <MenuItem value="">All</MenuItem>
                  {years.map((year) => (
                    <MenuItem key={year} value={year}>{year}</MenuItem>
                  ))}
                </TextField>
                <TextField
                  select
                  size="small"
                  label="Month"
                  value={filters.examMonth || ''}
                  onChange={(e) => setFilters((prev) => ({ ...prev, examMonth: (e.target.value as ExamMonth) || undefined, page: 1 }))}
                  sx={{ minWidth: 120 }}
                >
                  <MenuItem value="">All</MenuItem>
                  {examMonths.map((month) => (
                    <MenuItem key={month} value={month}>{month}</MenuItem>
                  ))}
                </TextField>
              </>
            )}
            <Button variant="outlined" onClick={handleSearch}>
              Search
            </Button>
            <TextField
              select
              size="small"
              label="Sort By"
              value={filters.sortBy || 'createdAt'}
              onChange={(e) => setFilters((prev) => ({ ...prev, sortBy: e.target.value, page: 1 }))}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Sort fontSize="small" />
                    </InputAdornment>
                  ),
                },
              }}
              sx={{ minWidth: 140 }}
            >
              {PAPER_SORT_OPTIONS.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
              ))}
            </TextField>
            <TextField
              select
              size="small"
              label="Order"
              value={filters.sortOrder || 'desc'}
              onChange={(e) => setFilters((prev) => ({ ...prev, sortOrder: e.target.value as 'asc' | 'desc', page: 1 }))}
              sx={{ minWidth: 100 }}
            >
              <MenuItem value="desc">Newest</MenuItem>
              <MenuItem value="asc">Oldest</MenuItem>
            </TextField>
          </Box>
        </CardContent>
      </Card>

      <Card>
        <TableContainer>
          {isLoading ? (
            <Box sx={{ p: 2 }}>
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} height={52} sx={{ mb: 1 }} />
              ))}
            </Box>
          ) : papers && papers.data && papers.data.length > 0 ? (
            <>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Title</TableCell>
                    {!isMobile && <TableCell>Subject</TableCell>}
                    <TableCell>Sem</TableCell>
                    {!isMobile && <TableCell>Exam</TableCell>}
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {papers.data.map((paper) => (
                    <TableRow key={paper.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {isMobile && <Description color="action" sx={{ fontSize: 18 }} />}
                          <Typography variant="body2" fontWeight="medium" noWrap sx={{ maxWidth: isMobile ? 200 : 300 }}>
                            {paper.title}
                          </Typography>
                        </Box>
                      </TableCell>
                      {!isMobile && (
                        <TableCell>
                          <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                            {paper.subject?.name || '-'}
                          </Typography>
                        </TableCell>
                      )}
                      <TableCell>
                        <Chip label={`S${paper.semester}`} size="small" />
                      </TableCell>
                      {!isMobile && (
                        <TableCell>
                          <Typography variant="body2">
                            {paper.examMonth.slice(0, 3)} {paper.examYear}
                          </Typography>
                        </TableCell>
                      )}
                      <TableCell align="right">
                        <Tooltip title="Download">
                          <IconButton
                            size="small"
                            onClick={() => downloadMutation.mutate({ id: paper.id, title: paper.title })}
                          >
                            <Download fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                              onClick={() =>
                                handleEditClick({
                                  id: paper.id,
                                  title: paper.title,
                                  semester: paper.semester,
                                  examYear: paper.examYear,
                                  examMonth: paper.examMonth,
                                  departmentId: paper.departmentId,
                                  subjectId: paper.subjectId,
                                })
                              }
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteClick(paper.id)}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <TablePagination
                component="div"
                count={papers.total}
                page={(filters.page || 1) - 1}
                onPageChange={(_, p) => setFilters((prev) => ({ ...prev, page: p + 1 }))}
                rowsPerPage={filters.limit || 10}
                rowsPerPageOptions={[5, 10, 25]}
                onRowsPerPageChange={(e) =>
                  setFilters((prev) => ({ ...prev, limit: Number(e.target.value), page: 1 }))
                }
              />
            </>
          ) : (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <Description sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                No question papers found
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {searchTerm || filters.departmentId ? 'Try adjusting your filters' : 'Upload your first question paper to get started'}
              </Typography>
              <Button variant="contained" startIcon={<Add />} href="/admin/papers/upload">
                Upload Paper
              </Button>
            </Box>
          )}
        </TableContainer>
      </Card>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Delete Question Paper</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this question paper?</Typography>
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

      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Question Paper</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              fullWidth
              label="Title"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              select
              fullWidth
              label="Department"
              value={editDepartmentId}
              onChange={(e) => handleEditDepartmentChange(e.target.value)}
              sx={{ mb: 2 }}
            >
              {departments?.map((dept) => (
                <MenuItem key={dept.id} value={dept.id}>{dept.name}</MenuItem>
              ))}
            </TextField>
            <TextField
              select
              fullWidth
              label="Subject"
              value={editSubjectId}
              onChange={(e) => setEditSubjectId(e.target.value)}
              disabled={!editDepartmentId}
              sx={{ mb: 2 }}
            >
              {editDepartmentSubjects.map((subj) => (
                <MenuItem key={subj.id} value={subj.id}>{subj.code} - {subj.name}</MenuItem>
              ))}
            </TextField>
            <TextField
              select
              fullWidth
              label="Semester"
              value={editSemester}
              onChange={(e) => setEditSemester(Number(e.target.value))}
              sx={{ mb: 2 }}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                <MenuItem key={sem} value={sem}>Semester {sem}</MenuItem>
              ))}
            </TextField>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                select
                fullWidth
                label="Exam Year"
                value={editExamYear}
                onChange={(e) => setEditExamYear(Number(e.target.value))}
              >
                {years.map((year) => (
                  <MenuItem key={year} value={year}>{year}</MenuItem>
                ))}
              </TextField>
              <TextField
                select
                fullWidth
                label="Exam Month"
                value={editExamMonth}
                onChange={(e) => setEditExamMonth(e.target.value as ExamMonth)}
              >
                {examMonths.map((month) => (
                  <MenuItem key={month} value={month}>{month}</MenuItem>
                ))}
              </TextField>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleConfirmEdit}
            variant="contained"
            disabled={updateMutation.isPending || !editTitle.trim()}
            startIcon={<Edit />}
          >
            {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ManagePapers;
