import { prisma } from '../prisma';
import { AppError } from '../middleware';
import { AuditLogService } from './audit.service';
import { NotificationService } from './notification.service';
import { EmailService } from './email.service';

export class AdminService {
  static async getDashboardStats() {
    const [
      totalStudents,
      pendingApprovals,
      approvedStudents,
      totalPapers,
      totalDownloads,
      totalSubjects,
      totalDepartments,
    ] = await Promise.all([
      prisma.user.count({ where: { role: 'STUDENT' } }),
      prisma.user.count({ where: { role: 'STUDENT', status: 'PENDING' } }),
      prisma.user.count({ where: { role: 'STUDENT', status: 'APPROVED' } }),
      prisma.questionPaper.count(),
      prisma.download.count(),
      prisma.subject.count(),
      prisma.department.count(),
    ]);

    return {
      totalStudents,
      pendingApprovals,
      approvedStudents,
      totalPapers,
      totalDownloads,
      totalSubjects,
      totalDepartments,
    };
  }

  static async getChartData() {
    const [papersByDepartment, papersByMonth, recentUploads] = await Promise.all([
      prisma.questionPaper.groupBy({
        by: ['departmentId'],
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
      }),
      prisma.$queryRaw<{ month: string; count: bigint }[]>`
        SELECT TO_CHAR("createdAt", 'YYYY-MM') as month, COUNT(*)::int as count
        FROM "QuestionPaper"
        WHERE "createdAt" >= NOW() - INTERVAL '12 months'
        GROUP BY TO_CHAR("createdAt", 'YYYY-MM')
        ORDER BY month ASC
      `,
      prisma.questionPaper.findMany({
        select: { createdAt: true },
        orderBy: { createdAt: 'desc' },
        take: 100,
      }),
    ]);

    const departments = await prisma.department.findMany({
      select: { id: true, name: true },
    });

    const deptMap = new Map(departments.map((d) => [d.id, d.name]));
    const chartPapersByDept = papersByDepartment.map((item) => ({
      department: deptMap.get(item.departmentId) || 'Unknown',
      count: Number(item._count.id),
    }));

    const chartPapersByMonth = papersByMonth.map((item) => ({
      month: item.month,
      count: Number(item.count),
    }));

    const today = new Date();
    const uploadsByDay: { date: string; count: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const count = recentUploads.filter(
        (u) => u.createdAt.toISOString().split('T')[0] === dateStr
      ).length;
      uploadsByDay.push({ date: dateStr, count });
    }

    return {
      papersByDepartment: chartPapersByDept,
      papersByMonth: chartPapersByMonth,
      uploadsByDay,
    };
  }

  static async getActivityLogs() {
    const [recentStudents, recentPapers, recentDownloads] = await Promise.all([
      prisma.user.findMany({
        where: { role: 'STUDENT' },
        select: {
          id: true,
          name: true,
          email: true,
          status: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      prisma.questionPaper.findMany({
        select: {
          id: true,
          title: true,
          createdAt: true,
          uploader: { select: { name: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      prisma.download.findMany({
        select: {
          id: true,
          downloadedAt: true,
          user: { select: { name: true } },
          paper: { select: { title: true } },
        },
        orderBy: { downloadedAt: 'desc' },
        take: 10,
      }),
    ]);

    const logs: Array<{
      id: string;
      type: 'student_registration' | 'paper_upload' | 'download';
      message: string;
      timestamp: Date;
    }> = [];

    recentStudents.forEach((s) => {
      logs.push({
        id: `reg-${s.id}`,
        type: 'student_registration',
        message: `${s.name} registered (${s.status.toLowerCase()})`,
        timestamp: s.createdAt,
      });
    });

    recentPapers.forEach((p) => {
      logs.push({
        id: `upload-${p.id}`,
        type: 'paper_upload',
        message: `${p.uploader.name} uploaded "${p.title}"`,
        timestamp: p.createdAt,
      });
    });

    recentDownloads.forEach((d) => {
      logs.push({
        id: `dl-${d.id}`,
        type: 'download',
        message: `${d.user.name} downloaded "${d.paper.title}"`,
        timestamp: d.downloadedAt,
      });
    });

    logs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    return logs.slice(0, 20);
  }

  static async getPendingStudents() {
    const students = await prisma.user.findMany({
      where: {
        role: 'STUDENT',
        status: 'PENDING',
      },
      select: {
        id: true,
        name: true,
        email: true,
        registerNumber: true,
        status: true,
        createdAt: true,
        department: {
          select: { id: true, name: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return students;
  }

  static async approveStudent(id: string, ip?: string) {
    const student = await prisma.user.findUnique({ where: { id } });

    if (!student) {
      throw new AppError('Student not found', 404);
    }
    if (student.role !== 'STUDENT') {
      throw new AppError('User is not a student', 400);
    }
    if (student.status === 'APPROVED') {
      throw new AppError('Student already approved', 400);
    }

    const updatedStudent = await prisma.user.update({
      where: { id },
      data: { status: 'APPROVED' },
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
      },
    });

    await AuditLogService.log({
      userId: id,
      action: 'APPROVE',
      entity: 'User',
      entityId: id,
      details: { name: student.name, email: student.email },
      ip,
    });

    await NotificationService.createNotification({
      userId: id,
      title: 'Account Approved',
      message: 'Your account has been approved. You can now access the platform.',
      type: 'success',
      link: '/dashboard',
    });

    await EmailService.sendRegistrationApprovedEmail(student.email, student.name);

    return updatedStudent;
  }

  static async rejectStudent(id: string, ip?: string) {
    const student = await prisma.user.findUnique({ where: { id } });

    if (!student) {
      throw new AppError('Student not found', 404);
    }
    if (student.role !== 'STUDENT') {
      throw new AppError('User is not a student', 400);
    }

    const updatedStudent = await prisma.user.update({
      where: { id },
      data: { status: 'REJECTED' },
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
      },
    });

    await AuditLogService.log({
      userId: id,
      action: 'REJECT',
      entity: 'User',
      entityId: id,
      details: { name: student.name, email: student.email },
      ip,
    });

    await EmailService.sendRegistrationRejectedEmail(student.email, student.name);

    return updatedStudent;
  }

  static async getAllStudents(page: number = 1, limit: number = 10, search?: string) {
    const skip = (page - 1) * limit;
    const where: any = { role: 'STUDENT' };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { registerNumber: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [students, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: { department: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    return {
      data: students,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  static async getDepartments() {
    const departments = await prisma.department.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { users: true, subjects: true, papers: true },
        },
      },
    });
    return departments;
  }

  static async createDepartment(name: string, ip?: string) {
    const existing = await prisma.department.findUnique({ where: { name } });
    if (existing) {
      throw new AppError('Department already exists', 400);
    }
    const dept = await prisma.department.create({ data: { name } });
    await AuditLogService.log({ action: 'CREATE', entity: 'Department', entityId: dept.id, details: { name }, ip });
    return dept;
  }

  static async updateDepartment(id: string, name: string, ip?: string) {
    const existing = await prisma.department.findUnique({ where: { id } });
    if (!existing) {
      throw new AppError('Department not found', 404);
    }
    const duplicate = await prisma.department.findFirst({
      where: { name, id: { not: id } },
    });
    if (duplicate) {
      throw new AppError('Department name already exists', 400);
    }
    const updated = await prisma.department.update({ where: { id }, data: { name } });
    await AuditLogService.log({ action: 'UPDATE', entity: 'Department', entityId: id, details: { oldName: existing.name, newName: name }, ip });
    return updated;
  }

  static async deleteDepartment(id: string, ip?: string) {
    const existing = await prisma.department.findUnique({
      where: { id },
      include: {
        _count: { select: { users: true, subjects: true, papers: true } },
      },
    });
    if (!existing) {
      throw new AppError('Department not found', 404);
    }
    if (existing._count.users > 0 || existing._count.subjects > 0 || existing._count.papers > 0) {
      throw new AppError('Cannot delete department with associated records', 400);
    }
    await prisma.department.delete({ where: { id } });
    await AuditLogService.log({ action: 'DELETE', entity: 'Department', entityId: id, details: { name: existing.name }, ip });
  }

  static async getSubjects(departmentId?: string) {
    const where = departmentId ? { departmentId } : {};
    const subjects = await prisma.subject.findMany({
      where,
      include: {
        department: true,
        _count: { select: { papers: true } },
      },
      orderBy: [{ departmentId: 'asc' }, { semester: 'asc' }, { name: 'asc' }],
    });
    return subjects;
  }

  static async createSubject(data: {
    code: string;
    name: string;
    semester: number;
    departmentId: string;
  }, ip?: string) {
    const existing = await prisma.subject.findUnique({
      where: {
        code_departmentId: { code: data.code, departmentId: data.departmentId },
      },
    });
    if (existing) {
      throw new AppError('Subject already exists in this department', 400);
    }
    const subject = await prisma.subject.create({
      data,
      include: { department: true },
    });
    await AuditLogService.log({ action: 'CREATE', entity: 'Subject', entityId: subject.id, details: { code: data.code, name: data.name }, ip });
    return subject;
  }

  static async updateSubject(
    id: string,
    data: Partial<{ code: string; name: string; semester: number; departmentId: string }>,
    ip?: string,
  ) {
    const existing = await prisma.subject.findUnique({ where: { id } });
    if (!existing) {
      throw new AppError('Subject not found', 404);
    }
    if (data.code && data.departmentId) {
      const duplicate = await prisma.subject.findFirst({
        where: { code: data.code, departmentId: data.departmentId, id: { not: id } },
      });
      if (duplicate) {
        throw new AppError('Subject code already exists in this department', 400);
      }
    }
    const updated = await prisma.subject.update({
      where: { id },
      data,
      include: { department: true },
    });
    await AuditLogService.log({ action: 'UPDATE', entity: 'Subject', entityId: id, details: { oldCode: existing.code, newCode: data.code || existing.code, oldName: existing.name, newName: data.name || existing.name }, ip });
    return updated;
  }

  static async deleteSubject(id: string, ip?: string) {
    const existing = await prisma.subject.findUnique({
      where: { id },
      include: { _count: { select: { papers: true } } },
    });
    if (!existing) {
      throw new AppError('Subject not found', 404);
    }
    if (existing._count.papers > 0) {
      throw new AppError('Cannot delete subject with associated papers', 400);
    }
    await prisma.subject.delete({ where: { id } });
    await AuditLogService.log({ action: 'DELETE', entity: 'Subject', entityId: id, details: { code: existing.code, name: existing.name }, ip });
  }
}
