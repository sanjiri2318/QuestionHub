import api from './api';
import type {
  User,
  Department,
  Subject,
  DashboardStats,
  PaginatedResponse,
  ChartData,
  ActivityLog,
  DepartmentWithCount,
  SubjectWithCount,
} from '@utils/types';

export const adminService = {
  getDashboardStats: async (): Promise<DashboardStats> => {
    const response = await api.get<{ success: boolean; data: DashboardStats }>('/admin/stats');
    return response.data.data;
  },

  getChartData: async (): Promise<ChartData> => {
    const response = await api.get<{ success: boolean; data: ChartData }>('/admin/chart-data');
    return response.data.data;
  },

  getActivityLogs: async (): Promise<ActivityLog[]> => {
    const response = await api.get<{ success: boolean; data: ActivityLog[] }>(
      '/admin/activity-logs',
    );
    return response.data.data;
  },

  getPendingStudents: async (): Promise<User[]> => {
    const response = await api.get<{ success: boolean; data: User[] }>(
      '/admin/students/pending',
    );
    return response.data.data;
  },

  approveStudent: async (id: string): Promise<User> => {
    const response = await api.put<{ success: boolean; data: User }>(
      `/admin/students/${id}/approve`,
    );
    return response.data.data;
  },

  rejectStudent: async (id: string): Promise<User> => {
    const response = await api.put<{ success: boolean; data: User }>(
      `/admin/students/${id}/reject`,
    );
    return response.data.data;
  },

  getAllStudents: async (
    page?: number,
    limit?: number,
    search?: string,
  ): Promise<PaginatedResponse<User>> => {
    const response = await api.get<{ success: boolean; data: PaginatedResponse<User> }>(
      '/admin/students',
      { params: { page, limit, search } },
    );
    return response.data.data;
  },

  getDepartments: async (): Promise<DepartmentWithCount[]> => {
    const response = await api.get<{ success: boolean; data: DepartmentWithCount[] }>(
      '/admin/departments',
    );
    return response.data.data;
  },

  createDepartment: async (data: { name: string }): Promise<Department> => {
    const response = await api.post<{ success: boolean; data: Department }>(
      '/admin/departments',
      data,
    );
    return response.data.data;
  },

  updateDepartment: async (id: string, data: { name: string }): Promise<Department> => {
    const response = await api.put<{ success: boolean; data: Department }>(
      `/admin/departments/${id}`,
      data,
    );
    return response.data.data;
  },

  deleteDepartment: async (id: string): Promise<void> => {
    await api.delete(`/admin/departments/${id}`);
  },

  getSubjects: async (departmentId?: string): Promise<SubjectWithCount[]> => {
    const response = await api.get<{ success: boolean; data: SubjectWithCount[] }>(
      '/admin/subjects',
      { params: { departmentId } },
    );
    return response.data.data;
  },

  createSubject: async (data: Omit<Subject, 'id'>): Promise<Subject> => {
    const response = await api.post<{ success: boolean; data: Subject }>('/admin/subjects', data);
    return response.data.data;
  },

  updateSubject: async (id: string, data: Partial<Subject>): Promise<Subject> => {
    const response = await api.put<{ success: boolean; data: Subject }>(
      `/admin/subjects/${id}`,
      data,
    );
    return response.data.data;
  },

  deleteSubject: async (id: string): Promise<void> => {
    await api.delete(`/admin/subjects/${id}`);
  },
};
