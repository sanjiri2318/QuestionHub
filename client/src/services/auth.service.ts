import api from './api';
import type { AuthResponse, User } from '@utils/types';

interface LoginData {
  email: string;
  password: string;
}

interface RegisterData {
  name: string;
  registerNumber: string;
  email: string;
  password: string;
  confirmPassword: string;
  departmentId: string;
}

interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export const authService = {
  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await api.post<{ data: AuthResponse }>('/auth/login', data);
    return response.data.data;
  },

  register: async (data: RegisterData): Promise<{ message: string; data: User }> => {
    const response = await api.post<{ message: string; data: User }>('/auth/register', data);
    return response.data;
  },

  refreshToken: async (refreshToken: string): Promise<RefreshTokenResponse> => {
    const response = await api.post<{ data: RefreshTokenResponse }>('/auth/refresh-token', {
      refreshToken,
    });
    return response.data.data;
  },

  getProfile: async (): Promise<User> => {
    const response = await api.get<{ data: User }>('/auth/profile');
    return response.data.data;
  },

  updateProfile: async (data: Partial<User>): Promise<User> => {
    const response = await api.put<{ data: User }>('/auth/profile', data);
    return response.data.data;
  },

  changePassword: async (data: {
    currentPassword: string;
    newPassword: string;
    confirmNewPassword: string;
  }): Promise<{ message: string }> => {
    const response = await api.put<{ message: string }>('/auth/change-password', data);
    return response.data;
  },

  forgotPassword: async (email: string): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>('/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (data: {
    token: string;
    password: string;
    confirmPassword: string;
  }): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>('/auth/reset-password', data);
    return response.data;
  },

  logout: async (): Promise<void> => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignore logout errors — server may already be unreachable
    }
  },
};
