/* eslint-disable @typescript-eslint/no-explicit-any */
import { Types } from "mongoose";
import {
  IRide,
  RideStatus,
  CancellationReason,
  CancelRideParams,
} from "./ride.interface";
import { Ride } from "./ride.model";
import { RideConstants } from "./ride.constants";
import AppError from "../../errorHelpers/AppError";
import { Role } from "../user/user.interface";
import httpStatus from "http-status-codes";
import { DriverProfile } from "../driver/driver.model";

export const RideServices = {
  async cancelRide(params: CancelRideParams): Promise<IRide> {
    const { rideId, userId, userRole, reason } = params;

    const ride = await Ride.findById(rideId).populate("rider driver").lean();

    if (!ride) {
      throw new AppError(httpStatus.NOT_FOUND, "Ride not found");
    }

    // Validate user authorization
    this.validateCancellationAuthorization(ride, userId, userRole);

    // Check ride status validity
    this.validateRideStatus(ride.status);

    // Check cancellation window
    this.validateCancellationWindow(ride, userRole);

    // Validate cancellation reason
    this.validateCancellationReason(reason, userRole);

    // Check cancellation attempts
    await this.checkCancellationAttempts(userId);

    // Process cancellation
    return this.processCancellation(rideId, userId, userRole, reason);
  },

  validateCancellationAuthorization(
    ride: IRide,
    userId: Types.ObjectId,
    userRole: Role
  ) {
    const riderId =
      ride.rider instanceof Types.ObjectId ? ride.rider : ride.rider?._id;
    const driverId =
      ride.driver instanceof Types.ObjectId ? ride.driver : ride.driver?._id;

    const isRider = riderId?.equals(userId);
    const isDriver = driverId?.equals(userId);

    if (!isRider && !isDriver && userRole !== Role.ADMIN && userRole !== Role.SUPER_ADMIN) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        "Not authorized to cancel this ride"
      );
    }
  },

  validateRideStatus(status: RideStatus) {
    const nonCancellableStatuses: RideStatus[] = ["completed", "cancelled"];
    if (nonCancellableStatuses.includes(status)) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        `Cannot cancel a ${status} ride`
      );
    }
  },
validateCancellationWindow(ride: IRide, userRole: Role) {
    const now = new Date();
    const timeElapsed =
      (now.getTime() - ride.requestedAt.getTime()) / (1000 * 60);

    if (userRole === Role.RIDER && ride.status !== "requested") {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Rider can only cancel before driver acceptance"
      );
    }

    if (userRole === Role.DRIVER) {
      if (ride.status === "requested") {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          "Driver cannot cancel unaccepted ride"
        );
      }
      if (
        timeElapsed > RideConstants.CANCELLATION_WINDOWS.DRIVER_POST_ACCEPTANCE
      ) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          `Driver cancellation window (${RideConstants.CANCELLATION_WINDOWS.DRIVER_POST_ACCEPTANCE} mins) has passed`
        );
      }
    }
  },


  validateCancellationReason(reason: CancellationReason, userRole: Role) {
    const validReasons =
      RideConstants.CANCELLATION_REASONS[
        userRole === Role.RIDER ? "RIDER" : "DRIVER"
      ];

    if (!validReasons.includes(reason)) {
      throw new AppError(httpStatus.BAD_REQUEST, "Invalid cancellation reason");
    }
},

  async checkCancellationAttempts(userId: Types.ObjectId) {
    const recentCancellations = await Ride.countDocuments({
      $or: [
        { rider: userId, cancelledBy: "rider" },
        { driver: userId, cancelledBy: "driver" },
      ],
      cancelledAt: { $gt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }, // Last 30 days
    });

    if (recentCancellations >= RideConstants.MAX_CANCELLATION_ATTEMPTS) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        `Exceeded maximum cancellation attempts (${RideConstants.MAX_CANCELLATION_ATTEMPTS})`
      );
    }
  },

  async processCancellation(
  rideId: string,
  userId: Types.ObjectId,
  userRole: Role,
  reason: CancellationReason
): Promise<IRide> {
  // Define who cancelled the ride
  const cancelledBy = userRole === Role.ADMIN || userRole === Role.SUPER_ADMIN 
    ? 'system' 
    : userRole.toLowerCase(); // or keep as enum value

  const update = {
    status: 'cancelled',
    cancelledAt: new Date(),
    cancelledBy,  // Now properly typed
    cancellationReason: reason,
    $push: {
      cancellationHistory: {
        userId,
        reason,
        timestamp: new Date(),
      },
    },
  };

  const session = await Ride.startSession();
  session.startTransaction();

  try {
    const updatedRide = await Ride.findByIdAndUpdate(
      rideId,
      update,
      { new: true, runValidators: true, session }
    ).populate('rider driver');

    if (!updatedRide) {
      throw new AppError(httpStatus.NOT_FOUND, "Ride not found");
    }

    // Add any additional business logic here (notifications, etc.)
    
    await session.commitTransaction();
    return updatedRide;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
},

async getRideRejectionHistory(rideId: string) {
  const ride = await Ride.findById(rideId)
    .populate({ 
      path: 'rejectionHistory.driver',
      select: 'name email phone'
    })
    .select('rejectionHistory');

  if (!ride) {
    throw new AppError(httpStatus.NOT_FOUND, "Ride not found");
  }
 
  // Check if rejectionHistory exists and has data
  console.log('Rejection history:', ride.rejectionHistory)
  return ride.rejectionHistory || [];
},

async submitFeedback(rideId: string, feedbackData: any) {
  const { userId, target, rating, review } = feedbackData;

  console.log('=== DEBUG: Feedback Submission ===');
  console.log('Received userId:', userId, 'Type:', typeof userId);
  console.log('Received target:', target);
  
  // Find the ride
  const ride = await Ride.findById(rideId);
  if (!ride) {
    throw new AppError(httpStatus.NOT_FOUND, "Ride not found");
  }
  
  console.log('Ride rider ID:', ride.rider.toString(), 'Type:', typeof ride.rider.toString());
  console.log('Ride driver ID:', ride.driver?.toString(), 'Type:', typeof ride.driver?.toString());

  const userIdString =  userId.toString()
  // Check if ride is completed
  if (ride.status !== 'completed') {
    throw new AppError(httpStatus.BAD_REQUEST, "Feedback can only be submitted for completed rides");
  }
  
  // Verify user is part of this ride
  const isRider = ride.rider.toString() === userIdString;
  const isDriver = ride.driver && ride.driver.toString() === userIdString;
  
  console.log('Is rider match:', isRider);
  console.log('Is driver match:', isDriver);
  console.log('Rider comparison:', ride.rider.toString(), '===', userId, '=', isRider);
  if (!isRider && !isDriver) {
    throw new AppError(httpStatus.FORBIDDEN, "User is not associated with this ride");
  }
  
  // Check if user is allowed to rate the target
  if (target === 'driver' && !isRider) {
    throw new AppError(httpStatus.FORBIDDEN, "Only riders can rate drivers");
  }
  
  if (target === 'rider' && !isDriver) {
    throw new AppError(httpStatus.FORBIDDEN, "Only drivers can rate riders");
  }
  
  // Check if feedback for this target already exists
  if (target === 'driver' && ride.driverRating) {
    throw new AppError(httpStatus.BAD_REQUEST, "Feedback for driver already submitted");
  }
  
  if (target === 'rider' && ride.riderRating) {
    throw new AppError(httpStatus.BAD_REQUEST, "Feedback for rider already submitted");
  }
  
  // Update ride with feedback
  if (target === 'driver') {
    ride.driverRating = rating;
    ride.driverReview = review;
  } else {
    ride.riderRating = rating;
    ride.riderReview = review;
  }
  
  ride.feedbackSubmittedAt = new Date();
  
  await ride.save();
  
  // If rating a driver, update driver's aggregated ratings
  if (target === 'driver' && ride.driver) {

    const driverProfile =  await DriverProfile.findById(ride.driver.toString())
    if(!driverProfile) {
    await this.updateDriverRatings(ride.driver.toString(), rating);
    }else { 
      console.log('Driver profile not found, skipping rating update');
    }
  }
  
  return ride;
},

async updateDriverRatings(driverId: string, newRating: number) {
  const driver = await DriverProfile.findById(driverId);
  
  if (!driver) {
    throw new AppError(httpStatus.NOT_FOUND, "Driver not found");
  }
  
  // Calculate new average rating
  const totalRatings = driver.totalRatings + 1;
  const averageRating = ((driver.averageRating * driver.totalRatings) + newRating) / totalRatings;
  
  // Update driver profile
  driver.averageRating = parseFloat(averageRating.toFixed(2)); // Round to 2 decimal places
  driver.totalRatings = totalRatings;
  
  await driver.save();
  
  return driver;
}

};
