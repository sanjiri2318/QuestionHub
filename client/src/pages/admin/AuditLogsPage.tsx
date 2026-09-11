import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  MenuItem,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Chip,
  Skeleton,
  TablePagination,
  Button,
} from '@mui/material';
import {
  FilterList,
  CheckCircle,
  Description,
  Delete,
  Download,
  PersonAdd,
  PersonRemove,
  Edit,
  Upload,
} from '@mui/icons-material';
import { useAuditLogs, useAuditLogStats } from '@hooks/useAudit';
import type { AuditLogFilters } from '@services/audit.service';

const actionOptions = [
  { value: '', label: 'All Actions' },
  { value: 'CREATE', label: 'Create' },
  { value: 'UPDATE', label: 'Update' },
  { value: 'DELETE', label: 'Delete' },
  { value: 'APPROVE', label: 'Approve' },
  { value: 'REJECT', label: 'Reject' },
  { value: 'UPLOAD', label: 'Upload' },
  { value: 'DOWNLOAD', label: 'Download' },
];

const entityOptions = [
  { value: '', label: 'All Entities' },
  { value: 'User', label: 'Users' },
  { value: 'QuestionPaper', label: 'Papers' },
  { value: 'Department', label: 'Departments' },
  { value: 'Subject', label: 'Subjects' },
];

const AuditLogsPage = () => {
  const [filters, setFilters] = useState<AuditLogFilters>({ page: 1, limit: 20 });
  const { data: logsData, isLoading } = useAuditLogs(filters);
  const { data: stats } = useAuditLogStats();

  const handleFilterChange = (key: keyof AuditLogFilters, value: string | number | undefined) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'CREATE': return <CheckCircle sx={{ color: 'success.main', fontSize: 20 }} />;
      case 'DELETE': return <Delete sx={{ color: 'error.main', fontSize: 20 }} />;
      case 'UPLOAD': return <Upload sx={{ color: 'primary.main', fontSize: 20 }} />;
      case 'DOWNLOAD': return <Download sx={{ color: 'info.main', fontSize: 20 }} />;
      case 'APPROVE': return <PersonAdd sx={{ color: 'success.main', fontSize: 20 }} />;
      case 'REJECT': return <PersonRemove sx={{ color: 'error.main', fontSize: 20 }} />;
      case 'UPDATE': return <Edit sx={{ color: 'warning.main', fontSize: 20 }} />;
      default: return <Description sx={{ color: 'action.active', fontSize: 20 }} />;
    }
  };

  const getActionColor = (action: string): 'success' | 'error' | 'primary' | 'warning' | 'info' | 'default' => {
    switch (action) {
      case 'CREATE': return 'success';
      case 'DELETE': return 'error';
      case 'UPLOAD': return 'primary';
      case 'DOWNLOAD': return 'info';
      case 'APPROVE': return 'success';
      case 'REJECT': return 'error';
      case 'UPDATE': return 'warning';
      default: return 'default';
    }
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3 }}>
        Audit Logs
      </Typography>

      {stats && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }} color="primary">
                  {stats.totalLogs}
                </Typography>
                <Typography variant="body2" color="text.secondary">Total Events</Typography>
              </CardContent>
            </Card>
          </Grid>
          {stats.logsByAction.slice(0, 3).map((item) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={item.action}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {item.count}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {item.action}s
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <FilterList color="action" />
            <Typography variant="subtitle2" color="text.secondary">Filters</Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <TextField
              select
              size="small"
              label="Action"
              value={filters.action || ''}
              onChange={(e) => handleFilterChange('action', e.target.value || undefined)}
              sx={{ minWidth: 140 }}
            >
              {actionOptions.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
              ))}
            </TextField>
            <TextField
              select
              size="small"
              label="Entity"
              value={filters.entity || ''}
              onChange={(e) => handleFilterChange('entity', e.target.value || undefined)}
              sx={{ minWidth: 140 }}
            >
              {entityOptions.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
              ))}
            </TextField>
            <TextField
              size="small"
              type="date"
              label="Start Date"
              value={filters.startDate || ''}
              onChange={(e) => handleFilterChange('startDate', e.target.value || undefined)}
              slotProps={{ inputLabel: { shrink: true } }}
              sx={{ minWidth: 150 }}
            />
            <TextField
              size="small"
              type="date"
              label="End Date"
              value={filters.endDate || ''}
              onChange={(e) => handleFilterChange('endDate', e.target.value || undefined)}
              slotProps={{ inputLabel: { shrink: true } }}
              sx={{ minWidth: 150 }}
            />
            {(filters.action || filters.entity || filters.startDate || filters.endDate) && (
              <Button
                size="small"
                color="error"
                onClick={() => setFilters({ page: 1, limit: 20 })}
              >
                Clear Filters
              </Button>
            )}
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
          ) : logsData && logsData.data.length > 0 ? (
            <>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Action</TableCell>
                    <TableCell>Entity</TableCell>
                    <TableCell>Details</TableCell>
                    <TableCell>User</TableCell>
                    <TableCell>Timestamp</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {logsData.data.map((log) => (
                    <TableRow key={log.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar sx={{ width: 32, height: 32, bgcolor: 'transparent' }}>
                            {getActionIcon(log.action)}
                          </Avatar>
                          <Chip
                            label={log.action}
                            size="small"
                            color={getActionColor(log.action)}
                            variant="outlined"
                          />
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{log.entity}</Typography>
                        {log.entityId && (
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                            {log.entityId.slice(0, 8)}...
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        {log.details ? (
                          <Typography variant="body2" noWrap sx={{ maxWidth: 250 }}>
                            {Object.entries(log.details)
                              .map(([k, v]) => `${k}: ${String(v)}`)
                              .join(', ')}
                          </Typography>
                        ) : (
                          <Typography variant="body2" color="text.secondary">-</Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        {log.user ? (
                          <Box>
                            <Typography variant="body2">{log.user.name}</Typography>
                            <Typography variant="caption" color="text.secondary">{log.user.email}</Typography>
                          </Box>
                        ) : (
                          <Typography variant="body2" color="text.secondary">System</Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {new Date(log.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric', month: 'short', year: 'numeric',
                          })}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(log.createdAt).toLocaleTimeString('en-IN', {
                            hour: '2-digit', minute: '2-digit',
                          })}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <TablePagination
                component="div"
                count={logsData.total}
                page={(logsData.page || 1) - 1}
                onPageChange={(_, p) => setFilters((prev) => ({ ...prev, page: p + 1 }))}
                rowsPerPage={logsData.limit}
                rowsPerPageOptions={[10, 20, 50]}
                onRowsPerPageChange={(e) =>
                  setFilters((prev) => ({ ...prev, limit: Number(e.target.value), page: 1 }))
                }
              />
            </>
          ) : (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <Description sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">No audit logs found</Typography>
              <Typography variant="body2" color="text.secondary">
                {filters.action || filters.entity ? 'Try adjusting your filters' : 'Activity will appear here as users interact with the platform'}
              </Typography>
            </Box>
          )}
        </TableContainer>
      </Card>
    </Box>
  );
};

export default AuditLogsPage;
