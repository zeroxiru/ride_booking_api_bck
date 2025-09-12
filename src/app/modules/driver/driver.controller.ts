/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Request, Response } from "express";
import httpStatus from "http-status-codes";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/senResponse";
import { DriverServices } from "./driver.service";
import { IUser } from "../user/user.interface";

const  acceptRide = catchAsync(async (req: Request, res: Response)=> { 
    const user =  req.user as IUser;
    const {rideId} =  req.params;

    const ride = await DriverServices.acceptRide({
        rideId,
        driverId: user._id!
    })
    sendResponse(res, { 
        success: true,
        statusCode: httpStatus.OK,
        message: "Ride accepted successfully",
        data: ride
    })
})

const rejectRide = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as IUser;
  const { rideId } = req.params;
  const { reason } = req.body;

  const ride = await DriverServices.rejectRide({
    rideId,
    driverId: user._id!,
    reason
  });

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Ride rejected successfully",
    data: ride
  });
});

const updateAvailability = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as IUser;
  const { isOnline, currentLocation } = req.body;

  const driver = await DriverServices.updateAvailability({
    driverId: user._id!,
    isOnline,
    currentLocation
  });

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Availability updated successfully",
    data: driver
  });
});

const updateRideStatus = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as IUser;
  const { rideId } = req.params;
  const { status } = req.body;

  const ride = await DriverServices.updateRideStatus({
    rideId,
    driverId: user._id!,
    status
  });

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Ride status updated successfully",
    data: ride
  });
});

const getEarningsHistory = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as IUser;
  const { startDate, endDate, page, limit } = req.query;

  const result = await DriverServices.getEarningsHistory({
    driverId: user._id! ,
    startDate: startDate as string,
    endDate: endDate as string,
    page: parseInt(page as string) || 1,
    limit: parseInt(limit as string) || 10
  });

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Earnings history fetched successfully",
    data: result.earnings,
    meta: result.meta
  });
});

const updateDriverProfile = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as IUser;
  const updateData = req.body;

  const driverProfile = await DriverServices.updateDriverProfile({
    driverId: user._id!,
    updateData
  });

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Driver profile updated successfully",
    data: driverProfile
  });
});

const getDriverProfile = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as IUser;

  const driverProfile = await DriverServices.getDriverProfile(user._id!);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Driver profile fetched successfully",
    data: driverProfile
  });
});

const getDriverRejectionHistory = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as IUser;
  const { startDate, endDate, page, limit } = req.query;

  const result = await DriverServices.getDriverRejectionHistory({
    driverId: user._id!,
    startDate: startDate as string,
    endDate: endDate as string,
    page: parseInt(page as string) || 1,
    limit: parseInt(limit as string) || 10
  });

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Rejection history fetched successfully",
    data: result.rejections,
    meta: result.meta
  });
});


export const  DriverController ={ 
    acceptRide,
    rejectRide,
    updateAvailability,
    updateRideStatus,
    getEarningsHistory,
    updateDriverProfile,
    getDriverProfile,
    getDriverRejectionHistory
}