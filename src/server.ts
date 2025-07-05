import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import connectDB from './config/database';
import connectRedis from './config/redis';
import logger from './utils/logger';
import { seedDatabase } from './seed';
import { env } from './config/env';
import { initSubscriber } from './redis/subscriber';
import { Server as IOServer } from 'socket.io';
import http from 'http';

const PORT = env.PORT || 3000;

const start = async () => {
  const { MONGODB_URI, REDIS_HOST, REDIS_PORT } = env;

  if (!MONGODB_URI) {
    logger.error('MONGODB_URI not set');
    process.exit(1);
  }

  if (!REDIS_HOST || !REDIS_PORT) {
    logger.error('REDIS_HOST or REDIS_PORT not set');
    process.exit(1);
  }

  if (!env.JWT_SECRET) {
    logger.error('JWT_SECRET not set');
  }

  await connectDB(MONGODB_URI);
  await connectRedis();

  // Seed database con datos de ejemplo solo en desarrollo o test
  if (env.NODE_ENV !== 'production') {
    await seedDatabase();
  }

  const httpServer = http.createServer(app);
  const io = new IOServer(httpServer, {
    cors: {
      origin: env.CORS_ORIGIN || '*'
    }
  });

  io.on('connection', (socket) => {
    logger.info(`🔌 Client connected ${socket.id}`);
  });

  await initSubscriber(io);

  httpServer.listen(PORT, () => {
    logger.info(`🚀 Server + Socket.IO running on port ${PORT}`);
  });
};

start(); 