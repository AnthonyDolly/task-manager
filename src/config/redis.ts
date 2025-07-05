// redis.ts
import { createClient, RedisClientType } from 'redis';
import logger from '../utils/logger';

const connectRedis = async (): Promise<RedisClientType> => {
  // Construir la URL de Redis basada en las variables de entorno
  const redisHost = process.env.REDIS_HOST || 'localhost';
  const redisPort = process.env.REDIS_PORT || '6379';
  const redisPassword = process.env.REDIS_PASSWORD || '';
  
  // Construir URL
  const redisUrl = redisPassword 
    ? `redis://:${redisPassword}@${redisHost}:${redisPort}`
    : `redis://${redisHost}:${redisPort}`;

  logger.info(`Attempting to connect to Redis at ${redisHost}:${redisPort}`);

  const client = createClient({ 
    url: redisUrl,
    socket: {
      connectTimeout: 10000,
      reconnectStrategy: (retries) => {
        if (retries > 3) {
          logger.error('Redis connection failed after 3 retries');
          return new Error('Redis connection failed');
        }
        return Math.min(retries * 50, 500);
      }
    }
  });

  client.on('error', (err) => {
    logger.error(`Redis Client Error: ${err.message}`);
  });

  client.on('connect', () => {
    logger.info('Redis client connected');
  });

  client.on('ready', () => {
    logger.info('✅ Redis connected and ready');
  });

  client.on('end', () => {
    logger.info('Redis connection ended');
  });

  try {
    await client.connect();
    return client as RedisClientType;
  } catch (error) {
    logger.error(`Failed to connect to Redis: ${error}`);
    throw error;
  }
};

export default connectRedis;