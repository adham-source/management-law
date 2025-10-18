
import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';

const validate = (schema: z.Schema) => (req: Request, res: Response, next: NextFunction) => {
  try {
    schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    next();
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: error.issues, // Use .issues instead of .errors
      });
    }
    next(error);
  }
};

export default validate;
