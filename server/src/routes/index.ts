import { Router } from 'express';
import authRoutes from './auth.routes';
import paperRoutes from './paper.routes';
import adminRoutes from './admin.routes';
import departmentRoutes from './department.routes';
import searchRoutes from './search.routes';
import notificationRoutes from './notification.routes';
import auditRoutes from './audit.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/papers', paperRoutes);
router.use('/admin', adminRoutes);
router.use('/departments', departmentRoutes);
router.use('/search', searchRoutes);
router.use('/notifications', notificationRoutes);
router.use('/audit-logs', auditRoutes);

export default router;
