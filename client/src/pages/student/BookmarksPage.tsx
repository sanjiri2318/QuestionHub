import { useState, useCallback } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  IconButton,
  Skeleton,
  Chip,
  Stack,
  Tooltip,
  Button,
} from '@mui/material';
import {
  Bookmark as BookmarkIcon,
  Download,
  Visibility,
  Delete,
  School,
  CalendarMonth,
  ArrowForward,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useBookmarks, useRemoveBookmark, useDownloadPaper } from '@hooks/usePapers';
import EmptyState from '@components/student/common/EmptyState';
import PDFPreviewDialog from '@components/student/common/PDFPreviewDialog';
import type { QuestionPaper } from '@utils/types';

const BookmarksPage = () => {
  const navigate = useNavigate();
  const { data: bookmarks, isLoading } = useBookmarks();
  const removeBookmarkMutation = useRemoveBookmark();
  const downloadMutation = useDownloadPaper();
  const [previewPaper, setPreviewPaper] = useState<QuestionPaper | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const handlePreview = useCallback((paper: QuestionPaper) => {
    setPreviewPaper(paper);
    setPreviewOpen(true);
  }, []);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
            My Bookmarks
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {bookmarks ? `${bookmarks.length} bookmarked papers` : 'Your saved question papers'}
          </Typography>
        </Box>
        <Button
          variant="outlined"
          endIcon={<ArrowForward />}
          onClick={() => navigate('/papers')}
        >
          Browse More
        </Button>
      </Box>

      {isLoading ? (
        <Grid container spacing={3}>
          {Array.from({ length: 4 }).map((_, i) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
              <Card sx={{ height: 220 }}>
                <CardContent>
                  <Skeleton variant="text" height={28} width="80%" />
                  <Skeleton variant="text" width="60%" />
                  <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                    <Skeleton variant="rounded" width={80} height={24} />
                    <Skeleton variant="rounded" width={80} height={24} />
                  </Box>
                  <Box sx={{ display: 'flex', gap: 0.5, mt: 2 }}>
                    <Skeleton variant="circular" width={32} height={32} />
                    <Skeleton variant="circular" width={32} height={32} />
                    <Skeleton variant="circular" width={32} height={32} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : bookmarks && bookmarks.length > 0 ? (
        <Grid container spacing={3}>
          {bookmarks.map((bookmark) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={bookmark.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.2s',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 3,
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1, pb: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 'bold',
                        flex: 1,
                        mr: 1,
                        lineHeight: 1.3,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                      }}
                    >
                      {bookmark.paper?.title}
                    </Typography>
                  </Box>

                  {bookmark.paper?.subject && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                      {bookmark.paper.subject.name}
                    </Typography>
                  )}

                  <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
                    <Chip
                      icon={<School sx={{ fontSize: 14 }} />}
                      label={`Sem ${bookmark.paper?.semester}`}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                    <Chip
                      icon={<CalendarMonth sx={{ fontSize: 14 }} />}
                      label={`${bookmark.paper?.examMonth} ${bookmark.paper?.examYear}`}
                      size="small"
                      variant="outlined"
                    />
                    {bookmark.paper?.department && (
                      <Chip
                        label={bookmark.paper.department.name}
                        size="small"
                        variant="outlined"
                      />
                    )}
                  </Stack>
                </CardContent>

                <Box
                  sx={{
                    p: 1.5,
                    pt: 0,
                    display: 'flex',
                    gap: 0.5,
                    borderTop: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Tooltip title="Preview PDF">
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => bookmark.paper && handlePreview(bookmark.paper)}
                    >
                      <Visibility />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Download PDF">
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() =>
                        downloadMutation.mutate({
                          id: bookmark.paperId,
                          title: bookmark.paper?.title || 'paper',
                        })
                      }
                    >
                      <Download />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Remove bookmark">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => removeBookmarkMutation.mutate(bookmark.paperId)}
                    >
                      <Delete />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <EmptyState
          icon={<BookmarkIcon sx={{ fontSize: 80 }} />}
          title="No bookmarks yet"
          description="Start bookmarking papers to access them quickly later."
          action={
            <Button variant="contained" endIcon={<ArrowForward />} onClick={() => navigate('/papers')}>
              Browse Papers
            </Button>
          }
        />
      )}

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

export default BookmarksPage;
