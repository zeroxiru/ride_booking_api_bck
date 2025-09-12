import { z } from "zod";

export const adminValidations = {
  userActionSchema: z.object({
    params: z.object({
      userId: z.string()
    }),
    body: z.object({
      reason: z.string().optional()
    })
  }),
  
  driverActionSchema: z.object({
    params: z.object({
      driverId: z.string()
    }),
    body: z.object({
      reason: z.string().optional()
    })
  }),
  
  rideIdSchema: z.object({
    params: z.object({
      rideId: z.string()
    })
  }),
  
  reportSchema: z.object({
    query: z.object({
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      type: z.enum(['daily', 'weekly', 'monthly']).optional().default('daily')
    })
  })
};