import { Response, NextFunction } from 'express';
import { SearchService } from '../services';
import { AuthRequest } from '../types';

export class SearchController {
  static async globalSearch(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const query = req.query.q as string;
      if (!query || query.trim().length < 2) {
        return res.status(200).json({
          success: true,
          data: { papers: [], subjects: [], departments: [] },
        });
      }

      const results = await SearchService.globalSearch(query, req.user?.id);
      res.status(200).json({ success: true, data: results });
    } catch (error) {
      next(error);
    }
  }
}
