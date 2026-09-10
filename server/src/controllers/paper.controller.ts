import { Response, NextFunction } from 'express';
import { PaperService } from '../services';
import { AuthRequest } from '../types';
import path from 'path';
import fs from 'fs';
import { config } from '../config';

export class PaperController {
  static async getPapers(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const filters = {
        departmentId: req.query.departmentId as string,
        semester: req.query.semester ? parseInt(req.query.semester as string) : undefined,
        subjectId: req.query.subjectId as string,
        examYear: req.query.examYear ? parseInt(req.query.examYear as string) : undefined,
        examMonth: req.query.examMonth as string,
        search: req.query.search as string,
        sortBy: req.query.sortBy as string,
        sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'desc',
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 12,
      };

      const papers = await PaperService.getPapers(filters, req.user?.id);
      res.status(200).json({
        success: true,
        data: papers,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getPaperById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const paper = await PaperService.getPaperById(req.params.id as string);
      res.status(200).json({
        success: true,
        data: paper,
      });
    } catch (error) {
      next(error);
    }
  }

  static async uploadPaper(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded',
        });
      }

      const paperData = {
        title: req.body.title,
        subjectId: req.body.subjectId,
        departmentId: req.body.departmentId,
        semester: parseInt(req.body.semester),
        examYear: parseInt(req.body.examYear),
        examMonth: req.body.examMonth,
        fileName: req.file.originalname,
        filePath: req.file.path,
        uploadedBy: req.user!.id,
      };

      const paper = await PaperService.uploadPaper(paperData, req.ip);
      res.status(201).json({
        success: true,
        message: 'Paper uploaded successfully',
        data: paper,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updatePaper(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const paper = await PaperService.updatePaper(req.params.id as string, req.body, req.user?.id, req.ip);
      res.status(200).json({
        success: true,
        message: 'Paper updated successfully',
        data: paper,
      });
    } catch (error) {
      next(error);
    }
  }

  static async deletePaper(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await PaperService.deletePaper(req.params.id as string, req.ip);
      res.status(200).json({
        success: true,
        message: 'Paper deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  static async downloadPaper(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const paper = await PaperService.getPaperById(req.params.id as string);
      const filePath = path.resolve(paper.filePath);
      const uploadsDir = path.resolve(path.join(__dirname, '..', '..', config.upload.dir));

      if (!filePath.startsWith(uploadsDir + path.sep) && filePath !== uploadsDir) {
        return res.status(403).json({
          success: false,
          message: 'Access denied',
        });
      }

      if (!fs.existsSync(filePath)) {
        return res.status(404).json({
          success: false,
          message: 'File not found',
        });
      }

      await PaperService.recordDownload(req.user!.id, req.params.id as string, req.ip);

      res.download(filePath, paper.fileName);
    } catch (error) {
      next(error);
    }
  }

  static async previewPaper(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const paper = await PaperService.getPaperById(req.params.id as string);
      const filePath = path.resolve(paper.filePath);
      const uploadsDir = path.resolve(path.join(__dirname, '..', '..', config.upload.dir));

      if (!filePath.startsWith(uploadsDir + path.sep) && filePath !== uploadsDir) {
        return res.status(403).json({
          success: false,
          message: 'Access denied',
        });
      }

      if (!fs.existsSync(filePath)) {
        return res.status(404).json({
          success: false,
          message: 'File not found',
        });
      }

      // Record download for preview as well
      await PaperService.recordDownload(req.user!.id, req.params.id as string, req.ip);

      // Use sendFile for inline display in iframe
      res.sendFile(filePath, { root: '/' });
    } catch (error) {
      next(error);
    }
  }

  static async bookmarkPaper(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const bookmark = await PaperService.bookmarkPaper(req.user!.id, req.params.id as string);
      res.status(201).json({
        success: true,
        message: 'Paper bookmarked successfully',
        data: bookmark,
      });
    } catch (error) {
      next(error);
    }
  }

  static async removeBookmark(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await PaperService.removeBookmark(req.user!.id, req.params.id as string);
      res.status(200).json({
        success: true,
        message: 'Bookmark removed successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  static async getBookmarks(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const bookmarks = await PaperService.getBookmarks(req.user!.id);
      res.status(200).json({
        success: true,
        data: bookmarks,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getRecentDownloads(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const downloads = await PaperService.getRecentDownloads(req.user!.id, limit);
      res.status(200).json({
        success: true,
        data: downloads,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getRecentPapers(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
      const papers = await PaperService.getRecentPapers(limit);
      res.status(200).json({
        success: true,
        data: papers,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getStudentDashboardStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const stats = await PaperService.getStudentDashboardStats(req.user!.id);
      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }
}
