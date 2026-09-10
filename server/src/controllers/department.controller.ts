import { Request, Response, NextFunction } from 'express';
import { DepartmentService } from '../services';

export class DepartmentController {
  static async getDepartments(req: Request, res: Response, next: NextFunction) {
    try {
      const departments = await DepartmentService.getDepartments();
      res.status(200).json({
        success: true,
        data: departments,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getDepartmentById(req: Request, res: Response, next: NextFunction) {
    try {
      const department = await DepartmentService.getDepartmentById(req.params.id as string);
      res.status(200).json({
        success: true,
        data: department,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getSubjectsByDepartment(req: Request, res: Response, next: NextFunction) {
    try {
      const subjects = await DepartmentService.getSubjectsByDepartment(req.params.departmentId as string);
      res.status(200).json({
        success: true,
        data: subjects,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getAllSubjects(req: Request, res: Response, next: NextFunction) {
    try {
      const subjects = await DepartmentService.getAllSubjects();
      res.status(200).json({
        success: true,
        data: subjects,
      });
    } catch (error) {
      next(error);
    }
  }
}
