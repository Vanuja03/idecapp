import { NextFunction, Request, Response } from 'express';
import { ZodSchema } from 'zod';
import { AppError } from '../utils/AppError';

function flattenZod(error: { flatten: () => { fieldErrors: Record<string, string[] | undefined>; formErrors: string[] } }) {
  const flattened = error.flatten();
  const errors: Record<string, string> = {};
  for (const [key, messages] of Object.entries(flattened.fieldErrors)) {
    if (messages?.[0]) errors[key] = messages[0];
  }
  if (flattened.formErrors[0] && !errors._form) {
    errors._form = flattened.formErrors[0];
  }
  return errors;
}

export function validate(schema: ZodSchema, source: 'body' | 'query' | 'params' = 'body') {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      throw new AppError('Validation failed', 400, 'VALIDATION_ERROR', flattenZod(result.error));
    }
    req[source] = result.data;
    next();
  };
}
