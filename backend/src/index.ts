import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import { logger } from './utils/logger';
import { connectRedis } from './config/redis';
import { startWorkers } from './workers';

const PORT = process.env.PORT || 3001;

async function startServer() {
  try {
    // Connect to Redis
    await connectRedis();
    logger.info('✅ Redis connected');

    // Start background workers
    await startWorkers();
    logger.info('✅ Background workers started');

    // Start Express server
    app.listen(PORT, () => {
      logger.info(`🚀 SocialMuse API Server running on port ${PORT}`);
      logger.info(`📝 Environment: ${process.env.NODE_ENV}`);
      logger.info(`🔗 API URL: ${process.env.API_URL}`);
    });
  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (error) => {
  logger.error('Unhandled Rejection:', error);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

startServer();
