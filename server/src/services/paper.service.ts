import { prisma } from '../prisma';
import { AppError } from '../middleware';
import { getPaginationParams, calculateTotalPages } from '../utils/helpers';
import { AuditLogService } from './audit.service';
import fs from 'fs';
import path from 'path';

interface PaperFilters {
  departmentId?: string;
  semester?: number;
  subjectId?: string;
  examYear?: number;
  examMonth?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

interface UploadPaperInput {
  title: string;
  subjectId: string;
  departmentId: string;
  semester: number;
  examYear: number;
  examMonth: 'JANUARY' | 'MAY' | 'AUGUST' | 'NOVEMBER';
  fileName: string;
  filePath: string;
  uploadedBy: string;
}

export class PaperService {
  static async getPapers(filters: PaperFilters, userId?: string) {
    const { skip, take, page, limit } = getPaginationParams(filters.page, filters.limit);

    const where: any = {};

    if (filters.departmentId) {
      where.departmentId = filters.departmentId;
    }

    if (filters.semester) {
      where.semester = filters.semester;
    }

    if (filters.subjectId) {
      where.subjectId = filters.subjectId;
    }

    if (filters.examYear) {
      where.examYear = filters.examYear;
    }

    if (filters.examMonth) {
      where.examMonth = filters.examMonth;
    }

    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { subject: { name: { contains: filters.search, mode: 'insensitive' } } },
        { subject: { code: { contains: filters.search, mode: 'insensitive' } } },
      ];
    }

    const include: any = {
      subject: true,
      department: true,
      uploader: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      _count: {
        select: {
          downloads: true,
          bookmarks: true,
        },
      },
    };

    if (userId) {
      include.bookmarks = {
        where: { userId },
        select: { id: true },
      };
    }

    const sortField = filters.sortBy || 'createdAt';
    const sortOrder = filters.sortOrder || 'desc';
    const orderMap: Record<string, any> = {
      createdAt: { createdAt: sortOrder },
      title: { title: sortOrder },
      downloads: { downloads: { _count: sortOrder } },
      examYear: { examYear: sortOrder },
      semester: { semester: sortOrder },
    };
    const orderBy = orderMap[sortField] || { createdAt: 'desc' };

    const [papers, total] = await Promise.all([
      prisma.questionPaper.findMany({
        where,
        include,
        orderBy,
        skip,
        take,
      }),
      prisma.questionPaper.count({ where }),
    ]);

    const papersWithStatus = papers.map((paper: any) => ({
      ...paper,
      isBookmarked: paper.bookmarks && paper.bookmarks.length > 0,
      bookmarks: undefined,
    }));

    return {
      data: papersWithStatus,
      total,
      page,
      limit,
      totalPages: calculateTotalPages(total, limit),
    };
  }

  static async getPaperById(id: string) {
    const paper = await prisma.questionPaper.findUnique({
      where: { id },
      include: {
        subject: true,
        department: true,
        uploader: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            downloads: true,
            bookmarks: true,
          },
        },
      },
    });

    if (!paper) {
      throw new AppError('Paper not found', 404);
    }

    return paper;
  }

  static async uploadPaper(data: UploadPaperInput, ip?: string) {
    const paper = await prisma.questionPaper.create({
      data,
      include: {
        subject: true,
        department: true,
      },
    });

    await AuditLogService.log({
      userId: data.uploadedBy,
      action: 'UPLOAD',
      entity: 'QuestionPaper',
      entityId: paper.id,
      details: { title: data.title, subjectId: data.subjectId },
      ip,
    });

    return paper;
  }

  static async updatePaper(id: string, data: Partial<UploadPaperInput>, userId?: string, ip?: string) {
    const existingPaper = await prisma.questionPaper.findUnique({
      where: { id },
    });

    if (!existingPaper) {
      throw new AppError('Paper not found', 404);
    }

    const paper = await prisma.questionPaper.update({
      where: { id },
      data,
      include: {
        subject: true,
        department: true,
      },
    });

    await AuditLogService.log({
      userId,
      action: 'UPDATE',
      entity: 'QuestionPaper',
      entityId: id,
      details: {
        title: data.title || existingPaper.title,
        changes: Object.keys(data),
      },
      ip,
    });

    return paper;
  }

  static async deletePaper(id: string, ip?: string) {
    const existingPaper = await prisma.questionPaper.findUnique({
      where: { id },
    });

    if (!existingPaper) {
      throw new AppError('Paper not found', 404);
    }

    await prisma.questionPaper.delete({
      where: { id },
    });

    // Delete file from disk if it exists
    if (existingPaper.filePath) {
      const filePath = path.resolve(existingPaper.filePath);
      const uploadsDir = path.resolve('uploads');
      
      // Security check: ensure file is within uploads directory
      if (filePath.startsWith(uploadsDir + path.sep) && fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await AuditLogService.log({
      action: 'DELETE',
      entity: 'QuestionPaper',
      entityId: id,
      details: { title: existingPaper.title },
      ip,
    });
  }

  static async getRecentPapers(limit: number = 5) {
    const papers = await prisma.questionPaper.findMany({
      include: {
        subject: true,
        department: true,
        _count: {
          select: {
            downloads: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return papers;
  }

  static async getStudentDashboardStats(userId: string) {
    const [totalPapers, totalBookmarks, totalDownloads, recentPapers, recentDownloads, bookmarks] =
      await Promise.all([
        prisma.questionPaper.count(),
        prisma.bookmark.count({ where: { userId } }),
        prisma.download.count({ where: { userId } }),
        prisma.questionPaper.findMany({
          include: {
            subject: true,
            department: true,
            _count: { select: { downloads: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: 5,
        }),
        prisma.download.findMany({
          where: { userId },
          include: {
            paper: {
              include: {
                subject: true,
                department: true,
              },
            },
          },
          orderBy: { downloadedAt: 'desc' },
          take: 5,
        }),
        prisma.bookmark.findMany({
          where: { userId },
          include: {
            paper: {
              include: {
                subject: true,
                department: true,
              },
            },
          },
          orderBy: { id: 'desc' },
          take: 5,
        }),
      ]);

    return {
      totalPapers,
      totalBookmarks,
      totalDownloads,
      recentPapers,
      recentDownloads,
      recentBookmarks: bookmarks,
    };
  }

  static async bookmarkPaper(userId: string, paperId: string) {
    const existingBookmark = await prisma.bookmark.findUnique({
      where: {
        userId_paperId: {
          userId,
          paperId,
        },
      },
    });

    if (existingBookmark) {
      throw new AppError('Paper already bookmarked', 400);
    }

    const paper = await prisma.questionPaper.findUnique({ where: { id: paperId } });
    if (!paper) {
      throw new AppError('Paper not found', 404);
    }

    const bookmark = await prisma.bookmark.create({
      data: {
        userId,
        paperId,
      },
      include: {
        paper: true,
      },
    });

    return bookmark;
  }

  static async removeBookmark(userId: string, paperId: string) {
    const existingBookmark = await prisma.bookmark.findUnique({
      where: {
        userId_paperId: {
          userId,
          paperId,
        },
      },
    });

    if (!existingBookmark) {
      throw new AppError('Bookmark not found', 404);
    }

    await prisma.bookmark.delete({
      where: {
        userId_paperId: {
          userId,
          paperId,
        },
      },
    });
  }

  static async getBookmarks(userId: string) {
    const bookmarks = await prisma.bookmark.findMany({
      where: { userId },
      include: {
        paper: {
          include: {
            subject: true,
            department: true,
            _count: {
              select: {
                downloads: true,
              },
            },
          },
        },
      },
      orderBy: { id: 'desc' },
    });

    return bookmarks;
  }

  static async recordDownload(userId: string, paperId: string, ip?: string) {
    const paper = await prisma.questionPaper.findUnique({ where: { id: paperId } });
    if (!paper) {
      throw new AppError('Paper not found', 404);
    }

    const download = await prisma.download.create({
      data: {
        userId,
        paperId,
      },
      include: {
        paper: true,
      },
    });

    await AuditLogService.log({
      userId,
      action: 'DOWNLOAD',
      entity: 'QuestionPaper',
      entityId: paperId,
      details: { title: paper.title },
      ip,
    });

    return download;
  }

  static async getRecentDownloads(userId: string, limit: number = 10) {
    const downloads = await prisma.download.findMany({
      where: { userId },
      include: {
        paper: {
          include: {
            subject: true,
            department: true,
          },
        },
      },
      orderBy: { downloadedAt: 'desc' },
      take: limit,
    });

    return downloads;
  }
}
