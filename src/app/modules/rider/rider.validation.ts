import { z } from "zod";

// Request Ride Validation

export const requestRideSchema = z.object({
  body: z.object({
    pickupLocation: z.object({
      address: z.string().min(5, "Address must be at least 5 characters"),
      coordinates: z.tuple([
        z.number().min(-180).max(180), // longitude
        z.number().min(-90).max(90)   // latitude
      ])
    }),
    destination: z.object({
      address: z.string().min(5, "Address must be at least 5 characters"),
      coordinates: z.tuple([
        z.number().min(-180).max(180),
        z.number().min(-90).max(90)
      ])
    }),
    paymentMethod: z.enum(['cash', 'card', 'mobile_money']),
    estimatedFare: z.number().positive()
  })
  
});


// Cancel Ride Validation
export const cancelRideSchema = z.object({
  params: z.object({
    rideId: z.string().min(1, "Ride ID is required")
  }),
  body: z.object({
    reason: z.string().min(5, "Reason must be at least 5 characters").optional()
  })
});

// Ride History Validation
export const rideHistorySchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).transform(Number).default('1'),
    limit: z.string().regex(/^\d+$/).transform(Number).default('10'),
    status: z.enum(['all', 'completed', 'cancelled']).optional()
  })
});

export type RequestRideInput = z.infer<typeof requestRideSchema>;
export type CancelRideInput = z.infer<typeof cancelRideSchema>;
export type RideHistoryInput = z.infer<typeof rideHistorySchema>;