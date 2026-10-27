import app from './app.js';
import { connectDB } from './config/db.js';
import { env } from './config/env.js';

const port = process.env.PORT || 8084;

const startServer = async () => {
  try {
    await connectDB();
    const server = app.listen(port, '0.0.0.0', () => {
      console.log(`[PropertyHub Server] Running on http://0.0.0.0:${port} in ${env.NODE_ENV} mode`);
    });

    // Graceful shutdown handling
    const shutdown = async (signal) => {
      console.log(`[PropertyHub Server] Received ${signal}. Shutting down gracefully...`);
      server.close(() => {
        console.log('[PropertyHub Server] HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    console.error(`[PropertyHub Server Error] Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

startServer();
