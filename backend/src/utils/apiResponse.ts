import { Response } from 'express';

export function sendSuccess<T>(
  res: Response,
  data: T,
  message = 'OK',
  statusCode = 200,
): Response {
  return res.status(statusCode).json({
    success: true,
    data,
    message,
  });
}

export function sendError(
  res: Response,
  message: string,
  statusCode = 400,
  extras?: { errorCode?: string; errors?: Record<string, string> },
): Response {
  return res.status(statusCode).json({
    success: false,
    message,
    ...(extras?.errorCode ? { errorCode: extras.errorCode } : {}),
    ...(extras?.errors ? { errors: extras.errors } : {}),
  });
}
