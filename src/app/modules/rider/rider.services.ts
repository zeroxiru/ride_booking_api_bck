/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-inferrable-types */
import { Types } from "mongoose";
import { Ride } from "../ride/ride.model";
// import { IRide, RideStatus } from "../rider/ride.interface";
import { IUser } from "../user/user.interface";
import  AppError  from "../../errorHelpers/AppError";
import httpStatus from "http-status-codes";
import { IRide } from "../ride/ride.interface";

// export const requestRide = async (
//   user: IUser,
//   pickupLocation: {
//     address: string;
//     coordinates: [number, number];
//   },
//   destination: {
//     address: string;
//     coordinates: [number, number];
//   },
//   paymentMethod: 'cash' | 'card' | 'mobile_money',
//   estimatedFare: number
// ) => {
//   // Check if user has any active rides
//   const activeRide = await Ride.findOne({
//     rider: user._id,
//     status: { $in: ['requested', 'accepted', 'driver_arrived', 'in_progress'] }
//   });

//   if (activeRide) {
//     throw new AppError(httpStatus.BAD_REQUEST, "You already have an active ride");
//   }

//   const ride = await Ride.create({
//     rider: user._id,
//     pickupLocation: {
//       type: 'Point',
//       coordinates: pickupLocation.coordinates,
//       address: pickupLocation.address
//     },
//     destination: {
//       type: 'Point',
//       coordinates: destination.coordinates,
//       address: destination.address
//     },
//     status: 'requested',
//     paymentMethod,
//     estimatedFare
//   });

//   return ride;
// };


export const requestRide = async (data: {
  rider: IUser;
  pickupLocation: {
    address: string;
    coordinates: [number, number];
  };
  destination: {
    address: string;
    coordinates: [number, number];
  };
  paymentMethod: "cash" | "card" | "mobile_money";
  estimatedFare: number;
}) => {

    if (!data.rider || !data.rider._id) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Invalid rider information"
    );
  }

  // Check if user has any active rides
  const activeRide = await Ride.findOne({
    rider: data.rider._id,
    status: { $in: ["requested", "accepted", "driver_arrived", "in_progress"] },
  });

  if (activeRide) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "You already have an active ride"
    );
  }

  const ride = await Ride.create({
    rider: data.rider._id,
    pickupLocation: {
      type: "Point",
      coordinates: data.pickupLocation.coordinates,
      address: data.pickupLocation.address,
    },
    destination: {
      type: "Point",
      coordinates: data.destination.coordinates,
      address: data.destination.address,
    },
    status: "requested",
    paymentMethod: data.paymentMethod,
    estimatedFare: data.estimatedFare,
  });

  return ride;
};

export const RiderServices = { 
  async getRiderHistory(riderId: Types.ObjectId): Promise<IRide[]>{ 
    return Ride.find({ rider: riderId})
    .sort({createdAt: -1})
    .populate("driver", "name phone vechile")
    .lean()
    
  }}

// export const cancelRide = async (rideId: string, userId: Types.ObjectId, reason?: string) => {
//   const ride = await Ride.findOne({
//     _id: rideId,
//     rider: userId
//   });

//   if (!ride) {
//     throw new AppError(httpStatus.NOT_FOUND, "Ride not found");
//   }

//   // Check if ride can be cancelled (only in requested or accepted status)
//   if (!['requested', 'accepted'].includes(ride.status)) {
//     throw new AppError(httpStatus.BAD_REQUEST, "Ride cannot be cancelled at this stage");
//   }

//   ride.status = 'cancelled';
//   ride.cancelledBy = 'rider';
//   ride.cancellationReason = reason;
//   ride.cancelledAt = new Date();
  
//   await ride.save();

//   return ride;
// };

