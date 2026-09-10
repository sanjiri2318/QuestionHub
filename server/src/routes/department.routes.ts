import { Router } from 'express';
import { DepartmentController } from '../controllers';
import { authenticate } from '../middleware';

const router = Router();

// Public: department list is required by the registration page (public form)
router.get('/', DepartmentController.getDepartments);

// Protected routes
router.use(authenticate);
router.get('/subjects', DepartmentController.getAllSubjects);
router.get('/:id', DepartmentController.getDepartmentById);
router.get('/:departmentId/subjects', DepartmentController.getSubjectsByDepartment);

export default router;
