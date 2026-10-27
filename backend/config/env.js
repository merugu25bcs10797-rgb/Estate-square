import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from backend folder or root
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config(); // fallback to cwd

const isProd = process.env.NODE_ENV === 'production';

// Strict validation for production, and core validation for dev
const requiredEnvVars = isProd
  ? [
      'dbURL',
      'JWT_SECRET',
      'CLIENT_URL',
      'CLOUDINARY_CLOUD_NAME',
      'CLOUDINARY_API_KEY',
      'CLOUDINARY_API_SECRET',
      'ADMIN_EMAIL',
      'ADMIN_PASSWORD'
    ]
  : ['JWT_SECRET'];

const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);

if (missingVars.length > 0) {
  console.error(
    `[Startup Error] Missing required environment variable(s): ${missingVars.join(
      ', '
    )}. Please set them in your environment or .env file.`
  );
  if (isProd || process.env.NODE_ENV !== 'test') {
    process.exit(1);
  }
}

export const env = {
  PORT: parseInt(process.env.PORT || '8084', 10),
  dbURL: process.env.dbURL || 'mongodb://127.0.0.1:27017/propertyhub',
  JWT_SECRET: process.env.JWT_SECRET || 'dev_jwt_secret_propertyhub_key_min32chars',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  NODE_ENV: process.env.NODE_ENV || 'development',
  isProd,
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || '',
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || '',
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || '',
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'admin@propertyhub.com',
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'Admin@123456'
};
