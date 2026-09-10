import { Response, NextFunction } from 'express';
import { AuditLogService } from '../services';
import { AuthRequest } from '../types';

export class AuditLogController {
  static async getAuditLogs(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const filters = {
        action: req.query.action as string | undefined,
        entity: req.query.entity as string | undefined,
        userId: req.query.userId as string | undefined,
        startDate: req.query.startDate as string | undefined,
        endDate: req.query.endDate as string | undefined,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
      };

      const result = await AuditLogService.getAuditLogs(filters);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async getAuditLogStats(_req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const stats = await AuditLogService.getAuditLogStats();
      res.status(200).json({ success: true, data: stats });
    } catch (error) {
      next(error);
    }
  }
}
