import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '@services/admin.service';

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboardStats'],
    queryFn: () => adminService.getDashboardStats(),
  });
};

export const useChartData = () => {
  return useQuery({
    queryKey: ['chartData'],
    queryFn: () => adminService.getChartData(),
  });
};

export const useActivityLogs = () => {
  return useQuery({
    queryKey: ['activityLogs'],
    queryFn: () => adminService.getActivityLogs(),
  });
};

export const usePendingStudents = () => {
  return useQuery({
    queryKey: ['pendingStudents'],
    queryFn: () => adminService.getPendingStudents(),
  });
};

export const useApproveStudent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminService.approveStudent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingStudents'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
      queryClient.invalidateQueries({ queryKey: ['allStudents'] });
    },
  });
};

export const useRejectStudent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminService.rejectStudent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingStudents'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
      queryClient.invalidateQueries({ queryKey: ['allStudents'] });
    },
  });
};

export const useAllStudents = (page?: number, limit?: number, search?: string) => {
  return useQuery({
    queryKey: ['allStudents', page, limit, search],
    queryFn: () => adminService.getAllStudents(page, limit, search),
  });
};

export const useAdminDepartments = () => {
  return useQuery({
    queryKey: ['adminDepartments'],
    queryFn: () => adminService.getDepartments(),
  });
};

export const useCreateDepartment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string }) => adminService.createDepartment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminDepartments'] });
    },
  });
};

export const useUpdateDepartment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name: string } }) =>
      adminService.updateDepartment(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminDepartments'] });
    },
  });
};

export const useDeleteDepartment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminService.deleteDepartment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminDepartments'] });
    },
  });
};

export const useAdminSubjects = (departmentId?: string) => {
  return useQuery({
    queryKey: ['adminSubjects', departmentId],
    queryFn: () => adminService.getSubjects(departmentId),
  });
};

export const useCreateSubject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<import('@utils/types').Subject, 'id'>) =>
      adminService.createSubject(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminSubjects'] });
    },
  });
};

export const useUpdateSubject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<import('@utils/types').Subject> }) =>
      adminService.updateSubject(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminSubjects'] });
    },
  });
};

export const useDeleteSubject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminService.deleteSubject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminSubjects'] });
    },
  });
};
