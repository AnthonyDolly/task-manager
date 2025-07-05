import logger from './logger';
import { getRedisClient } from './redisClient';

export const publishEvent = async (prefix: string, event: string, data: unknown) => {
  try {
    const cli = await getRedisClient();
    await cli.publish(`${prefix}:${event}`, JSON.stringify(data));
  } catch (err) {
    logger.error(`Failed to publish to Redis: ${err}`);
  }
};

export const publishTaskEvent = async (event: string, data: unknown) => publishEvent('task', event, data);
export const publishProjectEvent = async (event: string, data: unknown) => publishEvent('project', event, data); 