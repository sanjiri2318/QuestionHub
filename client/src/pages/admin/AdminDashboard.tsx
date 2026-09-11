import { useMemo } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  Skeleton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Chip,
  Stack,
} from '@mui/material';
import {
  People,
  Description,
  Download,
  School,
  Pending,
  CheckCircle,
  Business,
  TrendingUp,
  UploadFile,
  Schedule,
} from '@mui/icons-material';
import { useDashboardStats, useChartData, useActivityLogs, usePendingStudents } from '@hooks/useAdmin';
import { useRecentPapers } from '@hooks/usePapers';
import StatCard from '@components/ui/StatCard';
import MiniBarChart from '@components/ui/MiniBarChart';

const AdminDashboard = () => {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: chartData, isLoading: chartLoading } = useChartData();
  const { data: activityLogs, isLoading: logsLoading } = useActivityLogs();
  const { data: pendingStudents, isLoading: pendingLoading } = usePendingStudents();
  const { data: recentPapers, isLoading: papersLoading } = useRecentPapers(5);

  const statCards = [
    { label: 'Total Students', value: stats?.totalStudents || 0, icon: <People />, color: '#1565C0' },
    { label: 'Pending Approvals', value: stats?.pendingApprovals || 0, icon: <Pending />, color: '#F57F17' },
    { label: 'Total Papers', value: stats?.totalPapers || 0, icon: <Description />, color: '#2E7D32' },
    { label: 'Total Downloads', value: stats?.totalDownloads || 0, icon: <Download />, color: '#7B1FA2' },
    { label: 'Departments', value: stats?.totalDepartments || 0, icon: <Business />, color: '#00838F' },
    { label: 'Subjects', value: stats?.totalSubjects || 0, icon: <School />, color: '#4E342E' },
  ];

  const monthlyData = useMemo(() => {
    if (!chartData?.papersByMonth) return [];
    return chartData.papersByMonth.map((item) => ({
      label: item.month.slice(5),
      value: item.count,
    }));
  }, [chartData]);

  const deptData = useMemo(() => {
    if (!chartData?.papersByDepartment) return [];
    return chartData.papersByDepartment.slice(0, 8).map((item) => ({
      label: item.department.slice(0, 6),
      value: item.count,
    }));
  }, [chartData]);

  const getLogIcon = (type: string) => {
    switch (type) {
      case 'student_registration':
        return <People color="info" />;
      case 'paper_upload':
        return <UploadFile color="primary" />;
      case 'download':
        return <Download color="action" />;
      default:
        return <Schedule />;
    }
  };

  const getLogColor = (type: string) => {
    switch (type) {
      case 'student_registration':
        return 'info.main';
      case 'paper_upload':
        return 'primary.main';
      case 'download':
        return 'action.active';
      default:
        return 'text.secondary';
    }
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
        Admin Dashboard
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Overview of QuestionHub activity
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statCards.map((stat) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={stat.label}>
            <StatCard {...stat} loading={statsLoading} />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                Papers by Month
              </Typography>
              {chartLoading ? (
                <Skeleton height={120} />
              ) : monthlyData.length > 0 ? (
                <MiniBarChart data={monthlyData} />
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No data available
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                Papers by Department
              </Typography>
              {chartLoading ? (
                <Skeleton height={120} />
              ) : deptData.length > 0 ? (
                <MiniBarChart data={deptData} />
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No data available
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                Quick Stats
              </Typography>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    Approval Rate
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    {stats && stats.totalStudents > 0
                      ? `${Math.round(((stats.approvedStudents || 0) / stats.totalStudents) * 100)}%`
                      : 'N/A'}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    Papers/Student
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    {stats && stats.totalStudents > 0
                      ? (stats.totalPapers / stats.totalStudents).toFixed(1)
                      : '0'}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    Downloads/Paper
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    {stats && stats.totalPapers > 0
                      ? (stats.totalDownloads / stats.totalPapers).toFixed(1)
                      : '0'}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    Subjects/Dept
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    {stats && stats.totalDepartments > 0
                      ? (stats.totalSubjects / stats.totalDepartments).toFixed(1)
                      : '0'}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Pending Approvals
                </Typography>
                {pendingStudents && pendingStudents.length > 0 && (
                  <Chip label={`${pendingStudents.length} pending`} size="small" color="warning" />
                )}
              </Box>
              {pendingLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} height={60} sx={{ mb: 1 }} />
                ))
              ) : pendingStudents && pendingStudents.length > 0 ? (
                <List>
                  {pendingStudents.slice(0, 5).map((student) => (
                    <ListItem key={student.id} divider>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'warning.main' }}>
                          {student.name.charAt(0).toUpperCase()}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText primary={student.name} secondary={student.email} />
                      <Chip label="Pending" size="small" color="warning" icon={<Pending />} />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Box sx={{ textAlign: 'center', py: 3 }}>
                  <CheckCircle sx={{ fontSize: 48, color: 'success.main', mb: 1 }} />
                  <Typography color="text.secondary">All caught up!</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Recent Uploads
                </Typography>
                <TrendingUp color="primary" />
              </Box>
              {papersLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} height={60} sx={{ mb: 1 }} />
                ))
              ) : recentPapers && recentPapers.length > 0 ? (
                <List>
                  {recentPapers.map((paper) => (
                    <ListItem key={paper.id} divider>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          <Description />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={paper.title}
                        secondary={`${paper.examMonth} ${paper.examYear} - Sem ${paper.semester}`}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Box sx={{ textAlign: 'center', py: 3 }}>
                  <Description sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                  <Typography color="text.secondary">No papers uploaded yet</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
            Activity Log
          </Typography>
          {logsLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} height={48} sx={{ mb: 1 }} />
            ))
          ) : activityLogs && activityLogs.length > 0 ? (
            <List>
              {activityLogs.slice(0, 10).map((log) => (
                <ListItem key={log.id} divider>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: getLogColor(log.type), width: 36, height: 36 }}>
                      {getLogIcon(log.type)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={log.message}
                    secondary={new Date(log.timestamp).toLocaleString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No recent activity
            </Typography>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default AdminDashboard;
