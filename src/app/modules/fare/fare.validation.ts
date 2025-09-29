import {  z } from 'zod';

// Location validation schema
export const locationSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  address: z.string().optional()
});

// create a wrapper for body validation
// export const createBodySchema = (bodySchema: AnyZodObject) => { 
//   return z.object({ 
//     body: bodySchema
//   })
// }

// Fare estimation request validation schema
export const fareEstimationValidation = z.object({
   body: z.object({
  pickupLocation: locationSchema,
  dropoffLocation: locationSchema,
  vehicleType: z.enum(['standard', 'premium', 'luxury', 'bike']),
  rideType: z.enum(['instant', 'scheduled', 'shared']).optional(),
  surgeMultiplier: z.number().min(1).max(5).optional(),
  promoCode: z.string().optional() })
});

// Fare configuration update validation schema
export const fareConfigUpdateValidation = z.object({
  body: z.object({ 
  vehicleType: z.enum(['standard', 'premium', 'luxury', 'bike']),
  baseFare: z.number().min(0).optional(),
  perKmRate: z.number().min(0).optional(),
  perMinuteRate: z.number().min(0).optional(),
  minimumFare: z.number().min(0).optional(),
  surgeMultipliers: z.object({
    low: z.number().min(1).optional(),
    medium: z.number().min(1).optional(),
    high: z.number().min(1).optional()
  }).optional() 
})
})
// Types for TypeScript inference
export type FareEstimationInput = z.infer<typeof fareEstimationValidation>;
export type FareConfigUpdateInput = z.infer<typeof fareConfigUpdateValidation>;