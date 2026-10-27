import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { env } from './config/env.js';
import { notFoundHandler, errorHandler } from './middleware/errorMiddleware.js';
import healthRoutes from './routes/healthRoutes.js';
import authRoutes from './routes/authRoutes.js';
import propertyRoutes from './routes/propertyRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import favoriteRoutes from './routes/favoriteRoutes.js';
import enquiryRoutes from './routes/enquiryRoutes.js';
import visitRoutes from './routes/visitRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendDistPath = path.resolve(__dirname, '../frontend/dist');

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
  'http://localhost:8084',
  'http://127.0.0.1:8084',
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

// Authentication routes
app.use('/api/auth', authRoutes);

// Property routes
app.use('/api/properties', propertyRoutes);

// Admin routes
app.use('/api/admin', adminRoutes);

// Favorite routes
app.use('/api/favorites', favoriteRoutes);

// Enquiry routes
app.use('/api/enquiries', enquiryRoutes);

// Visit routes
app.use('/api/visits', visitRoutes);

// Placeholder for remaining routes (will be mounted in upcoming stages)
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'PropertyHub API v1.0.0'
  });
});

// Serve compiled frontend in production if dist directory exists
if (fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));

  app.get('*', (req, res, next) => {
    // Pass API requests, /health, or static assets that were not found to the error handler
    if (req.originalUrl.startsWith('/api') || req.originalUrl === '/health') {
      return next();
    }
    res.sendFile(path.join(frontendDistPath, 'index.html'));
  });
}

// 404 & Central Error Handlers
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
