import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { paperService } from '@services/paper.service';
import type { PaperFilters } from '@utils/types';

export const usePapers = (filters?: PaperFilters) => {
  return useQuery({
    queryKey: ['papers', filters],
    queryFn: () => paperService.getPapers(filters),
  });
};

export const usePaper = (id: string) => {
  return useQuery({
    queryKey: ['paper', id],
    queryFn: () => paperService.getPaperById(id),
    enabled: !!id,
  });
};

export const useRecentPapers = (limit?: number) => {
  return useQuery({
    queryKey: ['recentPapers', limit],
    queryFn: () => paperService.getRecentPapers(limit),
  });
};

export const useStudentDashboard = () => {
  return useQuery({
    queryKey: ['studentDashboard'],
    queryFn: () => paperService.getStudentDashboardStats(),
  });
};

export const useUploadPaper = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData: FormData) => paperService.uploadPaper(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['papers'] });
      queryClient.invalidateQueries({ queryKey: ['studentDashboard'] });
    },
  });
};

export const useUpdatePaper = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<import('@utils/types').QuestionPaper> }) =>
      paperService.updatePaper(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['papers'] });
      queryClient.invalidateQueries({ queryKey: ['paper', variables.id] });
    },
  });
};

export const useDeletePaper = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => paperService.deletePaper(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['papers'] });
    },
  });
};

export const useDownloadPaper = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, title }: { id: string; title: string }) => {
      const blob = await paperService.downloadPaper(id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${title}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studentDashboard'] });
      queryClient.invalidateQueries({ queryKey: ['recentDownloads'] });
    },
    onError: (error) => {
      console.error('Download failed:', error);
    },
  });
};

export const useBookmarkPaper = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => paperService.bookmarkPaper(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
      queryClient.invalidateQueries({ queryKey: ['papers'] });
      queryClient.invalidateQueries({ queryKey: ['studentDashboard'] });
    },
  });
};

export const useRemoveBookmark = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => paperService.removeBookmark(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
      queryClient.invalidateQueries({ queryKey: ['papers'] });
      queryClient.invalidateQueries({ queryKey: ['studentDashboard'] });
    },
  });
};

export const useBookmarks = () => {
  return useQuery({
    queryKey: ['bookmarks'],
    queryFn: () => paperService.getBookmarks(),
  });
};

export const useRecentDownloads = (limit?: number) => {
  return useQuery({
    queryKey: ['recentDownloads', limit],
    queryFn: () => paperService.getRecentDownloads(limit),
  });
};
