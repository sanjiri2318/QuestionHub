import { config } from '../config';

interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export class EmailService {
  static async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    const resetUrl = `${config.frontendUrl}/reset-password?token=${token}`;
    await EmailService.send({
      to: email,
      subject: 'QuestionHub - Password Reset Request',
      text: `You requested a password reset. Click the link to reset your password: ${resetUrl}`,
      html: `<p>You requested a password reset.</p><p>Click <a href="${resetUrl}">here</a> to reset your password.</p>`,
    });
  }

  static async sendRegistrationApprovedEmail(email: string, name: string): Promise<void> {
    await EmailService.send({
      to: email,
      subject: 'QuestionHub - Registration Approved',
      text: `Hello ${name},\n\nYour registration has been approved. You can now log in to QuestionHub.`,
      html: `<p>Hello ${name},</p><p>Your registration has been approved. You can now <a href="${config.frontendUrl}/login">log in</a> to QuestionHub.</p>`,
    });
  }

  static async sendRegistrationRejectedEmail(email: string, name: string): Promise<void> {
    await EmailService.send({
      to: email,
      subject: 'QuestionHub - Registration Rejected',
      text: `Hello ${name},\n\nYour registration has been rejected. Please contact the administration for more information.`,
      html: `<p>Hello ${name},</p><p>Your registration has been rejected. Please contact the administration for more information.</p>`,
    });
  }

  private static async send(options: EmailOptions): Promise<void> {
    // SMTP configuration would go here in production
    // Example: nodemailer transport or SendGrid API
    // For development, log to console
    if (config.nodeEnv === 'development') {
      console.log(`[EmailService] To: ${options.to}, Subject: ${options.subject}`);
      if (config.nodeEnv === 'development') {
        console.log(`[EmailService] Body: ${options.html || options.text}`);
      }
    }
  }
}
