/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status-codes";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/senResponse";
import AppError from "../../errorHelpers/AppError";
import { RideServices } from "./ride.service";
import { Role } from "../user/user.interface";
import { IUser } from "../user/user.interface"; // Import the user interface
import { rideValidations } from "./ride.validation";

// Extend the Express Request type to include your user type
declare module 'express' {
  interface Request {
    user?: IUser;
  }
}

const cancelRide = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const user = req.user;
  
  if (!user || !user._id) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Authentication required");
  }

  const { rideId } = req.params;
  const { reason } = req.body;

  const result = await RideServices.cancelRide({
    rideId,
    userId: user._id,
    userRole: user.role as Role, // Type assertion if needed
    reason
  });

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Ride cancelled successfully",
    data: result,
  });
});

const getRideRejectionHistory = catchAsync(async (req: Request, res: Response) => {
  const { rideId } = req.params;

  const rejections = await RideServices.getRideRejectionHistory(rideId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Ride rejection history fetched successfully",
    data: rejections
  });
});

 const submitFeedback = catchAsync(async (req: Request, res: Response) => {
  // Validate request
  const validationResult = rideValidations.submitFeedbackSchema.safeParse({
    body: req.body,
    params: req.params
  });

  if (!validationResult.success) {
    const errorMessage = validationResult.error.errors.map(e => e.message).join(', ');
    throw new AppError(httpStatus.BAD_REQUEST, errorMessage);
  }

  const { rideId } = req.params;
  const feedbackData = req.body;

  const userId =  req.user?._id;
  if(!userId){ 
    throw new AppError(httpStatus.UNAUTHORIZED, "User not authenticated")
  }

  //Pass userId along with feedback data


  const updatedRide = await RideServices.submitFeedback(rideId, {
    ...feedbackData,
    userId

  });

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Feedback submitted successfully",
    data: updatedRide
  });
});
export const RideController = {
  cancelRide,
  getRideRejectionHistory,
  submitFeedback
  
};