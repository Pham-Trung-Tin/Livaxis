import type { NextFunction, Request, Response } from 'express';
import type { ZodSchema } from 'zod';

export const validateRequest = (schema: ZodSchema) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse({
      body: req.body,
      params: req.params,
      query: req.query,
    });

    if (!result.success) {
      next(result.error);
      return;
    }

    if (result.data.body) {
      req.body = result.data.body;
    }

    next();
  };
};