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
  Download as DownloadIcon,
  Download,
  Visibility,
  School,
  CalendarMonth,
  ArrowForward,
  Schedule,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useRecentDownloads, useDownloadPaper } from '@hooks/usePapers';
import EmptyState from '@components/student/common/EmptyState';
import PDFPreviewDialog from '@components/student/common/PDFPreviewDialog';
import type { QuestionPaper } from '@utils/types';

const DownloadsPage = () => {
  const navigate = useNavigate();
  const { data: downloads, isLoading } = useRecentDownloads(50);
  const downloadMutation = useDownloadPaper();
  const [previewPaper, setPreviewPaper] = useState<QuestionPaper | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const handlePreview = useCallback((paper: QuestionPaper) => {
    setPreviewPaper(paper);
    setPreviewOpen(true);
  }, []);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
            Download History
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {downloads ? `${downloads.length} downloads` : 'Your recently downloaded papers'}
          </Typography>
        </Box>
        <Button
          variant="outlined"
          endIcon={<ArrowForward />}
          onClick={() => navigate('/papers')}
        >
          Browse Papers
        </Button>
      </Box>

      {isLoading ? (
        <Grid container spacing={2}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Grid size={{ xs: 12 }} key={i}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Skeleton variant="circular" width={40} height={40} />
                    <Box sx={{ flex: 1 }}>
                      <Skeleton variant="text" height={24} width="60%" />
                      <Skeleton variant="text" height={16} width="30%" />
                    </Box>
                    <Skeleton variant="circular" width={32} height={32} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : downloads && downloads.length > 0 ? (
        <Grid container spacing={2}>
          {downloads.map((download) => (
            <Grid size={{ xs: 12 }} key={download.id}>
              <Card
                sx={{
                  transition: 'all 0.2s',
                  '&:hover': {
                    boxShadow: 2,
                  },
                }}
              >
                <CardContent
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    py: 2,
                    '&:last-child': { pb: 2 },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1, minWidth: 0 }}>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: 1,
                        bgcolor: 'primary.light',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <DownloadIcon sx={{ color: 'primary.main', fontSize: 20 }} />
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body1" noWrap sx={{ fontWeight: 'medium' }}>
                        {download.paper?.title}
                      </Typography>
                      <Stack direction="row" spacing={1} sx={{ mt: 0.5, alignItems: 'center' }}>
                        {download.paper?.subject && (
                          <Typography variant="caption" color="text.secondary">
                            {download.paper.subject.name}
                          </Typography>
                        )}
                        {download.paper && (
                          <>
                            <Chip
                              icon={<School sx={{ fontSize: 10 }} />}
                              label={`Sem ${download.paper.semester}`}
                              size="small"
                              variant="outlined"
                              sx={{ height: 18, fontSize: 10 }}
                            />
                            <Chip
                              icon={<CalendarMonth sx={{ fontSize: 10 }} />}
                              label={`${download.paper.examMonth} ${download.paper.examYear}`}
                              size="small"
                              variant="outlined"
                              sx={{ height: 18, fontSize: 10 }}
                            />
                          </>
                        )}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
                          <Schedule sx={{ fontSize: 12 }} />
                          <Typography variant="caption">
                            {formatDate(download.downloadedAt)}
                          </Typography>
                        </Box>
                      </Stack>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0 }}>
                    <Tooltip title="Preview">
                      <IconButton
                        size="small"
                        onClick={() => download.paper && handlePreview(download.paper)}
                      >
                        <Visibility />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Download again">
                      <IconButton
                        size="small"
                        onClick={() =>
                          downloadMutation.mutate({
                            id: download.paperId,
                            title: download.paper?.title || 'paper',
                          })
                        }
                      >
                        <Download />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <EmptyState
          icon={<DownloadIcon sx={{ fontSize: 80 }} />}
          title="No downloads yet"
          description="Your download history will appear here once you download your first paper."
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

export default DownloadsPage;
