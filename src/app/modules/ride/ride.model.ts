// ride.model.ts
import { Schema, model } from "mongoose";
import { IRide } from "./ride.interface";

// Define the rejection history sub-schema
const rejectionHistorySchema = new Schema({
  driver: {
    type: Schema.Types.ObjectId,
    ref: 'User', // This is crucial for population
    required: true
  },
  reason: String,
  timestamp: {
    type: Date,
    default: Date.now
  }
});


const rideSchema = new Schema<IRide>({
  rider: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  driver: { type: Schema.Types.ObjectId, ref: 'User' },
  pickupLocation: {
    type: { type: String, default: 'Point' },
    coordinates: { type: [Number], required: true },
    address: { type: String, required: true }
  },
  destination: {
    type: { type: String, default: 'Point' },
    coordinates: { type: [Number], required: true },
    address: { type: String, required: true }
  },
  status: {
    type: String,
    enum: ['requested', 'accepted', 'driver_arrived', 'in_progress', 'completed', 'cancelled'],
    default: 'requested'
  },
  requestedAt: { type: Date, default: Date.now },
  acceptedAt: Date,
  pickupTime: Date,
  completedAt: Date,
  cancelledAt: Date,
  cancelledBy: { type: String, enum: ['rider', 'driver', 'system'] },
  cancellationReason: String,
  estimatedFare: { type: Number, required: true },
  actualFare: Number,
  distance: Number,
  duration: Number,
  paymentMethod: { 
    type: String, 
    enum: ['cash', 'card', 'mobile_money'],
    required: true
  },
  paymentStatus: { 
    type: String, 
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
  },
  transactionId: String,
  riderRating: { type: Number, min: 1, max: 5, required: false },
  driverRating: { type: Number, min: 1, max: 5, required: false },
  riderReview: { type: String, required: false },
  driverReview: { type: String, required: false },
  routePolyline: String,
  feedbackSubmittedAt: { type: Date },
  rejectionHistory: [rejectionHistorySchema] 
}, { timestamps: true, versionKey: false },
);

// Add geospatial index for pickupLocation
rideSchema.index({ 'pickupLocation.coordinates': '2dsphere' });

export const Ride = model<IRide>('Ride', rideSchema);