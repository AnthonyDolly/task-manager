import { Request, Response, NextFunction } from 'express';
import { getRedisClient } from '../utils/redisClient';

export const checkBlacklist = async (req: Request, res: Response, next: NextFunction) => {
  const jti = (req as any).tokenId as string | undefined;
  if (!jti) return next();
  const client = await getRedisClient();
  const exists = await client.exists(`blacklist:${jti}`);
  if (exists) return res.status(401).json({ message: 'Token revoked' });
  return next();
};

export const addToBlacklist = async (jti: string, expSeconds: number) => {
  const client = await getRedisClient();
  await client.set(`blacklist:${jti}`, '1', { EX: expSeconds });
}; 