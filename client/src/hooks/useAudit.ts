import { useQuery } from '@tanstack/react-query';
import { auditService, type AuditLogFilters } from '@services/audit.service';

export const useAuditLogs = (filters?: AuditLogFilters) => {
  return useQuery({
    queryKey: ['auditLogs', filters],
    queryFn: () => auditService.getAuditLogs(filters),
  });
};

export const useAuditLogStats = () => {
  return useQuery({
    queryKey: ['auditLogStats'],
    queryFn: () => auditService.getAuditLogStats(),
  });
};
