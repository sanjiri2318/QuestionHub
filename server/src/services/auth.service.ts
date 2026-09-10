import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { prisma } from '../prisma';
import { config } from '../config';
import { AppError } from '../middleware';
import { JwtPayload } from '../types';
import { EmailService } from './email.service';

interface RegisterInput {
  name: string;
  registerNumber: string;
  email: string;
  password: string;
  departmentId: string;
}

interface LoginInput {
  email: string;
  password: string;
}

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export class AuthService {
  private static generateTokenPair(payload: JwtPayload): TokenPair {
    const accessToken = jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn as any,
    });

    const refreshToken = jwt.sign(
      { ...payload, type: 'refresh' },
      config.jwt.secret,
      { expiresIn: '30d' }
    );

    return { accessToken, refreshToken };
  }

  private static verifyRefreshToken(token: string): JwtPayload {
    try {
      const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload & { type?: string };
      if (decoded.type !== 'refresh') {
        throw new AppError('Invalid token type', 401);
      }
      return decoded;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Invalid or expired refresh token', 401);
    }
  }

  static async register(data: RegisterInput) {
    // Validate SRM email
    if (!data.email.endsWith('@srmist.edu.in')) {
      throw new AppError('Only @srmist.edu.in email addresses are allowed', 400);
    }

    // Check for existing email
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (existingUser) {
      throw new AppError('Email already registered', 400);
    }

    // Check for existing register number
    const existingRegisterNumber = await prisma.user.findUnique({
      where: { registerNumber: data.registerNumber },
    });

    if (existingRegisterNumber) {
      throw new AppError('Register number already exists', 400);
    }

    // Validate department exists
    const department = await prisma.department.findUnique({
      where: { id: data.departmentId },
    });

    if (!department) {
      throw new AppError('Invalid department', 400);
    }

    // Hash password with salt rounds of 12
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(data.password, salt);

    // Create user with PENDING status
    const user = await prisma.user.create({
      data: {
        name: data.name.trim(),
        registerNumber: data.registerNumber.trim(),
        email: data.email.toLowerCase().trim(),
        password: hashedPassword,
        departmentId: data.departmentId,
        role: 'STUDENT',
        status: 'PENDING',
      },
      select: {
        id: true,
        name: true,
        email: true,
        registerNumber: true,
        departmentId: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }

  static async login(data: LoginInput) {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase().trim() },
    });

    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(data.password, user.password);

    if (!isPasswordValid) {
      throw new AppError('Invalid email or password', 401);
    }

    // Check student approval status
    if (user.role === 'STUDENT' && user.status !== 'APPROVED') {
      const statusMessage = user.status === 'PENDING'
        ? 'Your account is pending approval. Please wait for admin approval.'
        : 'Your account has been rejected. Please contact administration.';
      throw new AppError(statusMessage, 403);
    }

    // Generate token pair
    const tokenPayload: JwtPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
    };

    const tokens = this.generateTokenPair(tokenPayload);

    return {
      ...tokens,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        registerNumber: user.registerNumber,
        departmentId: user.departmentId,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    };
  }

  static async refreshToken(refreshToken: string) {
    const decoded = this.verifyRefreshToken(refreshToken);

    // Verify user still exists and is active
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (user.role === 'STUDENT' && user.status !== 'APPROVED') {
      throw new AppError('Account not approved', 403);
    }

    // Generate new token pair
    const tokenPayload: JwtPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
    };

    const tokens = this.generateTokenPair(tokenPayload);

    return {
      ...tokens,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        registerNumber: user.registerNumber,
        departmentId: user.departmentId,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    };
  }

  static async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        registerNumber: true,
        departmentId: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        department: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return user;
  }

  static async updateProfile(userId: string, data: { name?: string; registerNumber?: string }) {
    // If updating register number, check for duplicates
    if (data.registerNumber) {
      const existingUser = await prisma.user.findFirst({
        where: {
          registerNumber: data.registerNumber,
          id: { not: userId },
        },
      });

      if (existingUser) {
        throw new AppError('Register number already exists', 400);
      }
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.name && { name: data.name.trim() }),
        ...(data.registerNumber && { registerNumber: data.registerNumber.trim() }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        registerNumber: true,
        departmentId: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }

  static async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      throw new AppError('Current password is incorrect', 400);
    }

    // Hash new password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return { message: 'Password changed successfully' };
  }

  static async forgotPassword(email: string) {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    // Always return success to prevent email enumeration
    const successMessage = 'If an account exists with this email, you will receive a password reset link.';

    if (!user) {
      return { message: successMessage };
    }

    // Generate reset token (valid for 1 hour)
    const resetToken = jwt.sign(
      { id: user.id, email: user.email, type: 'reset' },
      config.jwt.secret,
      { expiresIn: '1h' }
    );

    // Send the reset link via the email service.
    // In development the email service logs the link with token to the console so it can be tested.
    await EmailService.sendPasswordResetEmail(user.email, resetToken);

    return { message: successMessage };
  }

  static async resetPassword(token: string, newPassword: string) {
    try {
      const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload & { type?: string };

      if (decoded.type !== 'reset') {
        throw new AppError('Invalid token type', 400);
      }

      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
      });

      if (!user) {
        throw new AppError('User not found', 404);
      }

      // Hash new password
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      });

      return { message: 'Password reset successful' };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Invalid or expired reset token', 400);
    }
  }

  static async logout(userId: string, accessToken?: string) {
    // Blacklist the access token so it can't be used after logout
    if (accessToken) {
      try {
        const decoded = jwt.decode(accessToken) as any;
        const expiresAt = decoded?.exp ? new Date(decoded.exp * 1000) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        await prisma.tokenBlacklist.create({
          data: {
            token: accessToken,
            type: 'access',
            expiresAt,
          },
        });
      } catch {
        // If token decode fails, still proceed with logout
      }
    }
    return { message: 'Logged out successfully' };
  }
}
