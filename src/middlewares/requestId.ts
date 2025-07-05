import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import logger from '../utils/logger';

export const requestIdMiddleware = (req: Request, _res: Response, next: NextFunction) => {
  const id = uuidv4();
  (req as any).requestId = id;
  // attach to logger default meta using a symbol
  (logger.defaultMeta as any) = { ...(logger.defaultMeta || {}), requestId: id };
  next();
}; 