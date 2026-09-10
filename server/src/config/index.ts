import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL!,
  jwt: {
    secret: process.env.JWT_SECRET || 'default-secret-change-me',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  upload: {
    dir: process.env.UPLOAD_DIR || 'uploads',
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10),
  },
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  },
};

if (config.nodeEnv === 'production') {
  const required: string[] = [];
  if (!process.env.DATABASE_URL) required.push('DATABASE_URL');
  if (!process.env.JWT_SECRET || config.jwt.secret === 'default-secret-change-me') {
    required.push('JWT_SECRET (must be a secure random string)');
  }
  if (!process.env.CORS_ORIGIN) required.push('CORS_ORIGIN');
  if (required.length > 0) {
    throw new Error(
      `Missing or invalid required environment variables for production:\n  - ${required.join('\n  - ')}`
    );
  }
}
