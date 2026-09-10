import { Router } from 'express';
import { AdminController } from '../controllers';
import { authenticate, authorize, validate } from '../middleware';
import { departmentSchema, subjectSchema } from '../validators';

const router = Router();

router.use(authenticate);
router.use(authorize('ADMIN'));

router.get('/stats', AdminController.getDashboardStats);
router.get('/chart-data', AdminController.getChartData);
router.get('/activity-logs', AdminController.getActivityLogs);

router.get('/students', AdminController.getAllStudents);
router.get('/students/pending', AdminController.getPendingStudents);
router.put('/students/:id/approve', AdminController.approveStudent);
router.put('/students/:id/reject', AdminController.rejectStudent);

router.get('/departments', AdminController.getDepartments);
router.post('/departments', validate(departmentSchema), AdminController.createDepartment);
router.put('/departments/:id', validate(departmentSchema), AdminController.updateDepartment);
router.delete('/departments/:id', AdminController.deleteDepartment);

router.get('/subjects', AdminController.getSubjects);
router.post('/subjects', validate(subjectSchema), AdminController.createSubject);
router.put('/subjects/:id', validate(subjectSchema), AdminController.updateSubject);
router.delete('/subjects/:id', AdminController.deleteSubject);

export default router;
