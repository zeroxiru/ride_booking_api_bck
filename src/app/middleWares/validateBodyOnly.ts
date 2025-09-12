import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';

export const validateBodyOnly = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log('🔐 [validateBodyOnly] Validating request body...');
      console.log('📦 [validateBodyOnly] Original body:', JSON.stringify(req.body, null, 2));
      
      const validatedBody = await schema.parseAsync(req.body);
      req.body = validatedBody;
      
      console.log('✅ [validateBodyOnly] Validation passed');
      console.log('📦 [validateBodyOnly] Validated body:', JSON.stringify(req.body, null, 2));
      next();
      
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.errors.map(e => ({
            path: e.path.join('.'),
            message: e.message,
          })),
        });
      }
      next(error);
    }
  };
};