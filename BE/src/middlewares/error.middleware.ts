import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../utils/appError';

const mapError = (error: unknown): { statusCode: number; code: string; message: string; details?: unknown } => {
  if (error instanceof AppError) {
    return {
      statusCode: error.statusCode,
      code: error.code,
      message: error.message,
      details: error.details,
    };
  }

  if (error instanceof ZodError) {
    return {
      statusCode: 400,
      code: 'VALIDATION_ERROR',
      message: 'Request validation failed',
      details: error.flatten(),
    };
  }

  if (typeof error === 'object' && error && 'code' in error && (error as { code: number }).code === 11000) {
    return {
      statusCode: 409,
      code: 'DUPLICATE_RESOURCE',
      message: 'Resource already exists',
    };
  }

  return {
    statusCode: 500,
    code: 'INTERNAL_SERVER_ERROR',
    message: 'Something went wrong',
  };
};

export const errorHandler = (error: unknown, _req: Request, res: Response, _next: NextFunction): void => {
  if (!(error instanceof AppError) && !(error instanceof ZodError)) {
    console.error('Unhandled error:', error);
  }

  const mapped = mapError(error);

  res.status(mapped.statusCode).json({
    success: false,
    error: {
      code: mapped.code,
      message: mapped.message,
      details: mapped.details,
    },
  });
};
