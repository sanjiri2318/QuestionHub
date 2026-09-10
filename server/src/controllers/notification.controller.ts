import { Response, NextFunction } from 'express';
import { NotificationService } from '../services';
import { AuthRequest } from '../types';

export class NotificationController {
  static async getNotifications(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const unreadOnly = req.query.unread === 'true';
      const data = await NotificationService.getNotifications(req.user!.id, unreadOnly);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async markAsRead(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const notification = await NotificationService.markAsRead(
        req.user!.id,
        req.params.id as string
      );
      res.status(200).json({ success: true, data: notification });
    } catch (error) {
      next(error);
    }
  }

  static async markAllAsRead(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await NotificationService.markAllAsRead(req.user!.id);
      res.status(200).json({ success: true, message: 'All notifications marked as read' });
    } catch (error) {
      next(error);
    }
  }

  static async deleteNotification(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await NotificationService.deleteNotification(req.user!.id, req.params.id as string);
      res.status(200).json({ success: true, message: 'Notification deleted' });
    } catch (error) {
      next(error);
    }
  }

  static async clearAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await NotificationService.clearAll(req.user!.id);
      res.status(200).json({ success: true, message: 'All notifications cleared' });
    } catch (error) {
      next(error);
    }
  }
}
