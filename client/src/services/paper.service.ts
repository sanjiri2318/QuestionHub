import api from './api';
import type {
  QuestionPaper,
  PaginatedResponse,
  PaperFilters,
  Bookmark,
  Download,
  StudentDashboardData,
} from '@utils/types';

export const paperService = {
  getPapers: async (filters?: PaperFilters): Promise<PaginatedResponse<QuestionPaper>> => {
    const response = await api.get<{ success: boolean; data: PaginatedResponse<QuestionPaper> }>(
      '/papers',
      { params: filters },
    );
    return response.data.data;
  },

  getPaperById: async (id: string): Promise<QuestionPaper> => {
    const response = await api.get<{ success: boolean; data: QuestionPaper }>(`/papers/${id}`);
    return response.data.data;
  },

  getRecentPapers: async (limit?: number): Promise<QuestionPaper[]> => {
    const response = await api.get<{ success: boolean; data: QuestionPaper[] }>(
      '/papers/recent',
      { params: { limit } },
    );
    return response.data.data;
  },

  getStudentDashboardStats: async (): Promise<StudentDashboardData> => {
    const response = await api.get<{ success: boolean; data: StudentDashboardData }>(
      '/papers/dashboard/stats',
    );
    return response.data.data;
  },

  uploadPaper: async (formData: FormData): Promise<QuestionPaper> => {
    const response = await api.post<{ success: boolean; data: QuestionPaper }>(
      '/papers/upload',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return response.data.data;
  },

  updatePaper: async (id: string, data: Partial<QuestionPaper>): Promise<QuestionPaper> => {
    const response = await api.put<{ success: boolean; data: QuestionPaper }>(
      `/papers/${id}`,
      data,
    );
    return response.data.data;
  },

  deletePaper: async (id: string): Promise<void> => {
    await api.delete(`/papers/${id}`);
  },

  downloadPaper: async (id: string): Promise<Blob> => {
    const response = await api.get(`/papers/${id}/download`, { responseType: 'blob' });
    return response.data;
  },

  bookmarkPaper: async (id: string): Promise<Bookmark> => {
    const response = await api.post<{ success: boolean; data: Bookmark }>(
      `/papers/${id}/bookmark`,
    );
    return response.data.data;
  },

  removeBookmark: async (id: string): Promise<void> => {
    await api.delete(`/papers/${id}/bookmark`);
  },

  getBookmarks: async (): Promise<Bookmark[]> => {
    const response = await api.get<{ success: boolean; data: Bookmark[] }>('/papers/bookmarks');
    return response.data.data;
  },

  getRecentDownloads: async (limit?: number): Promise<Download[]> => {
    const response = await api.get<{ success: boolean; data: Download[] }>('/papers/downloads', {
      params: { limit },
    });
    return response.data.data;
  },
};
