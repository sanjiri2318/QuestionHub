import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Box, CircularProgress } from '@mui/material';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';

import { AuthLayout, StudentLayout, AdminLayout, RootLayout } from './layouts';
import ProtectedRoute from './components/common/ProtectedRoute';
import PublicRoute from './components/common/PublicRoute';

const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const AdminLoginPage = lazy(() => import('./pages/auth/AdminLoginPage'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/auth/ResetPasswordPage'));
const StudentDashboard = lazy(() => import('./pages/student/StudentDashboard'));
const BrowsePapers = lazy(() => import('./pages/student/BrowsePapers'));
const BookmarksPage = lazy(() => import('./pages/student/BookmarksPage'));
const DownloadsPage = lazy(() => import('./pages/student/DownloadsPage'));
const ProfilePage = lazy(() => import('./pages/student/ProfilePage'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const ManageStudents = lazy(() => import('./pages/admin/ManageStudents'));
const ManageDepartments = lazy(() => import('./pages/admin/ManageDepartments'));
const ManageSubjects = lazy(() => import('./pages/admin/ManageSubjects'));
const UploadPapers = lazy(() => import('./pages/admin/UploadPapers'));
const ManagePapers = lazy(() => import('./pages/admin/ManagePapers'));
const AdminProfile = lazy(() => import('./pages/admin/AdminProfile'));
const AuditLogsPage = lazy(() => import('./pages/admin/AuditLogsPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const UnauthorizedPage = lazy(() => import('./pages/UnauthorizedPage'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const PageLoader = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
    <CircularProgress />
  </Box>
);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <NotificationProvider>
            <Router>
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route element={<RootLayout />}>
                    <Route element={<PublicRoute />}>
                      <Route element={<AuthLayout />}>
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />
                        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                        <Route path="/reset-password" element={<ResetPasswordPage />} />
                      </Route>
                    </Route>

                    <Route
                      element={
                        <ProtectedRoute allowedRoles={['STUDENT']} requireApproval={true} />
                      }
                    >
                      <Route element={<StudentLayout />}>
                        <Route path="/dashboard" element={<StudentDashboard />} />
                        <Route path="/papers" element={<BrowsePapers />} />
                        <Route path="/bookmarks" element={<BookmarksPage />} />
                        <Route path="/downloads" element={<DownloadsPage />} />
                        <Route path="/profile" element={<ProfilePage />} />
                      </Route>
                    </Route>

                    <Route
                      element={
                        <ProtectedRoute allowedRoles={['ADMIN']} requireApproval={false} loginPath="/admin/login" />
                      }
                    >
                      <Route element={<AdminLayout />}>
                        <Route path="/admin/dashboard" element={<AdminDashboard />} />
                        <Route path="/admin/students" element={<ManageStudents />} />
                        <Route path="/admin/departments" element={<ManageDepartments />} />
                        <Route path="/admin/subjects" element={<ManageSubjects />} />
                        <Route path="/admin/papers/upload" element={<UploadPapers />} />
                        <Route path="/admin/papers" element={<ManagePapers />} />
                        <Route path="/admin/audit-logs" element={<AuditLogsPage />} />
                        <Route path="/admin/profile" element={<AdminProfile />} />
                      </Route>
                    </Route>

                    <Route element={<PublicRoute />}>
                      <Route path="/admin/login" element={<AdminLoginPage />} />
                    </Route>

                    <Route path="/" element={<Navigate to="/login" replace />} />
                    <Route path="/unauthorized" element={<UnauthorizedPage />} />
                    <Route path="*" element={<NotFoundPage />} />
                  </Route>
                </Routes>
              </Suspense>
            </Router>
          </NotificationProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
