import api from './api';
import type { Department, Subject } from '@utils/types';

export const departmentService = {
  getDepartments: async (): Promise<Department[]> => {
    const response = await api.get<{ success: boolean; data: Department[] }>('/departments');
    return response.data.data;
  },

  getDepartmentById: async (id: string): Promise<Department> => {
    const response = await api.get<{ success: boolean; data: Department }>(`/departments/${id}`);
    return response.data.data;
  },

  getSubjectsByDepartment: async (departmentId: string): Promise<Subject[]> => {
    const response = await api.get<{ success: boolean; data: Subject[] }>(
      `/departments/${departmentId}/subjects`,
    );
    return response.data.data;
  },

  getAllSubjects: async (): Promise<Subject[]> => {
    const response = await api.get<{ success: boolean; data: Subject[] }>('/departments/subjects');
    return response.data.data;
  },
};
