import { z } from 'zod';

// Auth validators
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email format'),
  password: z
    .string()
    .min(1, 'Password is required'),
});

export const registerSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces'),
  registerNumber: z
    .string()
    .min(1, 'Register number is required')
    .regex(
      /^(RA|AP)\d{10,13}$/,
      'Register number must start with RA or AP followed by 10-13 digits (e.g., RA2311003010001)'
    ),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email format')
    .regex(/@srmist\.edu\.in$/, 'Only @srmist.edu.in emails are allowed'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
  departmentId: z
    .string()
    .min(1, 'Department is required'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email format')
    .regex(/@srmist\.edu\.in$/, 'Only @srmist.edu.in emails are allowed'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const updateProfileSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces')
    .optional(),
  registerNumber: z
    .string()
    .regex(
      /^(RA|AP)\d{10,13}$/,
      'Register number must start with RA or AP followed by 10-13 digits'
    )
    .optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z
    .string()
    .min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(1, 'New password is required')
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  confirmNewPassword: z.string().min(1, 'Please confirm your new password'),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: 'Passwords do not match',
  path: ['confirmNewPassword'],
}).refine((data) => data.currentPassword !== data.newPassword, {
  message: 'New password must be different from current password',
  path: ['newPassword'],
});

// Department validators
export const departmentSchema = z.object({
  name: z
    .string()
    .min(1, 'Department name is required')
    .max(100, 'Department name must be less than 100 characters'),
});

// Subject validators
export const subjectSchema = z.object({
  code: z
    .string()
    .min(1, 'Subject code is required')
    .max(20, 'Subject code must be less than 20 characters'),
  name: z
    .string()
    .min(1, 'Subject name is required')
    .max(200, 'Subject name must be less than 200 characters'),
  semester: z
    .number()
    .min(1, 'Semester is required')
    .max(8, 'Invalid semester'),
  departmentId: z
    .string()
    .min(1, 'Department is required'),
});

// Paper validators
export const paperSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters'),
  subjectId: z
    .string()
    .min(1, 'Subject is required'),
  departmentId: z
    .string()
    .min(1, 'Department is required'),
  semester: z
    .number()
    .min(1, 'Semester is required')
    .max(8, 'Invalid semester'),
  examYear: z
    .number()
    .min(2000, 'Invalid year')
    .max(new Date().getFullYear() + 1, 'Invalid year'),
  examMonth: z
    .enum(['JANUARY', 'MAY', 'AUGUST', 'NOVEMBER'], 'Exam month is required'),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type DepartmentInput = z.infer<typeof departmentSchema>;
export type SubjectInput = z.infer<typeof subjectSchema>;
export type PaperInput = z.infer<typeof paperSchema>;
