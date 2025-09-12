// src/middlewares/validateRequest.ts
import { NextFunction, Request, Response } from 'express';
import { AnyZodObject, ZodError } from 'zod';

// Change this from default export to named export
export const validateRequest = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    console.log('🔐 [validateRequest] Validating request...');
    console.log('📦 [validateRequest] Original request body:', JSON.stringify(req.body, null, 2));
    
    try {
      // Check if this is a body-only schema (like fare validation)
      // Look for common fare-related fields to detect the schema type
      const hasFareFields = schema.shape.pickupLocation !== undefined || 
                           schema.shape.vehicleType !== undefined;
      
      if (hasFareFields) {
        // This is a fare schema - validate the body directly
        console.log('💰 [validateRequest] Detected fare schema - validating body directly');
        const validatedBody = await schema.parseAsync(req.body);
        req.body = validatedBody;
      } else {
        // This is a different schema that might expect body/query/params structure
        console.log('📦 [validateRequest] Schema expects body/query/params structure');
        const result = await schema.parseAsync({
          body: req.body,
          query: req.query,
          params: req.params,
        });
        
        // Only assign body (query and params are read-only)
        if (result.body) {
          req.body = result.body;
        }
      }
      
      console.log('✅ [validateRequest] Validation passed');
      console.log('📦 [validateRequest] Validated body:', JSON.stringify(req.body, null, 2));
      next();
      
    } catch (error) {
      console.error('❌ [validateRequest] Validation failed:', error);
      
      if (error instanceof ZodError) {
        const errorDetails = error.errors.map(e => ({
          path: e.path.join('.'),
          message: e.message,
        }));
        
        console.error('📝 [validateRequest] Validation errors:', JSON.stringify(errorDetails, null, 2));
        
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: errorDetails,
        });
      }
      
      console.error('💥 [validateRequest] Unexpected validation error:', error);
      next(error);
    }
  };
};