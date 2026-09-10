import { useState, useMemo, useCallback } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  MenuItem,
  InputAdornment,
  IconButton,
  Skeleton,
  Pagination,
  Collapse,
  Button,
  Chip,
  Stack,
  Badge,
} from '@mui/material';
import {
  Search,
  FilterList,
  FilterListOff,
  Description,
  ExpandMore,
  ExpandLess,
  Sort,
} from '@mui/icons-material';
import { usePapers, useBookmarkPaper, useRemoveBookmark, useDownloadPaper } from '@hooks/usePapers';
import { useDepartments, useSubjectsByDepartment } from '@hooks/useDepartments';
import PaperCard from '@components/student/common/PaperCard';
import PDFPreviewDialog from '@components/student/common/PDFPreviewDialog';
import EmptyState from '@components/student/common/EmptyState';
import type { PaperFilters, QuestionPaper } from '@utils/types';
import { PAPER_SORT_OPTIONS } from '@utils/types';
import { EXAM_MONTHS, getExamYears } from '@utils/helpers';

const BrowsePapers = () => {
  const [filters, setFilters] = useState<PaperFilters>({
    page: 1,
    limit: 12,
  });
  const [showFilters, setShowFilters] = useState(true);
  const [previewPaper, setPreviewPaper] = useState<QuestionPaper | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const { data: papers, isLoading } = usePapers(filters);
  const { data: departments } = useDepartments();
  const { data: subjects } = useSubjectsByDepartment(filters.departmentId || '');
  const bookmarkMutation = useBookmarkPaper();
  const removeBookmarkMutation = useRemoveBookmark();
  const downloadMutation = useDownloadPaper();

  const examMonths = EXAM_MONTHS;
  const years = getExamYears();

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.departmentId) count++;
    if (filters.semester) count++;
    if (filters.subjectId) count++;
    if (filters.examYear) count++;
    if (filters.examMonth) count++;
    if (filters.search) count++;
    return count;
  }, [filters]);

  const handleFilterChange = useCallback((key: keyof PaperFilters, value: string | number | undefined) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1,
    }));
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({ page: 1, limit: 12 });
  }, []);

  const handlePageChange = useCallback((_event: React.ChangeEvent<unknown>, page: number) => {
    setFilters((prev) => ({ ...prev, page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handlePreview = useCallback((paper: QuestionPaper) => {
    setPreviewPaper(paper);
    setPreviewOpen(true);
  }, []);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold">
            Browse Papers
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {papers ? `${papers.total} papers available` : 'Search and download question papers'}
          </Typography>
        </Box>
        <Button
          startIcon={showFilters ? <FilterListOff /> : <FilterList />}
          onClick={() => setShowFilters(!showFilters)}
          variant="outlined"
          size="small"
        >
          {showFilters ? 'Hide Filters' : 'Show Filters'}
          {activeFilterCount > 0 && (
            <Badge
              badgeContent={activeFilterCount}
              color="primary"
              sx={{ ml: 1, '& .MuiBadge-badge': { position: 'relative', top: 0, right: 0, transform: 'none' } }}
            />
          )}
        </Button>
      </Box>

      {/* Filters */}
      <Collapse in={showFilters}>
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Filter Results
              </Typography>
              {activeFilterCount > 0 && (
                <Button size="small" color="error" onClick={handleClearFilters}>
                  Clear All
                </Button>
              )}
            </Box>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <TextField
                  fullWidth
                  select
                  label="Department"
                  size="small"
                  value={filters.departmentId || ''}
                  onChange={(e) => {
                    handleFilterChange('departmentId', e.target.value || undefined);
                    handleFilterChange('subjectId', undefined);
                  }}
                >
                  <MenuItem value="">All Departments</MenuItem>
                  {departments?.map((dept) => (
                    <MenuItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                <TextField
                  fullWidth
                  select
                  label="Semester"
                  size="small"
                  value={filters.semester || ''}
                  onChange={(e) =>
                    handleFilterChange('semester', e.target.value ? Number(e.target.value) : undefined)
                  }
                >
                  <MenuItem value="">All Semesters</MenuItem>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                    <MenuItem key={sem} value={sem}>
                      Semester {sem}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <TextField
                  fullWidth
                  select
                  label="Subject"
                  size="small"
                  value={filters.subjectId || ''}
                  onChange={(e) => handleFilterChange('subjectId', e.target.value || undefined)}
                  disabled={!filters.departmentId}
                >
                  <MenuItem value="">All Subjects</MenuItem>
                  {subjects?.map((subject) => (
                    <MenuItem key={subject.id} value={subject.id}>
                      {subject.code} - {subject.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                <TextField
                  fullWidth
                  select
                  label="Year"
                  size="small"
                  value={filters.examYear || ''}
                  onChange={(e) =>
                    handleFilterChange('examYear', e.target.value ? Number(e.target.value) : undefined)
                  }
                >
                  <MenuItem value="">All Years</MenuItem>
                  {years.map((year) => (
                    <MenuItem key={year} value={year}>
                      {year}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                <TextField
                  fullWidth
                  select
                  label="Exam Month"
                  size="small"
                  value={filters.examMonth || ''}
                  onChange={(e) => handleFilterChange('examMonth', e.target.value || undefined)}
                >
                  <MenuItem value="">All Months</MenuItem>
                  {examMonths.map((month) => (
                    <MenuItem key={month} value={month}>
                      {month.charAt(0) + month.slice(1).toLowerCase()}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>
            <TextField
              fullWidth
              placeholder="Search by title, subject name, or code..."
              size="small"
              value={filters.search || ''}
              onChange={(e) => handleFilterChange('search', e.target.value || undefined)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                },
              }}
              sx={{ mt: 2 }}
            />
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <TextField
                select
                fullWidth
                size="small"
                label="Sort By"
                value={filters.sortBy || 'createdAt'}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <Sort />
                      </InputAdornment>
                    ),
                  },
                }}
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
                onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
                sx={{ minWidth: 120 }}
              >
                <MenuItem value="desc">Newest First</MenuItem>
                <MenuItem value="asc">Oldest First</MenuItem>
              </TextField>
            </Box>
          </CardContent>
        </Card>
      </Collapse>

      {/* Active Filter Chips */}
      {activeFilterCount > 0 && (
        <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap', gap: 0.5 }}>
          {filters.departmentId && (
            <Chip
              label={`Dept: ${departments?.find((d) => d.id === filters.departmentId)?.name || filters.departmentId}`}
              onDelete={() => handleFilterChange('departmentId', undefined)}
              size="small"
            />
          )}
          {filters.semester && (
            <Chip
              label={`Sem ${filters.semester}`}
              onDelete={() => handleFilterChange('semester', undefined)}
              size="small"
            />
          )}
          {filters.subjectId && (
            <Chip
              label={`Subject: ${subjects?.find((s) => s.id === filters.subjectId)?.name || filters.subjectId}`}
              onDelete={() => handleFilterChange('subjectId', undefined)}
              size="small"
            />
          )}
          {filters.examYear && (
            <Chip
              label={`Year: ${filters.examYear}`}
              onDelete={() => handleFilterChange('examYear', undefined)}
              size="small"
            />
          )}
          {filters.examMonth && (
            <Chip
              label={`Month: ${filters.examMonth}`}
              onDelete={() => handleFilterChange('examMonth', undefined)}
              size="small"
            />
          )}
          {filters.search && (
            <Chip
              label={`Search: "${filters.search}"`}
              onDelete={() => handleFilterChange('search', undefined)}
              size="small"
            />
          )}
        </Stack>
      )}

      {/* Results */}
      {isLoading ? (
        <Grid container spacing={3}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
              <Card sx={{ height: 260 }}>
                <CardContent>
                  <Skeleton variant="text" height={32} width="80%" />
                  <Skeleton variant="text" width="60%" />
                  <Skeleton variant="text" width="40%" />
                  <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                    <Skeleton variant="rounded" width={80} height={24} />
                    <Skeleton variant="rounded" width={60} height={24} />
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1, mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                    <Skeleton variant="circular" width={32} height={32} />
                    <Skeleton variant="circular" width={32} height={32} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : papers && papers.data && papers.data.length > 0 ? (
        <>
          <Grid container spacing={3}>
            {papers.data.map((paper) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={paper.id}>
                <PaperCard
                  paper={paper}
                  onBookmark={(id) => bookmarkMutation.mutate(id)}
                  onRemoveBookmark={(id) => removeBookmarkMutation.mutate(id)}
                  onDownload={(id, title) => downloadMutation.mutate({ id, title })}
                  onPreview={handlePreview}
                />
              </Grid>
            ))}
          </Grid>
          {papers.totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination
                count={papers.totalPages}
                page={papers.page}
                onChange={handlePageChange}
                color="primary"
                size="large"
                showFirstButton
                showLastButton
              />
            </Box>
          )}
        </>
      ) : (
        <EmptyState
          icon={<Description sx={{ fontSize: 80 }} />}
          title="No question papers found"
          description="Try adjusting your filters or check back later for new uploads."
          action={
            activeFilterCount > 0 ? (
              <Button variant="contained" onClick={handleClearFilters}>
                Clear Filters
              </Button>
            ) : undefined
          }
        />
      )}

      {/* PDF Preview Dialog */}
      <PDFPreviewDialog
        paper={previewPaper}
        open={previewOpen}
        onClose={() => {
          setPreviewOpen(false);
          setPreviewPaper(null);
        }}
        onDownload={(id, title) => downloadMutation.mutate({ id, title })}
      />
    </Box>
  );
};

export default BrowsePapers;
