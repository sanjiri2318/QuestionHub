import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  Skeleton,
  Button,
  Stack,
  Chip,
  Tooltip,
  useTheme,
  LinearProgress,
} from '@mui/material';
import {
  Description,
  Bookmark,
  Download,
  School,
  TrendingUp,
  ArrowForward,
  CalendarMonth,
  AccessTime,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@contexts/AuthContext';
import { useStudentDashboard } from '@hooks/usePapers';
import StatCard from '@components/ui/StatCard';
import MiniBarChart from '@components/ui/MiniBarChart';

const StudentDashboard = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: stats, isLoading } = useStudentDashboard();

  const statCards = [
    {
      label: 'Total Papers',
      value: stats?.totalPapers || 0,
      icon: <Description />,
      color: '#1565C0',
    },
    {
      label: 'Bookmarks',
      value: stats?.totalBookmarks || 0,
      icon: <Bookmark />,
      color: '#2E7D32',
    },
    {
      label: 'Downloads',
      value: stats?.totalDownloads || 0,
      icon: <Download />,
      color: '#F57F17',
    },
  ];

  const downloadActivity = (() => {
    if (!stats?.recentDownloads || stats.recentDownloads.length === 0) return [];
    const dayCounts: Record<string, number> = {};
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toLocaleDateString('en-IN', { weekday: 'short' });
      dayCounts[key] = 0;
    }
    stats.recentDownloads.forEach((dl) => {
      const d = new Date(dl.downloadedAt);
      const key = d.toLocaleDateString('en-IN', { weekday: 'short' });
      if (key in dayCounts) dayCounts[key]++;
    });
    return Object.entries(dayCounts).map(([label, value]) => ({ label, value }));
  })();

  return (
    <Box>
      {/* Welcome Banner */}
      <Card
        sx={{
          mb: 4,
          background:
            theme.palette.mode === 'dark'
              ? 'linear-gradient(135deg, #1565C0 0%, #0D47A1 100%)'
              : 'linear-gradient(135deg, #1565C0 0%, #0D47A1 100%)',
          color: 'white',
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant="h4" fontWeight="bold" sx={{ mb: 0.5 }}>
                Welcome back, {user?.name?.split(' ')[0]}!
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Access previous year question papers for your department.
              </Typography>
            </Box>
            <Button
              variant="contained"
              sx={{
                bgcolor: 'white',
                color: 'primary.main',
                fontWeight: 600,
                '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' },
              }}
              endIcon={<ArrowForward />}
              onClick={() => navigate('/papers')}
            >
              Browse Papers
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statCards.map((stat) => (
          <Grid size={{ xs: 12, sm: 4 }} key={stat.label}>
            <StatCard {...stat} loading={isLoading} />
          </Grid>
        ))}
      </Grid>

      {/* Download Activity */}
      {downloadActivity.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight="bold">
                Download Activity (Last 7 Days)
              </Typography>
              <AccessTime color="action" />
            </Box>
            <MiniBarChart data={downloadActivity} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
              {downloadActivity.map((d, i) => (
                <Typography key={i} variant="caption" color="text.secondary" sx={{ flex: 1, textAlign: 'center' }}>
                  {d.label}
                </Typography>
              ))}
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Content Grid */}
      <Grid container spacing={3}>
        {/* Recent Papers */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight="bold">
                  Recent Papers
                </Typography>
                <Button
                  size="small"
                  endIcon={<ArrowForward />}
                  onClick={() => navigate('/papers')}
                >
                  View All
                </Button>
              </Box>
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} height={72} sx={{ mb: 1, borderRadius: 1 }} />
                ))
              ) : stats?.recentPapers && stats.recentPapers.length > 0 ? (
                stats.recentPapers.map((paper) => (
                  <Box
                    key={paper.id}
                    sx={{
                      p: 2,
                      mb: 1,
                      borderRadius: 1,
                      bgcolor: 'background.default',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      cursor: 'pointer',
                      transition: 'background-color 0.2s',
                      '&:hover': { bgcolor: 'action.hover' },
                    }}
                    onClick={() => navigate('/papers')}
                  >
                    <Description color="primary" />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body2" fontWeight="medium" noWrap>
                        {paper.title}
                      </Typography>
                      <Stack direction="row" spacing={0.5} sx={{ mt: 0.5 }}>
                        <Chip
                          icon={<School sx={{ fontSize: 12 }} />}
                          label={`Sem ${paper.semester}`}
                          size="small"
                          variant="outlined"
                          sx={{ height: 20, fontSize: 11 }}
                        />
                        <Chip
                          icon={<CalendarMonth sx={{ fontSize: 12 }} />}
                          label={`${paper.examMonth} ${paper.examYear}`}
                          size="small"
                          variant="outlined"
                          sx={{ height: 20, fontSize: 11 }}
                        />
                      </Stack>
                    </Box>
                    {paper._count && (
                      <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
                        {paper._count.downloads} downloads
                      </Typography>
                    )}
                  </Box>
                ))
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <School sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                  <Typography color="text.secondary">No papers available yet</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Bookmarks */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight="bold">
                  Bookmarked Papers
                </Typography>
                <Button
                  size="small"
                  endIcon={<ArrowForward />}
                  onClick={() => navigate('/bookmarks')}
                >
                  View All
                </Button>
              </Box>
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} height={72} sx={{ mb: 1, borderRadius: 1 }} />
                ))
              ) : stats?.recentBookmarks && stats.recentBookmarks.length > 0 ? (
                stats.recentBookmarks.map((bookmark) => (
                  <Box
                    key={bookmark.id}
                    sx={{
                      p: 2,
                      mb: 1,
                      borderRadius: 1,
                      bgcolor: 'background.default',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      cursor: 'pointer',
                      transition: 'background-color 0.2s',
                      '&:hover': { bgcolor: 'action.hover' },
                    }}
                    onClick={() => navigate('/bookmarks')}
                  >
                    <Bookmark color="secondary" />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body2" fontWeight="medium" noWrap>
                        {bookmark.paper?.title}
                      </Typography>
                      <Stack direction="row" spacing={0.5} sx={{ mt: 0.5 }}>
                        <Chip
                          icon={<School sx={{ fontSize: 12 }} />}
                          label={`Sem ${bookmark.paper?.semester}`}
                          size="small"
                          variant="outlined"
                          sx={{ height: 20, fontSize: 11 }}
                        />
                        <Chip
                          icon={<CalendarMonth sx={{ fontSize: 12 }} />}
                          label={`${bookmark.paper?.examMonth} ${bookmark.paper?.examYear}`}
                          size="small"
                          variant="outlined"
                          sx={{ height: 20, fontSize: 11 }}
                        />
                      </Stack>
                    </Box>
                  </Box>
                ))
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Bookmark sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                  <Typography color="text.secondary">No bookmarks yet</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    Bookmark papers to access them quickly later.
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                Quick Actions
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Button
                  variant="outlined"
                  startIcon={<Description />}
                  onClick={() => navigate('/papers')}
                  sx={{ flex: 1 }}
                >
                  Browse All Papers
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Bookmark />}
                  onClick={() => navigate('/bookmarks')}
                  sx={{ flex: 1 }}
                >
                  View Bookmarks
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Download />}
                  onClick={() => navigate('/downloads')}
                  sx={{ flex: 1 }}
                >
                  Download History
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<TrendingUp />}
                  onClick={() => navigate('/profile')}
                  sx={{ flex: 1 }}
                >
                  My Profile
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default StudentDashboard;
