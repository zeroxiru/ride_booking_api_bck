/* eslint-disable @typescript-eslint/no-unused-vars */
// src/modules/rider/rider.controller.ts

import httpStatus from "http-status-codes";
import { IUser } from "../user/user.interface";
import { Ride } from "../ride/ride.model";
import AppError from "../../errorHelpers/AppError";
import { requestRide, RiderServices } from "./rider.services";
import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/senResponse";



const getRideHistory = catchAsync(async(req: Request, res: Response)=>{ 
  const user = req.user as IUser;
    // Add explicit check for user._id
  if (!user?._id) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Invalid user credentials");
  }
  const result = await  RiderServices.getRiderHistory(user._id)

  sendResponse(res, { 
    success: true,
    statusCode: httpStatus.OK,
     message: "Ride history fetched successfully",
    data: result,

  })
})

const rideRequestHandler = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const user = req.user as IUser; // populated by auth middleware
  const { pickupLocation, destination, paymentMethod, estimatedFare } = req.body;

  if (!user || !user._id) {
    throw new AppError(httpStatus.UNAUTHORIZED, "User not authenticated");
  }

  const ride = await requestRide({
    rider: user,
    pickupLocation: pickupLocation ,
    destination: destination ,
    paymentMethod: paymentMethod,
    estimatedFare,
  });

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Ride requested successfully",
    data: ride,
  });
});



// const requestRideHandler = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     // Validate user exists on request
//     if (!req.user || !req.user._id) {
//       throw new AppError(httpStatus.UNAUTHORIZED, "Authentication required");
//     }

//     const ride = await requestRide({
//       rider: req.user,
//       pickupLocation: req.body.pickupLocation,
//       destination: req.body.destination,
//       paymentMethod: req.body.paymentMethod,
//       estimatedFare: req.body.estimatedFare
//     });
    
//     res.status(httpStatus.CREATED).json({
//       success: true,
//       message: 'Ride requested successfully',
//       data: ride
//     });
//   } catch (error) {
//     next(error);
//   }
// }


// const cancelRideHandler = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const ride = await cancelRide({
//       rideId: req.params.rideId,
//       riderId: req.user._id,
//       reason: req.body.reason
//     });

//     res.status(httpStatus.OK).json({
//       success: true,
//       message: 'Ride cancelled successfully',
//       data: ride
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// const getRideHistoryHandler = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const result = await getRideHistory({
//       riderId: req.user._id,
//       page: Number(req.query.page) || 1,
//       limit: Number(req.query.limit) || 10,
//       status: req.query.status as string | undefined
//     });

//     res.status(httpStatus.OK).json({
//       success: true,
//       message: 'Ride history retrieved successfully',
//       data: result.rides,
//       meta: result.meta
//     });
//   } catch (error) {
//     next(error);
//   }
// };

export  const RiderController = {
  rideRequestHandler,
  getRideHistory,
  //   getRideHistoryHandler
};
