import { createSubscriberClient } from '../utils/redisClient';
import logger from '../utils/logger';
import { Server as IOServer } from 'socket.io';

export const initSubscriber = async (io?: IOServer) => {
  const client = await createSubscriberClient();

  const forward = (channel: string, msg: string) => {
    logger.info(`Redis event ${channel} ${msg}`);
    if (io) {
      try {
        io.emit(channel, JSON.parse(msg));
      } catch {
        io.emit(channel, msg); // fallback plain string
      }
    }
  };

  const channels = [
    'task:created',
    'task:updated',
    'task:deleted',
    'project:created',
    'project:updated',
    'project:deleted'
  ];

  await Promise.all(channels.map((c) => client.subscribe(c, (msg) => forward(c, msg))));
  logger.info('Redis subscriber listening and forwarding events via Socket.IO');
}; 