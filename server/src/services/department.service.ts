import { prisma } from '../prisma';
import { AppError } from '../middleware';

export class DepartmentService {
  static async getDepartments() {
    const departments = await prisma.department.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: {
            subjects: true,
            papers: true,
          },
        },
      },
    });

    return departments;
  }

  static async getDepartmentById(id: string) {
    const department = await prisma.department.findUnique({
      where: { id },
      include: {
        subjects: {
          orderBy: [{ semester: 'asc' }, { name: 'asc' }],
        },
      },
    });

    if (!department) {
      throw new AppError('Department not found', 404);
    }

    return department;
  }

  static async getSubjectsByDepartment(departmentId: string) {
    const department = await prisma.department.findUnique({
      where: { id: departmentId },
    });

    if (!department) {
      throw new AppError('Department not found', 404);
    }

    const subjects = await prisma.subject.findMany({
      where: { departmentId },
      orderBy: [{ semester: 'asc' }, { name: 'asc' }],
      include: {
        _count: {
          select: {
            papers: true,
          },
        },
      },
    });

    return subjects;
  }

  static async getAllSubjects() {
    const subjects = await prisma.subject.findMany({
      orderBy: [{ semester: 'asc' }, { name: 'asc' }],
      include: {
        department: {
          select: { id: true, name: true },
        },
        _count: {
          select: {
            papers: true,
          },
        },
      },
    });

    return subjects;
  }
}
