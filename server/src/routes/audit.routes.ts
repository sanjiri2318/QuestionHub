import { Router } from 'express';
import { AuditLogController } from '../controllers';
import { authenticate, authorize } from '../middleware';

const router = Router();

router.use(authenticate);
router.use(authorize('ADMIN'));

router.get('/stats', AuditLogController.getAuditLogStats);
router.get('/', AuditLogController.getAuditLogs);

export default router;
