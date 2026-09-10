import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authService } from '@services/auth.service';
import { useAuth } from '@contexts/AuthContext';
import type { User } from '@utils/types';

interface AuthApiResponse {
  success: boolean;
  message: string;
  data: {
    accessToken: string;
    refreshToken: string;
    user: User;
  };
}

interface RegisterApiResponse {
  success: boolean;
  message: string;
  data: User;
}

interface ProfileApiResponse {
  success: boolean;
  data: User;
}

interface MessageApiResponse {
  success: boolean;
  message: string;
}

export const useLogin = () => {
  const { login } = useAuth();

  return useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      await login(email, password);
    },
    onError: (error: Error) => {
      throw error;
    },
  });
};

export const useRegister = () => {
  return useMutation({
    mutationFn: async (data: {
      name: string;
      registerNumber: string;
      email: string;
      password: string;
      confirmPassword: string;
      departmentId: string;
    }) => {
      const response = await authService.register(data);
      return response;
    },
  });
};

export const useProfile = () => {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const user = await authService.getProfile();
      return user;
    },
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const { refreshUser } = useAuth();

  return useMutation({
    mutationFn: async (data: Partial<User>) => {
      const user = await authService.updateProfile(data);
      return user;
    },
    onSuccess: async () => {
      await refreshUser();
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: async (data: {
      currentPassword: string;
      newPassword: string;
      confirmNewPassword: string;
    }) => {
      const response = await authService.changePassword(data);
      return response;
    },
  });
};

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: async (email: string) => {
      const response = await authService.forgotPassword(email);
      return response;
    },
  });
};

export const useResetPassword = () => {
  return useMutation({
    mutationFn: async (data: {
      token: string;
      password: string;
      confirmPassword: string;
    }) => {
      const response = await authService.resetPassword(data);
      return response;
    },
  });
};

export const useLogout = () => {
  const { logout } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await logout();
      queryClient.clear();
    },
  });
};
