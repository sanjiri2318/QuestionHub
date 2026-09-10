import { prisma } from '../prisma';

interface AuditLogFilters {
  action?: string;
  entity?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export class AuditLogService {
  static async log(data: {
    userId?: string;
    action: string;
    entity: string;
    entityId?: string;
    details?: Record<string, unknown>;
    ip?: string;
  }) {
    const createData: any = {
      action: data.action,
      entity: data.entity,
    };
    if (data.userId) createData.userId = data.userId;
    if (data.entityId) createData.entityId = data.entityId;
    if (data.details) createData.details = data.details;
    if (data.ip) createData.ip = data.ip;

    return prisma.auditLog.create({ data: createData });
  }

  static async getAuditLogs(filters: AuditLogFilters) {
    const page = Math.max(1, filters.page || 1);
    const limit = Math.min(100, Math.max(1, filters.limit || 20));
    const skip = (page - 1) * limit;

    const where: any = {};

    if (filters.action) {
      where.action = filters.action;
    }
    if (filters.entity) {
      where.entity = filters.entity;
    }
    if (filters.userId) {
      where.userId = filters.userId;
    }
    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) {
        where.createdAt.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        where.createdAt.lte = new Date(filters.endDate + 'T23:59:59.999Z');
      }
    }

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.auditLog.count({ where }),
    ]);

    return {
      data: logs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  static async getAuditLogStats() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [totalLogs, logsByAction, logsByEntity, recentActivity] = await Promise.all([
      prisma.auditLog.count(),
      prisma.auditLog.groupBy({
        by: ['action'],
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
      }),
      prisma.auditLog.groupBy({
        by: ['entity'],
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
      }),
      prisma.$queryRaw<{ date: string; count: bigint }[]>`
        SELECT TO_CHAR("createdAt", 'YYYY-MM-DD') as date, COUNT(*)::int as count
        FROM "AuditLog"
        WHERE "createdAt" >= NOW() - INTERVAL '30 days'
        GROUP BY TO_CHAR("createdAt", 'YYYY-MM-DD')
        ORDER BY date ASC
      `,
    ]);

    return {
      totalLogs,
      logsByAction: logsByAction.map((l: any) => ({ action: l.action, count: Number(l._count.id) })),
      logsByEntity: logsByEntity.map((l: any) => ({ entity: l.entity, count: Number(l._count.id) })),
      recentActivity: recentActivity.map((r: any) => ({ date: r.date, count: Number(r.count) })),
    };
  }
}
