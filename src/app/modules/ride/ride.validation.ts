import { z } from "zod";

export const rideValidations = {
  cancelRideSchema: z.object({
    body: z.object({
      reason: z.string().min(3, "Cancellation reason is required")
    }),
    params: z.object({
      rideId: z.string().min(1, "Ride ID is required")
    })
  }),
    // Ride Feedback Validation Schema
  submitFeedbackSchema: z.object({
    body: z.object({
      
      target: z.enum(['driver', 'rider'], {
        required_error: "Target is required",
        invalid_type_error: "Target must be either 'driver' or 'rider'"
      }),
      
      rating: z.number({
        required_error: "Rating is required",
        invalid_type_error: "Rating must be a number"
      }).min(1, "Rating must be at least 1")
        .max(5, "Rating cannot exceed 5"),
      
      review: z.string().max(500, "Review cannot exceed 500 characters").optional().or(z.literal(''))
    }),
    params: z.object({
      rideId: z.string().min(1, "Ride ID is required")
    })
  }),
    // ... existing validations
  rideIdSchema: z.object({
    params: z.object({
      rideId: z.string()
    })
  })

  

};