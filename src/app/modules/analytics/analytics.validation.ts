import { z } from 'zod';

// Date validation schema
const dateSchema = z.string().refine((val) => {
  return !isNaN(Date.parse(val));
}, {
  message: 'Invalid date format'
}).optional();

// Analytics time range validation schema
export const analyticsTimeRangeValidation = z.object({
  startDate: dateSchema,
  endDate: dateSchema,
  period: z.enum(['day', 'week', 'month', 'year']).optional()
});

// Ride stats validation schema
export const rideStatsValidation = z.object({
  startDate: dateSchema,
  endDate: dateSchema
});

// Types for TypeScript inference
export type AnalyticsTimeRangeInput = z.infer<typeof analyticsTimeRangeValidation>;
export type RideStatsInput = z.infer<typeof rideStatsValidation>;