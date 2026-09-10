import api from './api';
import type { QuestionPaper, Subject, Department } from '@utils/types';

interface SearchResult {
  papers: QuestionPaper[];
  subjects: (Subject & { department?: { id: string; name: string }; _count?: { papers: number } })[];
  departments: (Department & { _count?: { subjects: number; papers: number } })[];
}

export const searchService = {
  globalSearch: async (query: string): Promise<SearchResult> => {
    const response = await api.get<{ success: boolean; data: SearchResult }>('/search', {
      params: { q: query },
    });
    return response.data.data;
  },
};
