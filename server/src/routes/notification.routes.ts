import { Router } from 'express';
import { NotificationController } from '../controllers';
import { authenticate } from '../middleware';

const router = Router();

router.use(authenticate);

router.get('/', NotificationController.getNotifications);
router.put('/read-all', NotificationController.markAllAsRead);
router.put('/:id/read', NotificationController.markAsRead);
router.delete('/:id', NotificationController.deleteNotification);
router.delete('/', NotificationController.clearAll);

export default router;
