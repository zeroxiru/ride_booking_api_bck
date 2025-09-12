/* eslint-disable @typescript-eslint/no-explicit-any */
// ride.interface.ts
import { Types } from "mongoose";
import { IUser, Role } from "../user/user.interface";

export interface CancelRideParams  {
  rideId: string;
  userId: Types.ObjectId;
  userRole: Role;
  reason: CancellationReason;
};


export type RideStatus = 
  | 'requested'
  | 'accepted'
  | 'picked_up'
  | 'driver_arrived'
  | 'in_transit'
  | 'completed'
  | 'cancelled';

  export type CancellationReason = 
  | 'change_of_plans'
  | 'driver_delayed'
  | 'found_another_ride'
  | 'price_issue'
  | 'other';

export interface IRide {
  _id?: Types.ObjectId;
  rider: Types.ObjectId | IUser;
  driver?: Types.ObjectId | IUser;
  pickupLocation: {
    type: 'Point';
    coordinates: [number, number];
    address: string;
  };
  destination: {
    type: 'Point';
    coordinates: [number, number];
    address: string;
  };
  status: RideStatus;
  requestedAt: Date;
  acceptedAt?: Date;
  pickupTime?: Date;
  completedAt?: Date;
  cancelledAt?: Date;
  cancelledBy?: 'rider' | 'driver' | 'system';
  cancellationWindow?: number;
  cancellationReason?: {
    rider: CancellationReason[];
    driver: CancellationReason[];
  };
  maxCancellationAttempts?: number;
  cancellationHistory?: {
    userId: Types.ObjectId;
    reason: CancellationReason;
    timestamp: Date;
  }[];
  estimatedFare: number;
  actualFare?: number;
  distance?: number; // in kilometers
  duration?: number; // in minutes
  paymentMethod: 'cash' | 'card' | 'mobile_money';
  paymentStatus?: 'pending' | 'paid' | 'failed';
  transactionId?: string;
  riderRating?: number;
  driverRating?: number;
  riderReview?: string;
  driverReview?: string;
  routePolyline?: string;
  feedbackSubmittedAt?: Date;
  rejectionHistory: {
    driver: Types.ObjectId | any;
    reason?: string;
    timestamp: Date;
    _id?: Types.ObjectId;
  }[];
}