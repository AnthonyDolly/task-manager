import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

interface ApiErrorShape {
  status: number;
  message: string;
  details?: unknown;
  requestId?: string;
}

export class ApiError extends Error {
  status: number;
  details?: unknown;
  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export const errorHandler = (err: Error, req: Request, res: Response, _next: NextFunction) => {
  const statusCode = err instanceof ApiError ? err.status : 500;
  const payload: ApiErrorShape = {
    status: statusCode,
    message: err.message,
    requestId: (req as any).requestId
  };
  if (err instanceof ApiError && err.details) payload.details = err.details;

  logger.error(err.stack || err.message);
  res.status(statusCode).json(payload);
}; 