import { useQuery } from '@tanstack/react-query';
import { departmentService } from '@services/department.service';

export const useDepartments = () => {
  return useQuery({
    queryKey: ['departments'],
    queryFn: () => departmentService.getDepartments(),
  });
};

export const useDepartment = (id: string) => {
  return useQuery({
    queryKey: ['department', id],
    queryFn: () => departmentService.getDepartmentById(id),
    enabled: !!id,
  });
};

export const useSubjectsByDepartment = (departmentId: string) => {
  return useQuery({
    queryKey: ['subjects', departmentId],
    queryFn: () => departmentService.getSubjectsByDepartment(departmentId),
    enabled: !!departmentId,
  });
};

export const useAllSubjects = () => {
  return useQuery({
    queryKey: ['allSubjects'],
    queryFn: () => departmentService.getAllSubjects(),
  });
};
