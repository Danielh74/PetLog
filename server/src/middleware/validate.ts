import type { Request, Response, NextFunction } from 'express';
import type { z } from 'zod';

const validate = (schema: z.ZodTypeAny) => (req: Request, res: Response, next: NextFunction): void => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: result.error.flatten().fieldErrors,
    });
    return;
  }
  req.body = result.data;
  next();
};

export default validate;
