import { prisma } from '../prisma';
import { AppError } from '../middleware';

export class NotificationService {
  static async getNotifications(userId: string, unreadOnly: boolean = false) {
    const where: any = { userId };
    if (unreadOnly) where.read = false;

    const [notifications, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
      prisma.notification.count({
        where: { userId, read: false },
      }),
    ]);

    return { notifications, unreadCount };
  }

  static async markAsRead(userId: string, notificationId: string) {
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new AppError('Notification not found', 404);
    }
    if (notification.userId !== userId) {
      throw new AppError('Unauthorized', 403);
    }

    return prisma.notification.update({
      where: { id: notificationId },
      data: { read: true },
    });
  }

  static async markAllAsRead(userId: string) {
    await prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
  }

  static async createNotification(data: {
    userId: string;
    title: string;
    message: string;
    type: string;
    link?: string;
  }) {
    return prisma.notification.create({ data });
  }

  static async deleteNotification(userId: string, notificationId: string) {
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new AppError('Notification not found', 404);
    }
    if (notification.userId !== userId) {
      throw new AppError('Unauthorized', 403);
    }

    await prisma.notification.delete({ where: { id: notificationId } });
  }

  static async clearAll(userId: string) {
    await prisma.notification.deleteMany({ where: { userId } });
  }
}
