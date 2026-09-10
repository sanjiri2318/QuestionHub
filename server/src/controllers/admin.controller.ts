import { Request, Response, NextFunction } from 'express';
import { AdminService } from '../services';
import { AuthRequest } from '../types';

export class AdminController {
  static async getDashboardStats(_req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const stats = await AdminService.getDashboardStats();
      res.status(200).json({ success: true, data: stats });
    } catch (error) {
      next(error);
    }
  }

  static async getChartData(_req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await AdminService.getChartData();
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async getActivityLogs(_req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const logs = await AdminService.getActivityLogs();
      res.status(200).json({ success: true, data: logs });
    } catch (error) {
      next(error);
    }
  }

  static async getPendingStudents(_req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const students = await AdminService.getPendingStudents();
      res.status(200).json({ success: true, data: students });
    } catch (error) {
      next(error);
    }
  }

  static async approveStudent(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const student = await AdminService.approveStudent(req.params.id as string, req.ip);
      res.status(200).json({ success: true, message: 'Student approved successfully', data: student });
    } catch (error) {
      next(error);
    }
  }

  static async rejectStudent(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const student = await AdminService.rejectStudent(req.params.id as string, req.ip);
      res.status(200).json({ success: true, message: 'Student rejected successfully', data: student });
    } catch (error) {
      next(error);
    }
  }

  static async getAllStudents(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const search = req.query.search as string | undefined;
      const students = await AdminService.getAllStudents(page, limit, search);
      res.status(200).json({ success: true, data: students });
    } catch (error) {
      next(error);
    }
  }

  static async getDepartments(_req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const departments = await AdminService.getDepartments();
      res.status(200).json({ success: true, data: departments });
    } catch (error) {
      next(error);
    }
  }

  static async createDepartment(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const department = await AdminService.createDepartment(req.body.name, req.ip);
      res.status(201).json({ success: true, message: 'Department created successfully', data: department });
    } catch (error) {
      next(error);
    }
  }

  static async updateDepartment(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const department = await AdminService.updateDepartment(req.params.id as string, req.body.name, req.ip);
      res.status(200).json({ success: true, message: 'Department updated successfully', data: department });
    } catch (error) {
      next(error);
    }
  }

  static async deleteDepartment(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await AdminService.deleteDepartment(req.params.id as string, req.ip);
      res.status(200).json({ success: true, message: 'Department deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  static async getSubjects(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const departmentId = req.query.departmentId as string | undefined;
      const subjects = await AdminService.getSubjects(departmentId);
      res.status(200).json({ success: true, data: subjects });
    } catch (error) {
      next(error);
    }
  }

  static async createSubject(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const subject = await AdminService.createSubject(req.body, req.ip);
      res.status(201).json({ success: true, message: 'Subject created successfully', data: subject });
    } catch (error) {
      next(error);
    }
  }

  static async updateSubject(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const subject = await AdminService.updateSubject(req.params.id as string, req.body, req.ip);
      res.status(200).json({ success: true, message: 'Subject updated successfully', data: subject });
    } catch (error) {
      next(error);
    }
  }

  static async deleteSubject(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await AdminService.deleteSubject(req.params.id as string, req.ip);
      res.status(200).json({ success: true, message: 'Subject deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}
