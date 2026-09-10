export type UserRole = 'STUDENT' | 'ADMIN';
export type UserStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type ExamMonth = 'JANUARY' | 'MAY' | 'AUGUST' | 'NOVEMBER';

export interface User {
  id: string;
  name: string;
  registerNumber: string;
  email: string;
  departmentId: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
  department?: Department;
}

export interface Department {
  id: string;
  name: string;
  subjects?: Subject[];
  _count?: {
    subjects: number;
    papers?: number;
  };
}

export interface Subject {
  id: string;
  code: string;
  name: string;
  semester: number;
  departmentId: string;
  department?: { id: string; name: string };
  _count?: { papers: number };
}

export interface QuestionPaper {
  id: string;
  title: string;
  subjectId: string;
  departmentId: string;
  semester: number;
  examYear: number;
  examMonth: ExamMonth;
  fileName: string;
  filePath: string;
  uploadedBy: string;
  createdAt: string;
  updatedAt?: string;
  subject?: Subject;
  department?: Department;
  uploader?: User;
  isBookmarked?: boolean;
  _count?: {
    downloads: number;
    bookmarks: number;
  };
}

export interface Bookmark {
  id: string;
  userId: string;
  paperId: string;
  paper?: QuestionPaper;
}

export interface Download {
  id: string;
  userId: string;
  paperId: string;
  downloadedAt: string;
  paper?: QuestionPaper;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface ApiError {
  message: string;
  statusCode: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface DashboardStats {
  totalStudents: number;
  pendingApprovals: number;
  approvedStudents: number;
  totalPapers: number;
  totalDownloads: number;
  totalSubjects: number;
  totalDepartments: number;
}

export interface DepartmentWithCount extends Department {
  _count: {
    users: number;
    subjects: number;
    papers: number;
  };
}

export interface SubjectWithCount extends Subject {
  _count: { papers: number };
}

export interface ChartData {
  papersByDepartment: { department: string; count: number }[];
  papersByMonth: { month: string; count: number }[];
  uploadsByDay: { date: string; count: number }[];
}

export interface ActivityLog {
  id: string;
  type: 'student_registration' | 'paper_upload' | 'download';
  message: string;
  timestamp: string;
}

export interface StudentDashboardData {
  totalPapers: number;
  totalBookmarks: number;
  totalDownloads: number;
  recentPapers: QuestionPaper[];
  recentDownloads: Download[];
  recentBookmarks: Bookmark[];
}

export interface PaperFilters {
  departmentId?: string;
  semester?: number;
  subjectId?: string;
  examYear?: number;
  examMonth?: ExamMonth;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export type SortOption = {
  value: string;
  label: string;
};

export const PAPER_SORT_OPTIONS: SortOption[] = [
  { value: 'createdAt', label: 'Date Added' },
  { value: 'title', label: 'Title' },
  { value: 'downloads', label: 'Downloads' },
  { value: 'examYear', label: 'Exam Year' },
  { value: 'semester', label: 'Semester' },
];
