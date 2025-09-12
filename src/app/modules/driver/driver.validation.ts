import { z } from "zod";

export const driverValidations = {
  rideActionSchema: z.object({
    params: z.object({
      rideId: z.string().min(1, "Ride ID is required")
    }),
    body: z.object({
      reason: z.string().optional() // For rejection reason
    })
  }),
  availabilitySchema: z.object({
    body: z.object({
      isOnline: z.boolean(),
      currentLocation: z.object({
        coordinates: z.tuple([z.number(), z.number()]),
        address: z.string().optional()
      }).optional()
    })
  }),

   rideStatusSchema: z.object({
    params: z.object({
      rideId: z.string()
    }),
    body: z.object({
      status: z.enum(['accepted', 'driver_arrived', 'picked_up','in_transit', 'completed', 'cancelled'])
    
    })
  }),

    
  earningsQuerySchema: z.object({
    query: z.object({
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      page: z.string().optional(),
      limit: z.string().optional()
    })
  }),
    updateProfileSchema: z.object({
    body: z.object({
      vehicle: z.object({
        make: z.string().optional(),
        model: z.string().optional(),
        year: z.number().optional(),
        color: z.string().optional(),
        licensePlate: z.string().optional()
      }).optional(),
      licenseNumber: z.string().optional(),
      insuranceProvider: z.string().optional(),
      insuranceValidUntil: z.string().optional(),
      documents: z.object({
        license: z.string().url().optional(),
        insurance: z.string().url().optional(),
        vehicleRegistration: z.string().url().optional()
      }).optional()
    })
  }),

  // ... existing validations
  rejectionHistorySchema: z.object({
    query: z.object({
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      page: z.string().optional(),
      limit: z.string().optional()
    })
  })

};