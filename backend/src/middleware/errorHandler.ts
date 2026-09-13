import { NextFunction, Request, Response } from 'express';
import { AppError } from '../utils/AppError';
import { sendError } from '../utils/apiResponse';
import { logger } from '../utils/logger';
import { env } from '../config/env';

export function notFoundHandler(_req: Request, _res: Response, next: NextFunction): void {
  next(new AppError('Route not found', 404, 'NOT_FOUND'));
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof AppError) {
    sendError(res, err.message, err.statusCode, {
      errorCode: err.errorCode,
      errors: err.errors,
    });
    return;
  }

  logger.error({ err }, 'Unhandled error');
  const message = env.nodeEnv === 'production' ? 'Internal server error' : (err as Error).message;
  sendError(res, message, 500, { errorCode: 'INTERNAL_ERROR' });
}
