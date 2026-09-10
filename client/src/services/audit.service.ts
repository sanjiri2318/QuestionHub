import api from './api';

export interface AuditLogEntry {
  id: string;
  userId: string | null;
  action: string;
  entity: string;
  entityId: string | null;
  details: Record<string, unknown> | null;
  ip: string | null;
  createdAt: string;
  user?: { id: string; name: string; email: string } | null;
}

export interface AuditLogFilters {
  action?: string;
  entity?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface AuditLogStats {
  totalLogs: number;
  logsByAction: { action: string; count: number }[];
  logsByEntity: { entity: string; count: number }[];
  recentActivity: { date: string; count: number }[];
}

export interface PaginatedAuditLogs {
  data: AuditLogEntry[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const auditService = {
  getAuditLogs: async (filters?: AuditLogFilters): Promise<PaginatedAuditLogs> => {
    const response = await api.get<{ success: boolean; data: PaginatedAuditLogs }>('/admin/audit-logs', {
      params: filters,
    });
    return response.data.data;
  },

  getAuditLogStats: async (): Promise<AuditLogStats> => {
    const response = await api.get<{ success: boolean; data: AuditLogStats }>('/admin/audit-logs/stats');
    return response.data.data;
  },
};
