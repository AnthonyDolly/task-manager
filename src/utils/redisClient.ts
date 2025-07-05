import { createClient, RedisClientType } from 'redis';
import logger from './logger';

let client: RedisClientType | null = null;

export const getRedisClient = async (): Promise<RedisClientType> => {
  if (client && client.isOpen) return client;

  const host = process.env.REDIS_HOST || 'localhost';
  const port = process.env.REDIS_PORT || '6379';
  const password = process.env.REDIS_PASSWORD || '';
  const url = password ? `redis://:${password}@${host}:${port}` : `redis://${host}:${port}`;

  client = createClient({ url });
  client.on('error', (err) => logger.error(`Redis error: ${err}`));
  await client.connect();
  logger.info('Redis client ready (singleton)');
  return client;
};

export const createSubscriberClient = async (): Promise<RedisClientType<any, any, any>> => {
  const host = process.env.REDIS_HOST || 'localhost';
  const port = process.env.REDIS_PORT || '6379';
  const password = process.env.REDIS_PASSWORD || '';
  const url = password ? `redis://:${password}@${host}:${port}` : `redis://${host}:${port}`;

  const subscriber = createClient({ url });
  subscriber.on('error', (err) => logger.error(`Redis subscriber error: ${err}`));
  await subscriber.connect();
  logger.info('Redis subscriber client ready');
  return subscriber;
}; 