import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { env } from './config/env.js';
import { notFoundHandler, errorHandler } from './middleware/errorMiddleware.js';
import healthRoutes from './routes/healthRoutes.js';

const app = express();

// Production proxy trust for Render / Vercel
app.set('trust proxy', 1);

// Security headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }
  })
);

// CORS configuration: explicit origins only, credentials enabled
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  env.CLIENT_URL
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

// Standard body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Base health route directly on root and /api
app.use(healthRoutes);
app.use('/api', healthRoutes);

// Placeholder for remaining routes (will be mounted in upcoming stages)
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'PropertyHub API v1.0.0'
  });
});

// 404 & Central Error Handlers
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
