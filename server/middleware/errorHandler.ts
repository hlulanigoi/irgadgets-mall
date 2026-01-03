import type { Request, Response, NextFunction } from 'express';
import { logger, logError } from '../lib/logger';

export interface AppError extends Error {
  status?: number;
  statusCode?: number;
  isOperational?: boolean;
}

/**
 * Custom error class for operational errors
 */
export class OperationalError extends Error implements AppError {
  status: number;
  isOperational: boolean;

  constructor(message: string, status: number = 500) {
    super(message);
    this.status = status;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Global error handler middleware
 */
export function errorHandler(
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  // Log error details
  logError(err, {
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });

  // Don't expose internal error details in production
  const responseMessage = process.env.NODE_ENV === 'production' && status === 500
    ? 'Internal Server Error'
    : message;

  res.status(status).json({
    status: 'error',
    message: responseMessage,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
}

/**
 * 404 handler
 */
export function notFoundHandler(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const error = new OperationalError(`Route ${req.url} not found`, 404);
  next(error);
}

/**
 * Async error wrapper
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
